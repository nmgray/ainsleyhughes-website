import type { Handle } from '@sveltejs/kit';
import { adminCookie, verifyAdminToken } from '$lib/server/admin-auth';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.isAdmin = verifyAdminToken(event.cookies.get(adminCookie));
	const response = await resolve(event);
	response.headers.set('x-content-type-options', 'nosniff');
	response.headers.set('x-frame-options', 'SAMEORIGIN');
	response.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
	response.headers.set('permissions-policy', 'camera=(), microphone=(), geolocation=()');
	return response;
};
