import { publishedPosts } from '$lib/content';
import type { PageLoad } from './$types';

export const load: PageLoad = () => ({
	posts: publishedPosts('oldblog').map(({ body: _, ...post }) => post)
});
