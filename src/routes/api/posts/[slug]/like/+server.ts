import { randomUUID } from 'node:crypto';
import { json } from '@sveltejs/kit';
import { findPost } from '$lib/content';
import { findManagedPost, toggleArticleLike } from '$lib/server/content-db';
import { checkRateLimit } from '$lib/server/rate-limit';
import type { RequestHandler } from './$types';

const voterCookie = 'article_voter';

export const POST: RequestHandler = async ({ params, request, url, cookies, getClientAddress }) => {
	if (request.headers.get('origin') !== url.origin) {
		return json({ message: 'This request origin is not allowed.' }, { status: 403 });
	}
	if (!(await checkRateLimit(`article-like:${getClientAddress()}`, 30, 60_000))) {
		return json({ message: 'Too many requests. Please wait and try again.' }, { status: 429 });
	}
	if (!/^[a-z0-9-]{1,160}$/.test(params.slug)) {
		return json({ message: 'Article not found.' }, { status: 404 });
	}
	const article = findManagedPost(params.slug) ?? findPost('blog', params.slug);
	if (!article) return json({ message: 'Article not found.' }, { status: 404 });

	const voterId = cookies.get(voterCookie) ?? randomUUID();
	if (!cookies.get(voterCookie)) {
		cookies.set(voterCookie, voterId, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: url.protocol === 'https:',
			maxAge: 365 * 24 * 60 * 60
		});
	}
	return json(toggleArticleLike(article.slug, voterId));
};
