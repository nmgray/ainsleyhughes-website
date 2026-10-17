import { currentBlogPosts } from '$lib/server/editorial';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => {
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const tag = url.searchParams.get('tag');
	const category = url.searchParams.get('category');
	const pageSize = 20;
	const filtered = currentBlogPosts().filter(
		(post) => (!tag || post.tags.includes(tag)) && (!category || post.categories.includes(category))
	);
	return {
		posts: filtered
			.slice((page - 1) * pageSize, page * pageSize)
			.map(({ body: _, ...post }) => post),
		page,
		pages: Math.ceil(filtered.length / pageSize)
	};
};
