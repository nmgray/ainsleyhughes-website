import { authorizeEditorial, editorialJson } from '$lib/server/editorial-api';
import { saveContentImage } from '$lib/server/media';
import { z } from 'zod';
import type { RequestHandler } from './$types';

const uploadSchema = z.strictObject({
	mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
	base64: z
		.string()
		.min(1)
		.max(14_000_000)
		.regex(/^[A-Za-z0-9+/]+={0,2}$/)
});

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	const denied = await authorizeEditorial(request, getClientAddress(), true);
	if (denied) return denied;
	if (Number(request.headers.get('content-length')) > 14_100_000)
		return editorialJson({ error: 'Image is too large.' }, 413);
	let input: unknown;
	try {
		input = await request.json();
	} catch {
		return editorialJson({ error: 'Expected a JSON image upload.' }, 400);
	}
	const parsed = uploadSchema.safeParse(input);
	if (!parsed.success) return editorialJson({ error: 'Invalid image upload.' }, 400);
	const bytes = Buffer.from(parsed.data.base64, 'base64');
	if (bytes.length > 10 * 1024 * 1024) return editorialJson({ error: 'Image is too large.' }, 413);
	const image = new File([bytes], 'editorial-image', { type: parsed.data.mimeType });
	try {
		return editorialJson({ url: await saveContentImage(image) }, 201);
	} catch (error) {
		return editorialJson(
			{ error: error instanceof Error ? error.message : 'Image upload failed.' },
			400
		);
	}
};
