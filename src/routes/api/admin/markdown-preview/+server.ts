import { json } from '@sveltejs/kit';
import { isSameOrigin } from '$lib/server/admin-auth';
import { renderMarkdown } from '$lib/server/markdown';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals, url }) => {
	if (!locals.isAdmin) return json({ error: 'Authentication required.' }, { status: 401 });
	if (!isSameOrigin(request, url))
		return json({ error: 'Invalid request origin.' }, { status: 403 });
	const payload = (await request.json()) as { markdown?: unknown };
	if (typeof payload.markdown !== 'string' || payload.markdown.length > 200_000) {
		return json({ error: 'Article content is invalid or too long.' }, { status: 400 });
	}
	return json({ html: renderMarkdown(payload.markdown) });
};
