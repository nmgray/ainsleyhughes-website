import { timingSafeEqual } from 'node:crypto';
import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import { checkRateLimit } from '$lib/server/rate-limit';

const headers = { 'cache-control': 'no-store' };

export function editorialJson(body: unknown, status = 200) {
	return json(body, { status, headers });
}

export async function authorizeEditorial(request: Request, clientAddress: string, write = false) {
	const secret = env.EDITOR_API_KEY;
	if (!secret || secret.length < 32) {
		return editorialJson({ error: 'Editorial API is not configured.' }, 503);
	}
	const token = request.headers.get('authorization')?.replace(/^Bearer /, '') ?? '';
	const given = Buffer.from(token);
	const expected = Buffer.from(secret);
	if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
		return editorialJson({ error: 'Authentication required.' }, 401);
	}
	if (write && !(await checkRateLimit(`editorial:${clientAddress}`, 60, 60_000))) {
		return editorialJson({ error: 'Too many editorial requests.' }, 429);
	}
	return null;
}
