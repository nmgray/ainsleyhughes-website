import { editorialRevision, publishedEditorial, type EditorialKind } from '$lib/server/content-db';
import { authorizeEditorial, editorialJson } from '$lib/server/editorial-api';
import { isEditorialResource, type BlogDraft, type NeighborhoodDraft } from '$lib/server/editorial';
import { renderMarkdown } from '$lib/server/markdown';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request, url, params, getClientAddress }) => {
	const denied = await authorizeEditorial(request, getClientAddress());
	if (denied) return denied;
	const { kind, slug } = params;
	if (!isEditorialResource(kind, slug)) return editorialJson({ error: 'Unknown resource.' }, 404);
	const id = Number(url.searchParams.get('revisionId'));
	if (!Number.isSafeInteger(id) || id < 1)
		return editorialJson({ error: 'A valid revisionId is required.' }, 400);
	const revision = editorialRevision<BlogDraft | NeighborhoodDraft>(
		kind as EditorialKind,
		slug,
		id
	);
	if (!revision) return editorialJson({ error: 'Revision not found.' }, 404);
	return editorialJson({
		revision,
		renderedHtml:
			kind === 'blog' || kind === 'neighborhood'
				? renderMarkdown(revision.content.bodyMarkdown)
				: null,
		currentPublishedRevision: publishedEditorial(kind as EditorialKind, slug)?.id ?? null
	});
};
