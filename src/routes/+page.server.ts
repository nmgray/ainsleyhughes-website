import { publishedMarketInsights } from '$lib/server/content-db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	marketInsights: publishedMarketInsights()
});
