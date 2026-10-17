import { error, redirect } from '@sveltejs/kit';
import { canonicalBlogSlugs, findPost, publishedPosts } from '$lib/content';
import { articleLikeState, findManagedPost, publishedManagedPosts } from '$lib/server/content-db';
import { sanitizeArticleHtml } from '$lib/server/markdown';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params, cookies }) => {
	const canonical = canonicalBlogSlugs[params.slug as keyof typeof canonicalBlogSlugs];
	if (canonical) redirect(301, `/blog/${canonical}`);
	const source = findManagedPost(params.slug) ?? findPost('blog', params.slug);
	if (!source) error(404, 'Article not found');
	const posts = [...publishedPosts('blog'), ...publishedManagedPosts()].sort(
		(a, b) =>
			(b.priority ?? 0) - (a.priority ?? 0) || Date.parse(b.published) - Date.parse(a.published)
	);
	const index = posts.findIndex((post) => post.slug === source.slug);
	return {
		post: {
			...source,
			body: sanitizeArticleHtml(source.body)
		},
		engagement: articleLikeState(source.slug, cookies.get('article_voter')),
		previous: posts[index + 1]
			? { slug: posts[index + 1].slug, title: posts[index + 1].title }
			: null,
		next: posts[index - 1] ? { slug: posts[index - 1].slug, title: posts[index - 1].title } : null
	};
};
