import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { checkRateLimit } from '$lib/server/rate-limit';
import type { RequestHandler } from './$types';

const inputSchema = z.object({ question: z.string().trim().min(4).max(500) });

const answers = [
	{
		terms: ['price', 'pricing', 'worth', 'value', 'valuation'],
		answer:
			'Ojai home pricing should consider recent comparable sales, current competition, condition, location, and current buyer behavior. A property-specific CMA is more useful than a national automated estimate.'
	},
	{
		terms: ['sell', 'prepare', 'renovate', 'staging'],
		answer:
			'Not every improvement pays back at sale. Start by identifying likely buyers and the property details that affect value, then prioritize repairs, presentation, and timing that support the pricing strategy.'
	},
	{
		terms: ['buy', 'offer', 'inspection', 'escrow'],
		answer:
			'A strong purchase plan balances price, financing, contingencies, inspections, insurance, and long-term fit. The right terms depend on the property and current competition.'
	},
	{
		terms: ['meiners', 'terrace', 'taormina', 'downtown', 'neighborhood'],
		answer:
			'Ojai Valley neighborhoods differ in jurisdiction, housing, walkability, utilities, and renovation constraints. The neighborhood guides explain those distinctions, but parcel-specific facts should always be verified.'
	},
	{
		terms: ['commission', 'cost', 'closing'],
		answer:
			'Selling costs vary by property and transaction. Common categories include brokerage compensation, escrow and title charges, required disclosures, preparation, repairs, and negotiated buyer credits.'
	}
];

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	if (!(await checkRateLimit(`assistant:${getClientAddress()}`, 20, 60_000))) {
		return json(
			{ message: 'Too many questions. Please wait a minute and try again.' },
			{ status: 429 }
		);
	}
	const parsed = inputSchema.safeParse(await request.json());
	if (!parsed.success)
		return json({ message: 'Please enter a short real estate question.' }, { status: 400 });
	const normalized = parsed.data.question.toLowerCase();
	const match = answers.find((entry) => entry.terms.some((term) => normalized.includes(term)));
	return json({
		answer:
			match?.answer ??
			'I can help with general questions about buying, selling, pricing, and Ojai neighborhoods. For property-specific advice, send Ainsley a note so she can review the details.',
		disclaimer: 'General educational information, not legal, tax, or financial advice.'
	});
};
