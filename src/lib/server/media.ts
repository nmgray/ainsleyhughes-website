import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { env } from '$env/dynamic/private';
import sharp, { type Metadata } from 'sharp';

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
	const bytes = Buffer.from(await upload.arrayBuffer());
	let metadata: Metadata;
	try {
		metadata = await sharp(bytes).metadata();
	} catch {
		throw new Error('The uploaded file is not a valid image.');
	}
	if (
		metadata.format !== upload.type.slice('image/'.length) ||
		!metadata.width ||
		!metadata.height ||
		metadata.width * metadata.height > 40_000_000
	) {
		throw new Error('The uploaded image format or dimensions are not supported.');
	}
	const directory = resolve(env.CONTENT_UPLOAD_DIR || 'data/uploads');
	await mkdir(directory, { recursive: true });
	const filename = `${randomUUID()}${extension}`;
	await writeFile(resolve(directory, filename), bytes);
	return `/media/${filename}`;
}
