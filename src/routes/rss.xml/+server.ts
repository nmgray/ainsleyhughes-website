import { publishedPosts } from '$lib/content';
import { site } from '$lib/config';
import { publishedManagedPosts } from '$lib/server/content-db';
import type { RequestHandler } from './$types';

const escapeXml = (value: string) =>
	value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

export const GET: RequestHandler = () => {
	const items = [...publishedPosts('blog'), ...publishedManagedPosts()]
		.sort((a, b) => Date.parse(b.published) - Date.parse(a.published))
		.slice(0, 30)
		.map(
			(post) => `<item>
<title>${escapeXml(post.title)}</title>
<link>${site.origin}/blog/${post.slug}</link>
<guid>${site.origin}/blog/${post.slug}</guid>
<pubDate>${new Date(post.published).toUTCString()}</pubDate>
<description>${escapeXml(post.excerpt)}</description>
</item>`
		)
		.join('');
	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${site.name} Real Estate Insights</title><link>${site.origin}/blog</link><description>${escapeXml(site.description)}</description>${items}</channel></rss>`,
		{ headers: { 'content-type': 'application/rss+xml; charset=utf-8' } }
	);
};
