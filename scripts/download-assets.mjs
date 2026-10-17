import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, extname } from 'node:path';

const origin = process.env.SOURCE_SITE ?? 'https://www.ainsleyhughes.com';
const assetsDirectory = new URL('../static/images/migrated/', import.meta.url);
const postsPath = new URL('../src/lib/content/posts.json', import.meta.url);
const manifestPath = new URL('../src/lib/content/assets.json', import.meta.url);

const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
const sitemapPaths = [
	...sitemap.matchAll(/<loc>https:\/\/www\.ainsleyhughes\.com([^<]*)<\/loc>/g)
].map((match) => match[1]);
const staticPaths = [
	'/',
	'/about',
	'/buy',
	'/sell',
	'/contact',
	'/ojai-real-estate-reviews',
	'/featured-properties',
	'/buyers-consultation',
	'/magazine',
	'/market-stats',
	'/ojai-neighborhoods-1',
	'/ojaiterrace',
	'/taormina',
	'/meiners-oaks-ojai',
	'/downtown-ojai'
];
const paths = [...new Set([...staticPaths, ...sitemapPaths])];
const sources = new Map();

function addAsset(rawUrl, route) {
	if (!rawUrl) return;
	const decoded = rawUrl.replaceAll('&amp;', '&').replace(/^\/\//, 'https://');
	if (
		!decoded.startsWith('https://images.squarespace-cdn.com/') &&
		!decoded.startsWith('https://static1.squarespace.com/')
	)
		return;
	const canonical = decoded.split('?')[0];
	const routes = sources.get(canonical) ?? new Set();
	routes.add(route);
	sources.set(canonical, routes);
}

function collect(value, route) {
	if (typeof value === 'string') {
		if (value.startsWith('//images.squarespace-cdn.com/')) addAsset(value, route);
		if (value.startsWith('https://static1.squarespace.com/')) addAsset(value, route);
		for (const match of value.matchAll(
			/https:\/\/(?:images\.squarespace-cdn\.com|static1\.squarespace\.com)[^"' <>)?]+(?:\?[^"' <>)]*)?/g
		)) {
			addAsset(match[0], route);
		}
		return;
	}
	if (value && typeof value === 'object') {
		for (const nested of Object.values(value)) collect(nested, route);
	}
}

for (const path of paths) {
	const separator = path.includes('?') ? '&' : '?';
	const response = await fetch(`${origin}${path}${separator}format=json`);
	if (!response.ok) {
		console.warn(`Skipped ${path}: HTTP ${response.status}`);
		continue;
	}
	try {
		collect(await response.json(), path);
	} catch {
		console.warn(`Skipped non-JSON response for ${path}`);
	}
}

await mkdir(assetsDirectory, { recursive: true });
const manifest = {};
let downloaded = 0;

for (const [source, routes] of sources) {
	const response = await fetch(source);
	if (!response.ok) {
		console.warn(`Failed ${source}: HTTP ${response.status}`);
		continue;
	}
	const bytes = new Uint8Array(await response.arrayBuffer());
	const extension =
		extname(new URL(source).pathname).toLowerCase() ||
		(response.headers.get('content-type')?.includes('png') ? '.png' : '.jpg');
	const originalName = basename(new URL(source).pathname, extname(new URL(source).pathname))
		.replace(/[^a-z0-9-]+/gi, '-')
		.slice(0, 55);
	const hash = createHash('sha1').update(source).digest('hex').slice(0, 9);
	const filename = `${originalName || 'image'}-${hash}${extension}`;
	await writeFile(new URL(filename, assetsDirectory), bytes);
	manifest[source] = {
		path: `/images/migrated/${filename}`,
		routes: [...routes],
		bytes: bytes.length
	};
	downloaded += 1;
}

const posts = JSON.parse(await readFile(postsPath, 'utf8'));
for (const post of posts) {
	if (post.image) post.image = manifest[post.image.split('?')[0]]?.path ?? post.image;
}
await writeFile(postsPath, `${JSON.stringify(posts, null, '\t')}\n`);
await writeFile(manifestPath, `${JSON.stringify(manifest, null, '\t')}\n`);
console.log(`Downloaded ${downloaded} original assets referenced across ${paths.length} routes.`);
