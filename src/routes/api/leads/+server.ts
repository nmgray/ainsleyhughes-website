import { json } from '@sveltejs/kit';
import { ZodError } from 'zod';
import { deliverLead, leadId, leadSchema } from '$lib/server/lead';
import { checkRateLimit } from '$lib/server/rate-limit';
import type { RequestHandler } from './$types';

const recent = new Map<string, number>();

export const POST: RequestHandler = async ({ request, getClientAddress, url }) => {
	const origin = request.headers.get('origin');
	if (origin && new URL(origin).host !== url.host) {
		return json({ message: 'This submission origin is not allowed.' }, { status: 403 });
	}
	if (!(await checkRateLimit(`lead:${getClientAddress()}`, 6, 60_000))) {
		return json(
			{ message: 'Too many requests. Please wait a minute and try again.' },
			{ status: 429 }
		);
	}

	try {
		const contentType = request.headers.get('content-type') ?? '';
		const input = contentType.includes('application/json')
			? await request.json()
			: Object.fromEntries(await request.formData());
		const lead = leadSchema.parse(input);
		if (lead.website) return json({ message: 'Thank you. Your inquiry has been received.' });

		const id = leadId(lead);
		const lastSubmitted = recent.get(id);
		if (lastSubmitted && Date.now() - lastSubmitted < 10 * 60_000) {
			return json({ message: 'This inquiry was already received recently.' });
		}

		const delivery = await deliverLead(lead);
		recent.set(id, Date.now());
		return json(
			{ message: 'Thank you. Ainsley will be in touch soon.', id: delivery.deliveryId },
			{ status: 201 }
		);
	} catch (error) {
		if (error instanceof ZodError) {
			return json(
				{ message: 'Please check the required fields and try again.', issues: error.issues },
				{ status: 400 }
			);
		}
		console.error('Lead delivery failed', error);
		return json(
			{ message: 'Your inquiry could not be delivered. Please call or email Ainsley directly.' },
			{ status: 502 }
		);
	}
};

export const OPTIONS: RequestHandler = () =>
	new Response(null, {
		status: 204,
		headers: { allow: 'POST, OPTIONS' }
	});
