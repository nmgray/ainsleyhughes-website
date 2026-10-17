import { describe, expect, it } from 'vitest';
import { leadId, leadSchema } from './lead';

describe('lead validation', () => {
	it('normalizes a valid lead and creates a stable deduplication id', () => {
		const lead = leadSchema.parse({
			name: '  Jane Seller ',
			email: 'jane@example.com',
			address: '123 Ojai Ave',
			message: 'Valuation request'
		});
		expect(lead.name).toBe('Jane Seller');
		expect(leadId(lead)).toBe(leadId({ ...lead }));
	});

	it('rejects malformed contact and property data', () => {
		const result = leadSchema.safeParse({
			name: 'A',
			email: 'not-an-email',
			squareFeet: -1
		});
		expect(result.success).toBe(false);
	});
});
