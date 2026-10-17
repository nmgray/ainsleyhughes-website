import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { env } from '$env/dynamic/private';

const allowedImages = new Map([
	['image/jpeg', '.jpg'],
	['image/png', '.png'],
	['image/webp', '.webp'],
	['image/gif', '.gif']
]);

export async function saveContentImage(upload: File) {
	const extension = allowedImages.get(upload.type);
	if (!extension || upload.size > 10 * 1024 * 1024) {
		throw new Error('Upload a JPG, PNG, WebP, or GIF no larger than 10 MB.');
	}
	const directory = resolve(env.CONTENT_UPLOAD_DIR || 'data/uploads');
	await mkdir(directory, { recursive: true });
	const filename = `${randomUUID()}${extension}`;
	await writeFile(resolve(directory, filename), Buffer.from(await upload.arrayBuffer()));
	return `/media/${filename}`;
}
