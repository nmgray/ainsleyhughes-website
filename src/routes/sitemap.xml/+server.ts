import { publishedPosts } from '$lib/content';
import { pages } from '$lib/content/pages';
import { site } from '$lib/config';
import { currentBlogPosts } from '$lib/server/editorial';
import type { RequestHandler } from './$types';

const fixed = [
	'',
	'about',
	'buy',
	'sell',
	'contact',
	'featured-properties',
	'ojai-real-estate-reviews',
	'buyers-consultation',
	'blog',
	'oldblog',
	'privacy'
];

const escapeXml = (value: string) =>
	value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

export const GET: RequestHandler = () => {
	const today = new Date().toISOString();
	const entries: { url: string; modified: string; image?: string | null; imageTitle?: string }[] = [
		...[
			...new Set([...fixed, ...Object.keys(pages).filter((path) => path !== 'market-stats')])
		].map((path) => ({
			url: `${site.origin}/${path}`,
			modified: today
		})),
		...[...publishedPosts('oldblog'), ...currentBlogPosts()].map((post) => ({
			url: `${site.origin}/${post.collection}/${post.slug}`,
			modified: post.modified,
			image: post.image?.startsWith('/') ? `${site.origin}${post.image}` : post.image,
			imageTitle: post.title
		}))
	];
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries
	.map(
		(entry) => `  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <lastmod>${entry.modified.slice(0, 10)}</lastmod>${
			entry.image
				? `
    <image:image><image:loc>${escapeXml(entry.image)}</image:loc><image:title>${escapeXml(entry.imageTitle ?? '')}</image:title></image:image>`
				: ''
		}
  </url>`
	)
	.join('\n')}
</urlset>`;
	return new Response(body, {
		headers: {
			'content-type': 'application/xml; charset=utf-8',
			'cache-control': 'public, max-age=3600'
		}
	});
};
