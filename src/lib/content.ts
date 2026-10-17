import rawPosts from '$lib/content/posts.json';

export type Post = {
	slug: string;
	collection: 'blog' | 'oldblog';
	title: string;
	excerpt: string;
	body: string;
	image: string | null;
	imageAlt: string;
	published: string;
	modified: string;
	priority?: number;
	author: string;
	categories: string[];
	tags: string[];
	seoTitle: string;
	seoDescription: string;
};

const allPosts = rawPosts as Post[];

export const canonicalBlogSlugs = {
	j32m6wn1936rr2q6gfzmli8e09dzy8: 'city-of-ojai-vs-unincorporated-ojai',
	'4mxwfr4srddgiant9yhtjkl9yfkyw5': 'when-selling-a-home-in-ojai-makes-sense',
	s01ytot6p31iyk0hazl354vdr4jssw: 'what-is-escrow-in-california-real-estate',
	t3d9mdyupt5np84lflpm8fcdoz95fj: 'ventura-and-santa-barbara-coastal-and-valley-real-estate-markets'
} as const;

function canonicalize(post: Post): Post {
	if (post.collection !== 'blog') return post;
	const slug = canonicalBlogSlugs[post.slug as keyof typeof canonicalBlogSlugs];
	return slug ? { ...post, slug } : post;
}

export function publishedPosts(collection?: Post['collection'], now = new Date()) {
	return allPosts
		.filter(
			(post) => (!collection || post.collection === collection) && new Date(post.published) <= now
		)
		.map(canonicalize)
		.sort((a, b) => Date.parse(b.published) - Date.parse(a.published));
}

export function findPost(collection: Post['collection'], slug: string, now = new Date()) {
	return publishedPosts(collection, now).find((post) => post.slug === slug);
}
