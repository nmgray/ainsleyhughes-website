import { z } from 'zod';
import { canonicalBlogSlugs, findPost, publishedPosts, type Post } from '$lib/content';
import { pages } from '$lib/content/pages';
import { reviewGroups } from '$lib/content/reviews';
import { neighborhoodMaps } from '$lib/config';
import {
	findManagedPost,
	managedReviews,
	publishedEditorial,
	publishedEditorialList,
	publishedManagedPosts,
	publishedManagedReviews,
	publishedMarketInsights,
	type EditorialRevision,
	type MarketInsights
} from '$lib/server/content-db';
import { renderMarkdown, sanitizeArticleHtml } from '$lib/server/markdown';

const image = z
	.string()
	.max(500)
	.refine((value) => /^(\/images\/|\/media\/)/.test(value), 'Use a hosted site image');

export const blogSchema = z.object({
	title: z.string().trim().min(3).max(180),
	excerpt: z.string().trim().min(10).max(1000),
	bodyMarkdown: z.string().trim().min(20).max(200_000),
	image: image.nullable(),
	imageAlt: z.string().trim().max(250),
	published: z.iso.datetime(),
	seoTitle: z.string().trim().min(3).max(180),
	seoDescription: z.string().trim().min(10).max(500),
	priority: z.number().int().min(0).max(999).optional()
});

export const neighborhoodSchema = z.object({
	title: z.string().trim().min(3).max(180),
	seoTitle: z.string().trim().min(3).max(180),
	seoDescription: z.string().trim().min(10).max(500),
	hero: image.nullable(),
	bodyMarkdown: z.string().trim().min(20).max(200_000)
});

export const marketSchema = z.object({
	headline: z.string().trim().min(3).max(180),
	summary: z.string().trim().min(20).max(2000),
	periodLabel: z.string().trim().min(4).max(80),
	sourceName: z.string().trim().min(3).max(180),
	sourceUrl: z.url().startsWith('https://'),
	sourceDate: z.iso.date(),
	metrics: z
		.array(
			z.object({
				label: z.string().trim().min(2).max(120),
				value: z.string().trim().min(1).max(80),
				note: z.string().trim().max(250)
			})
		)
		.min(1)
		.max(12)
});

export const reviewSchema = z.object({
	theme: z.string().trim().min(3).max(180),
	quote: z.string().trim().min(10).max(3000),
	reviewerName: z.string().trim().min(2).max(120),
	relationship: z.string().trim().max(100),
	sourceName: z.string().trim().min(2).max(120),
	sourceUrl: z.union([z.url().startsWith('https://'), z.literal('')]),
	publicationApproved: z.boolean(),
	priority: z.number().int().min(0).max(999)
});

export type BlogDraft = z.infer<typeof blogSchema>;
export type NeighborhoodDraft = z.infer<typeof neighborhoodSchema>;
export type MarketDraft = z.infer<typeof marketSchema>;
export type ReviewDraft = z.infer<typeof reviewSchema>;

export const neighborhoodSlugs = ['ojai-neighborhoods-1', ...Object.keys(neighborhoodMaps)];
export const originalReviewSlugs = reviewGroups.flatMap((group) =>
	group.reviews.map((review) => review.slug)
);

export function isEditorialResource(kind: string, slug: string) {
	if (kind === 'market') return slug === 'home';
	if (kind === 'neighborhood') return neighborhoodSlugs.includes(slug);
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 120) return false;
	if (kind === 'blog') return !(slug in canonicalBlogSlugs);
	if (kind !== 'review') return false;
	return (
		originalReviewSlugs.includes(slug) ||
		slug.startsWith('review-') ||
		(/^managed-[1-9]\d*$/.test(slug) &&
			managedReviews().some((review) => `managed-${review.id}` === slug))
	);
}

export function editorialSchema(kind: string) {
	if (kind === 'market') return marketSchema;
	if (kind === 'neighborhood') return neighborhoodSchema;
	if (kind === 'review') return reviewSchema;
	return blogSchema;
}

export function currentMarketUpdate(): MarketInsights | undefined {
	const revision = publishedEditorial<MarketDraft>('market', 'home');
	if (!revision) return publishedMarketInsights();
	return {
		...revision.content,
		id: revision.id,
		updated: revision.publishedAt ?? revision.createdAt,
		priority: 0,
		status: 'published'
	};
}

function toPublishedBlog(revision: EditorialRevision<BlogDraft>, baseline?: Post): Post {
	return {
		slug: revision.slug,
		collection: 'blog',
		...revision.content,
		body: renderMarkdown(revision.content.bodyMarkdown),
		modified: revision.publishedAt ?? revision.createdAt,
		priority: revision.content.priority ?? baseline?.priority ?? 0,
		author: baseline?.author ?? 'Ainsley Hughes',
		categories: baseline?.categories ?? [],
		tags: baseline?.tags ?? []
	};
}

export function currentBlogPosts(now = new Date()) {
	const baselines = [...publishedPosts('blog', now), ...publishedManagedPosts(now)];
	const posts = new Map(baselines.map((post) => [post.slug, post]));
	for (const revision of publishedEditorialList<BlogDraft>('blog')) {
		const baseline = posts.get(revision.slug);
		if (Date.parse(revision.content.published) <= now.valueOf())
			posts.set(revision.slug, toPublishedBlog(revision, baseline));
	}
	return [...posts.values()].sort(
		(a, b) =>
			(b.priority ?? 0) - (a.priority ?? 0) || Date.parse(b.published) - Date.parse(a.published)
	);
}

export function currentBlogPost(slug: string, now = new Date()) {
	return currentBlogPosts(now).find((post) => post.slug === slug);
}

export function blogBaseline(slug: string) {
	return findManagedPost(slug) ?? findPost('blog', slug);
}

export function currentNeighborhood(slug: string) {
	const revision = publishedEditorial<NeighborhoodDraft>('neighborhood', slug);
	if (!revision) return null;
	return {
		title: revision.content.title,
		seoTitle: revision.content.seoTitle,
		seoDescription: revision.content.seoDescription,
		hero: revision.content.hero ?? pages[slug]?.hero ?? '',
		html: sanitizeArticleHtml(renderMarkdown(revision.content.bodyMarkdown))
	};
}

export function reviewBaseline(slug: string) {
	const original = reviewGroups
		.flatMap((group) => group.reviews.map((review) => ({ ...review, theme: group.theme })))
		.find((review) => review.slug === slug);
	if (original)
		return {
			theme: original.theme,
			quote: original.quote,
			reviewerName: original.reviewer,
			relationship: original.relationship,
			sourceName: original.source,
			sourceUrl: '',
			publicationApproved: false,
			priority: 0
		};
	if (/^managed-[1-9]\d*$/.test(slug))
		return managedReviews().find((review) => `managed-${review.id}` === slug) ?? null;
	return null;
}

export function currentReviews() {
	const revisions = publishedEditorialList<ReviewDraft>('review');
	const published = new Map(revisions.map((revision) => [revision.slug, revision.content]));
	const groups = reviewGroups.map((group) => ({
		theme: group.theme,
		intro: group.intro,
		reviews: group.reviews.map((review) => {
			const override = published.get(review.slug);
			return override
				? {
						...review,
						quote: override.quote,
						reviewer: override.reviewerName,
						relationship: override.relationship,
						source: override.sourceName,
						sourceUrl: override.sourceUrl
					}
				: { ...review, sourceUrl: '' };
		})
	}));
	const managed = publishedManagedReviews().map((review) => {
		const override = published.get(`managed-${review.id}`);
		return override
			? {
					...review,
					...override,
					id: review.id,
					updated:
						revisions.find((item) => item.slug === `managed-${review.id}`)?.publishedAt ??
						review.updated
				}
			: review;
	});
	const managedSlugs = new Set(managed.map((review) => `managed-${review.id}`));
	const additions = revisions
		.filter(
			(revision) => !originalReviewSlugs.includes(revision.slug) && !managedSlugs.has(revision.slug)
		)
		.map((revision) => ({
			...revision.content,
			id: revision.id,
			updated: revision.publishedAt ?? revision.createdAt,
			status: 'published' as const,
			rating: null
		}));
	return {
		reviewGroups: groups,
		managedReviews: [...managed, ...additions].sort(
			(a, b) => b.priority - a.priority || b.updated.localeCompare(a.updated)
		)
	};
}
