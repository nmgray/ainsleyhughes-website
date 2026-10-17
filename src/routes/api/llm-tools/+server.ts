import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { z } from 'zod';
import { site } from '$lib/config';
import { deliverLead, leadSchema } from '$lib/server/lead';
import { checkRateLimit } from '$lib/server/rate-limit';
import type { RequestHandler } from './$types';

const querySchema = z.object({
	area: z.enum(['ojai', 'meiners-oaks', 'ojai-terrace', 'taormina', 'downtown-ojai'])
});

const areaNotes = {
	ojai: 'The Ojai Valley includes incorporated City of Ojai neighborhoods and unincorporated Ventura County communities. Rules and utilities must be verified by parcel.',
	'meiners-oaks':
		'Meiners Oaks is an unincorporated Ojai Valley community with varied homes, lots, utilities, and property conditions.',
	'ojai-terrace':
		'Ojai Terrace is a City of Ojai neighborhood known for mid-century ranch homes, sidewalks, mountain views, and access to the Ojai Valley Trail.',
	taormina:
		'Taormina is a small City of Ojai historic district with cottage-style homes, a private circular road, and property-specific preservation considerations.',
	'downtown-ojai':
		'Downtown Ojai offers walkable access to shops, restaurants, galleries, parks, and community events.'
};

export const GET: RequestHandler = async ({ url, getClientAddress }) => {
	if (!(await checkRateLimit(`llm:${getClientAddress()}`, 30, 60_000))) {
		return json({ error: 'rate_limit_exceeded' }, { status: 429 });
	}
	const parsed = querySchema.safeParse({ area: url.searchParams.get('area') });
	if (!parsed.success) {
		return json({ error: 'invalid_area', supportedAreas: Object.keys(areaNotes) }, { status: 400 });
	}
	return json({
		area: parsed.data.area,
		summary: areaNotes[parsed.data.area],
		dataAsOf: new Date().toISOString().slice(0, 10),
		disclaimer:
			'General educational information only. Verify market, jurisdiction, permit, rental, insurance, and property facts before relying on them.',
		consultationUrl: `${site.origin}/contact`
	});
};

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	if (!(await checkRateLimit(`llm-lead:${getClientAddress()}`, 5, 60_000))) {
		return json({ error: 'rate_limit_exceeded' }, { status: 429 });
	}
	const key = request.headers.get('x-api-key');
	if (!env.LLM_TOOLS_API_KEY || key !== env.LLM_TOOLS_API_KEY) {
		return json({ error: 'unauthorized' }, { status: 401 });
	}
	const parsed = leadSchema.safeParse(await request.json());
	if (!parsed.success)
		return json({ error: 'invalid_request', issues: parsed.error.issues }, { status: 400 });
	try {
		const delivery = await deliverLead(parsed.data);
		return json({ status: 'accepted', id: delivery.deliveryId }, { status: 202 });
	} catch (error) {
		console.error('LLM lead delivery failed', error);
		return json({ error: 'delivery_failed' }, { status: 502 });
	}
};
