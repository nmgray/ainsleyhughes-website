import { publishedManagedReviews } from '$lib/server/content-db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	managedReviews: publishedManagedReviews()
});
