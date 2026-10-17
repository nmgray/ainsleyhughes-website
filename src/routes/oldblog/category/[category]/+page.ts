import { publishedPosts } from '$lib/content';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const category = decodeURIComponent(params.category.replaceAll('+', ' '));
	return {
		category,
		posts: publishedPosts('oldblog')
			.filter((post) =>
				post.categories.some((item) => item.toLowerCase() === category.toLowerCase())
			)
			.map(({ body: _, ...post }) => post)
	};
};
