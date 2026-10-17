import { env } from '$env/dynamic/private';
import { createHash, randomUUID } from 'node:crypto';
import { z } from 'zod';

export const leadSchema = z.object({
	name: z.string().trim().min(2).max(100),
	email: z.email().max(254),
	phone: z.string().trim().max(30).optional().default(''),
	address: z.string().trim().max(250).optional().default(''),
	message: z.string().trim().max(2000).optional().default(''),
	propertyType: z.string().trim().max(50).optional(),
	bedrooms: z.coerce.number().int().min(0).max(20).optional(),
	bathrooms: z.coerce.number().min(0).max(20).optional(),
	squareFeet: z.coerce.number().int().min(100).max(100000).optional(),
	condition: z.enum(['needs-work', 'average', 'updated']).optional(),
	utmSource: z.string().trim().max(100).optional(),
	utmMedium: z.string().trim().max(100).optional(),
	utmCampaign: z.string().trim().max(100).optional(),
	website: z.string().max(0).optional()
});

export type Lead = z.infer<typeof leadSchema>;

export function leadId(lead: Lead) {
	return createHash('sha256')
		.update(`${lead.email.toLowerCase()}|${lead.address.toLowerCase()}|${lead.message}`)
		.digest('hex');
}

export async function deliverLead(lead: Lead) {
	if (!env.LEAD_WEBHOOK_URL) {
		if (env.NODE_ENV === 'production') throw new Error('Lead delivery is not configured');
		console.info('Development lead accepted', { id: leadId(lead), name: lead.name });
		return { deliveryId: `dev-${randomUUID()}` };
	}

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 8000);
	try {
		const response = await fetch(env.LEAD_WEBHOOK_URL, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				...(env.LEAD_WEBHOOK_SECRET ? { authorization: `Bearer ${env.LEAD_WEBHOOK_SECRET}` } : {})
			},
			body: JSON.stringify({ ...lead, id: leadId(lead), receivedAt: new Date().toISOString() }),
			signal: controller.signal
		});
		if (!response.ok) throw new Error(`Lead webhook returned ${response.status}`);
		return { deliveryId: response.headers.get('x-request-id') ?? randomUUID() };
	} finally {
		clearTimeout(timeout);
	}
}
