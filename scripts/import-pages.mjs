import { writeFile, readFile } from 'node:fs/promises';
import sanitizeHtml from 'sanitize-html';

const origin = process.env.SOURCE_SITE ?? 'https://www.ainsleyhughes.com';
const outputPath = new URL('../src/lib/content/static-pages.json', import.meta.url);
const manifest = JSON.parse(
	await readFile(new URL('../src/lib/content/assets.json', import.meta.url), 'utf8')
);
const routes = [
	'about',
	'buy',
	'sell',
	'contact',
	'ojai-real-estate-reviews',
	'featured-properties',
	'buyers-consultation',
	'magazine',
	'market-stats',
	'how-i-work',
	'ojaiterrace',
	'taormina',
	'ojai-neighborhoods-1',
	'meiners-oaks-ojai',
	'downtown-ojai'
];

const localAsset = (value = '') => {
	const source = value.replaceAll('&amp;', '&').split('?')[0];
	return manifest[source]?.path ?? source;
};

const pages = {};
for (const slug of routes) {
	const response = await fetch(`${origin}/${slug}?format=json`);
	if (!response.ok) throw new Error(`${response.status} while importing /${slug}`);
	const source = await response.json();
	const raw = source.mainContent ?? '';
	const heroMatch = raw.match(/(?:data-src|src)="(https:\/\/images\.squarespace-cdn\.com[^"]+)"/i);
	const html = sanitizeHtml(raw, {
		allowedTags: [
			'h1',
			'h2',
			'h3',
			'h4',
			'p',
			'ul',
			'ol',
			'li',
			'blockquote',
			'strong',
			'em',
			'a',
			'img',
			'figure',
			'figcaption',
			'br',
			'hr'
		],
		allowedAttributes: {
			a: ['href', 'title', 'target'],
			img: ['src', 'data-src', 'alt', 'width', 'height', 'loading']
		},
		allowedSchemes: ['http', 'https', 'mailto', 'tel'],
		transformTags: {
			h1: 'h2',
			img: (_name, attributes) => ({
				tagName: 'img',
				attribs: {
					src: localAsset(attributes['data-src'] || attributes.src),
					alt: attributes.alt || source.collection?.title || '',
					loading: 'lazy'
				}
			}),
			a: (_name, attributes) => ({
				tagName: 'a',
				attribs: {
					href: attributes.href || '#',
					...(attributes.href?.startsWith('http')
						? { target: '_blank', rel: 'noopener noreferrer' }
						: {})
				}
			})
		}
	})
		.replace(/<p>\s*<\/p>/g, '')
		.trim();

	pages[slug] = {
		slug,
		title: source.collection?.title ?? slug,
		seoTitle: source.collection?.seoData?.seoTitle ?? source.collection?.title ?? slug,
		seoDescription: source.collection?.seoData?.seoDescription ?? '',
		hero: localAsset(heroMatch?.[1]),
		html
	};
}

await writeFile(outputPath, `${JSON.stringify(pages, null, '\t')}\n`);
console.log(`Imported ${Object.keys(pages).length} static page bodies.`);
