import { describe, expect, it } from 'vitest';
import { canonicalBlogSlugs, findPost, publishedPosts } from './content';

describe('published content', () => {
	it('preserves the current and legacy article inventory', () => {
		expect(publishedPosts('blog', new Date('2100-01-01')).length).toBeGreaterThanOrEqual(37);
		expect(publishedPosts('oldblog', new Date('2100-01-01')).length).toBeGreaterThanOrEqual(12);
		expect(
			publishedPosts(undefined, new Date('2100-01-01')).every(
				(post) => !post.image || post.image.startsWith('/images/migrated/')
			)
		).toBe(true);
	});

	it('does not expose future-dated posts', () => {
		const beforeFirstPost = publishedPosts('blog', new Date('2000-01-01'));
		expect(beforeFirstPost).toHaveLength(0);
	});

	it('finds an article by its original slug', () => {
		expect(
			findPost(
				'blog',
				'what-does-as-is-really-mean-in-california-real-estate',
				new Date('2100-01-01')
			)?.title
		).toContain('As-Is');
	});

	it('publishes descriptive canonical slugs for imported opaque URLs', () => {
		const posts = publishedPosts('blog', new Date('2100-01-01'));
		expect(
			posts.some((post) => post.slug === canonicalBlogSlugs.j32m6wn1936rr2q6gfzmli8e09dzy8)
		).toBe(true);
		expect(posts.some((post) => post.slug === 'j32m6wn1936rr2q6gfzmli8e09dzy8')).toBe(false);
	});
});
