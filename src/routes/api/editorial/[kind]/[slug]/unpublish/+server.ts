import { z } from 'zod';
import { unpublishEditorial, type EditorialKind } from '$lib/server/content-db';
import { authorizeEditorial, editorialJson } from '$lib/server/editorial-api';
import { isEditorialResource } from '$lib/server/editorial';
import type { RequestHandler } from './$types';

const requestSchema = z.strictObject({
	expectedPublishedRevision: z.number().int().positive(),
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
	if (!parsed.success)
		return editorialJson({ error: 'Removal requires the current revision and confirmation.' }, 400);
	if (!unpublishEditorial(kind as EditorialKind, slug, parsed.data.expectedPublishedRevision))
		return editorialJson({ error: 'Published content changed. Review the latest revision.' }, 409);
	return editorialJson({ kind, slug, publishedRevision: null });
};
