import { pages } from '$lib/content/pages';
import staticPages from '$lib/content/static-pages.json';
import { z } from 'zod';
import {
	editorialHistory,
	publishedEditorial,
	publishedMarketInsights,
	saveEditorialDraft,
	type EditorialKind
} from '$lib/server/content-db';
import { authorizeEditorial, editorialJson } from '$lib/server/editorial-api';
import {
	blogBaseline,
	editorialSchema,
	isEditorialResource,
	originalReviewSlugs,
	reviewBaseline,
	reviewSchema
} from '$lib/server/editorial';
import type { RequestHandler } from './$types';

function baseline(kind: EditorialKind, slug: string) {
	if (kind === 'market') return publishedMarketInsights() ?? null;
	if (kind === 'blog') return blogBaseline(slug);
	if (kind === 'review') return reviewBaseline(slug);
	const source = (
		staticPages as Record<
			string,
			{ title: string; seoTitle: string; seoDescription: string; hero: string; html: string }
		>
	)[slug];
	return { content: pages[slug], source };
}

export const GET: RequestHandler = async ({ request, params, getClientAddress }) => {
	const denied = await authorizeEditorial(request, getClientAddress());
	if (denied) return denied;
	const { kind, slug } = params;
	if (!isEditorialResource(kind, slug)) return editorialJson({ error: 'Unknown resource.' }, 404);
	const editorialKind = kind as EditorialKind;
	return editorialJson({
		kind,
		slug,
		baseline: baseline(editorialKind, slug),
		published: publishedEditorial(editorialKind, slug),
		revisions: editorialHistory(editorialKind, slug).map(({ id, createdAt }) => ({
			id,
			createdAt
		}))
	});
};

export const POST: RequestHandler = async ({ request, params, getClientAddress }) => {
	const denied = await authorizeEditorial(request, getClientAddress(), true);
	if (denied) return denied;
	const { kind, slug } = params;
	if (!isEditorialResource(kind, slug)) return editorialJson({ error: 'Unknown resource.' }, 404);
	if (Number(request.headers.get('content-length')) > 250_000)
		return editorialJson({ error: 'Draft is too large.' }, 413);
	let input: unknown;
	try {
		const body = await request.text();
		if (body.length > 250_000) return editorialJson({ error: 'Draft is too large.' }, 413);
		input = JSON.parse(body);
	} catch {
		return editorialJson({ error: 'Expected a JSON draft.' }, 400);
	}
	const parsed = z
		.strictObject({
			content: editorialSchema(kind),
			expectedPublishedRevision: z.number().int().positive().nullable()
		})
		.safeParse(input);
	if (!parsed.success) {
		return editorialJson({ error: 'Invalid draft.', issues: parsed.error.issues }, 400);
	}
	if (kind === 'review' && originalReviewSlugs.includes(slug)) {
		const review = reviewSchema.parse(parsed.data.content);
		const original = reviewBaseline(slug);
		if (review.theme !== original?.theme || review.priority !== 0) {
			return editorialJson({ error: 'Original review group and order cannot be changed.' }, 400);
		}
	}
	const current = publishedEditorial(kind as EditorialKind, slug)?.id ?? null;
	if (parsed.data.expectedPublishedRevision !== current) {
		return editorialJson({ error: 'Published content changed. Refresh before drafting.' }, 409);
	}
	const revisionId = saveEditorialDraft(kind as EditorialKind, slug, parsed.data.content);
	return editorialJson({ kind, slug, revisionId, status: 'draft' }, 201);
};
