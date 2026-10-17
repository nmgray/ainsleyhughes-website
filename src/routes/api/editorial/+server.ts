import { publishedPosts } from '$lib/content';
import {
	editorialHistory,
	editorialSlugs,
	managedReviews,
	publishedEditorial,
	publishedEditorialList
} from '$lib/server/content-db';
import { authorizeEditorial, editorialJson } from '$lib/server/editorial-api';
import { currentBlogPosts, neighborhoodSlugs, originalReviewSlugs } from '$lib/server/editorial';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request, getClientAddress }) => {
	const denied = await authorizeEditorial(request, getClientAddress());
	if (denied) return denied;
	const blogs = new Set([
		...publishedPosts('blog').map((post) => post.slug),
		...currentBlogPosts().map((post) => post.slug),
		...publishedEditorialList('blog').map((revision) => revision.slug),
		...editorialSlugs('blog')
	]);
	const reviews = new Set([
		...originalReviewSlugs,
		...managedReviews().map((review) => `managed-${review.id}`),
		...editorialSlugs('review')
	]);
	return editorialJson({
		market: {
			slug: 'home',
			publishedRevision: publishedEditorial('market', 'home')?.id ?? null
		},
		neighborhoods: neighborhoodSlugs.map((slug) => ({
			slug,
			publishedRevision: publishedEditorial('neighborhood', slug)?.id ?? null
		})),
		blog: [...blogs].sort().map((slug) => ({
			slug,
			publishedRevision: publishedEditorial('blog', slug)?.id ?? null,
			latestRevision: editorialHistory('blog', slug)[0]?.id ?? null
		})),
		reviews: [...reviews].sort().map((slug) => ({
			slug,
			publishedRevision: publishedEditorial('review', slug)?.id ?? null,
			latestRevision: editorialHistory('review', slug)[0]?.id ?? null
		}))
	});
};
