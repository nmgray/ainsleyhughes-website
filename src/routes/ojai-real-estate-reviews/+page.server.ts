import { currentReviews } from '$lib/server/editorial';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => currentReviews();
