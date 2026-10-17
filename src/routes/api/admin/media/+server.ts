import { json } from '@sveltejs/kit';
import { isSameOrigin } from '$lib/server/admin-auth';
import { saveContentImage } from '$lib/server/media';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals, url }) => {
	if (!locals.isAdmin) return json({ error: 'Authentication required.' }, { status: 401 });
	if (!isSameOrigin(request, url))
		return json({ error: 'Invalid request origin.' }, { status: 403 });
	const upload = (await request.formData()).get('image');
	if (!(upload instanceof File) || !upload.size) {
		return json({ error: 'Choose an image to upload.' }, { status: 400 });
	}
	try {
		return json({ url: await saveContentImage(upload) });
	} catch (error) {
		return json(
			{ error: error instanceof Error ? error.message : 'Image upload failed.' },
			{ status: 400 }
		);
	}
};
