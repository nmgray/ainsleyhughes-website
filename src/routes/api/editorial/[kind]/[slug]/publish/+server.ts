import { z } from 'zod';
import {
	editorialRevision,
	publishEditorialRevision,
	publishedEditorial,
	type EditorialKind
} from '$lib/server/content-db';
import { authorizeEditorial, editorialJson } from '$lib/server/editorial-api';
import { isEditorialResource, type ReviewDraft } from '$lib/server/editorial';
import type { RequestHandler } from './$types';

const requestSchema = z.strictObject({
	revisionId: z.number().int().positive(),
	expectedPublishedRevision: z.number().int().positive().nullable(),
	confirm: z.literal(true)
});

export const POST: RequestHandler = async ({ request, params, getClientAddress }) => {
	const denied = await authorizeEditorial(request, getClientAddress(), true);
	if (denied) return denied;
	const { kind, slug } = params;
	if (!isEditorialResource(kind, slug)) return editorialJson({ error: 'Unknown resource.' }, 404);
	let input: unknown;
	try {
		input = await request.json();
	} catch {
		return editorialJson({ error: 'Expected JSON.' }, 400);
	}
	const parsed = requestSchema.safeParse(input);
	if (!parsed.success) {
		return editorialJson(
			{ error: 'Publication requires explicit confirmation and revision IDs.' },
			400
		);
	}
	const current = publishedEditorial(kind as EditorialKind, slug)?.id ?? null;
	if (current !== parsed.data.expectedPublishedRevision)
		return editorialJson({ error: 'Published content changed. Review the latest revision.' }, 409);
	if (kind === 'review') {
		const review = editorialRevision<ReviewDraft>('review', slug, parsed.data.revisionId);
		if (
			review &&
			(!review.content.publicationApproved || !review.content.sourceUrl.startsWith('https://'))
		) {
			return editorialJson(
				{ error: 'Publishing a review requires republication approval and a source URL.' },
				400
			);
		}
	}
	if (!publishEditorialRevision(kind as EditorialKind, slug, parsed.data.revisionId))
		return editorialJson({ error: 'Revision not found for this resource.' }, 404);
	return editorialJson({ kind, slug, publishedRevision: parsed.data.revisionId });
};
