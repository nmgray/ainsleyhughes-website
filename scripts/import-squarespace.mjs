import { mkdir, writeFile } from 'node:fs/promises';

const ORIGIN = process.env.SOURCE_SITE ?? 'https://www.ainsleyhughes.com';
const outputDirectory = new URL('../src/lib/content/', import.meta.url);
const legacyTitleFallbacks = {
	uyh7oj7d55l8zi83oc196t94p3r1dc: 'Let’s Go for a Walk!',
	azks6uczo6tha26liq09zu0rq8ammp: 'Parking Lot Mix-up'
};

const decodeEntities = (value) =>
	value
		.replace(/&nbsp;|&#160;/gi, ' ')
		.replace(/&amp;/gi, '&')
		.replace(/&quot;/gi, '"')
		.replace(/&#39;|&apos;/gi, "'")
		.replace(/&ldquo;|&rdquo;/gi, '"')
		.replace(/&lsquo;|&rsquo;/gi, "'")
		.replace(/&mdash;/gi, '—')
		.replace(/&ndash;/gi, '–');

const cleanHtml = (value = '') =>
	decodeEntities(value)
		.replace(/<script[\s\S]*?<\/script>/gi, '')
		.replace(/<style[\s\S]*?<\/style>/gi, '')
		.replace(/<div[^>]*class="[^"]*(?:sqs-block-content|sqs-html-content)[^"]*"[^>]*>/gi, '')
		.replace(/<figure[\s\S]*?<\/figure>/gi, '')
		.replace(/<\/?div[^>]*>/gi, '')
		.replace(/\s(?:class|style|data-[\w-]+|id)="[^"]*"/gi, '')
		.replace(/<h1([^>]*)>/gi, '<h2$1>')
		.replace(/<\/h1>/gi, '</h2>')
		.replace(/\s{2,}/g, ' ')
		.trim();

const text = (value = '') =>
	cleanHtml(value)
		.replace(/<[^>]+>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

function imageFor(item) {
	const bodyImage = item.body?.match(
		/(?:data-src|src)="(https:\/\/images\.squarespace-cdn\.com[^"]+)"/i
	);
	return bodyImage?.[1] ?? item.mainImage?.assetUrl ?? item.assetUrl ?? null;
}

async function fetchCollection(path) {
	const items = [];
	let url = `${ORIGIN}/${path}?format=json`;
	do {
		const response = await fetch(url, { headers: { accept: 'application/json' } });
		if (!response.ok) throw new Error(`${response.status} while requesting ${url}`);
		const page = await response.json();
		items.push(...(page.items ?? []));
		url = page.pagination?.nextPageUrl
			? new URL(`${page.pagination.nextPageUrl}&format=json`, ORIGIN).toString()
			: null;
	} while (url);
	return items;
}

function normalize(item, collection) {
	const published = new Date(item.publishOn ?? item.addedOn).toISOString();
	const modified = new Date(item.updatedOn ?? item.publishOn ?? item.addedOn).toISOString();
	const body = cleanHtml(item.body);
	const title = text(item.title) || legacyTitleFallbacks[item.urlId];
	return {
		slug: item.urlId,
		collection,
		title,
		excerpt: text(item.excerpt || body).slice(0, 240),
		body,
		image: imageFor(item),
		imageAlt: title,
		published,
		modified,
		author: 'Ainsley Hughes',
		categories: item.categories ?? [],
		tags: item.tags ?? [],
		seoTitle: text(item.seoData?.seoTitle || title),
		seoDescription: text(item.seoData?.seoDescription || item.excerpt || body).slice(0, 160)
	};
}

await mkdir(outputDirectory, { recursive: true });
const current = (await fetchCollection('blog')).map((item) => normalize(item, 'blog'));
const legacy = (await fetchCollection('oldblog')).map((item) => normalize(item, 'oldblog'));
await writeFile(
	new URL('posts.json', outputDirectory),
	`${JSON.stringify([...current, ...legacy], null, '\t')}\n`
);
console.log(`Imported ${current.length} current and ${legacy.length} legacy posts.`);
