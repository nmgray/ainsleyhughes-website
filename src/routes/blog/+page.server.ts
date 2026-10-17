import { publishedPosts } from '$lib/content';
import { publishedManagedPosts } from '$lib/server/content-db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => {
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const tag = url.searchParams.get('tag');
	const category = url.searchParams.get('category');
	const pageSize = 20;
	const filtered = [...publishedPosts('blog'), ...publishedManagedPosts()]
		.sort(
			(a, b) =>
				(b.priority ?? 0) - (a.priority ?? 0) || Date.parse(b.published) - Date.parse(a.published)
		)
		.filter(
			(post) =>
				(!tag || post.tags.includes(tag)) && (!category || post.categories.includes(category))
		);
	return {
		posts: filtered
			.slice((page - 1) * pageSize, page * pageSize)
			.map(({ body: _, ...post }) => post),
		page,
		pages: Math.ceil(filtered.length / pageSize)
	};
};
