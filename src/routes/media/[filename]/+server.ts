import { readFile } from 'node:fs/promises';
import { basename, extname, resolve } from 'node:path';
import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const contentTypes: Record<string, string> = {
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.webp': 'image/webp',
	'.gif': 'image/gif'
};

export const GET: RequestHandler = async ({ params }) => {
	if (params.filename !== basename(params.filename)) error(400, 'Invalid filename');
	const contentType = contentTypes[extname(params.filename).toLowerCase()];
	if (!contentType) error(404, 'Image not found');
	try {
		const body = await readFile(resolve(env.CONTENT_UPLOAD_DIR || 'data/uploads', params.filename));
		return new Response(body, {
			headers: {
				'content-type': contentType,
				'cache-control': 'public, max-age=31536000, immutable'
			}
		});
	} catch {
		error(404, 'Image not found');
	}
};
