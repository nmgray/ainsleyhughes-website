import { json } from '@sveltejs/kit';
import { ZodError } from 'zod';
import { deliverLead, leadSchema } from '$lib/server/lead';
import { checkRateLimit } from '$lib/server/rate-limit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, getClientAddress, url }) => {
	const origin = request.headers.get('origin');
	if (origin && new URL(origin).host !== url.host) {
		return json({ message: 'This submission origin is not allowed.' }, { status: 403 });
	}
	if (!(await checkRateLimit(`valuation:${getClientAddress()}`, 4, 60_000))) {
		return json({ message: 'Too many requests. Please wait and try again.' }, { status: 429 });
	}

	try {
		const input = await request.json();
		const lead = leadSchema.parse({
			...input,
			propertyType: 'Home valuation',
			message: `Home valuation request. Condition: ${String(input.condition ?? 'not provided')}`
		});
		if (lead.website) return json({ message: 'Your request has been received.' });
		await deliverLead(lead);
		return json(
			{
				message:
					'Your property details were received. Ainsley will review current local comparables and follow up with a personalized value range.'
			},
			{ status: 201 }
		);
	} catch (error) {
		if (error instanceof ZodError) {
			return json(
				{ message: 'Please complete all required property and contact fields.' },
				{ status: 400 }
			);
		}
		console.error('Valuation delivery failed', error);
		return json(
			{ message: 'The request could not be delivered. Please contact Ainsley directly.' },
			{ status: 502 }
		);
	}
};
