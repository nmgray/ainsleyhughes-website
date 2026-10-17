import { fail, redirect } from '@sveltejs/kit';
import {
	adminConfigured,
	adminCookie,
	adminSessionSeconds,
	createAdminToken,
	isSameOrigin,
	verifyAdminPassword
} from '$lib/server/admin-auth';
import { checkRateLimit } from '$lib/server/rate-limit';
import { saveContentImage } from '$lib/server/media';
import {
	deleteManagedPost,
	deleteManagedReview,
	deleteMarketInsights,
	managedPosts,
	managedReviews,
	marketSnapshots,
	saveManagedPost,
	saveManagedReview,
	saveMarketInsights,
	updateManagedPostSettings,
	updateManagedReviewSettings,
	updateMarketInsightsSettings,
	type MarketInsights,
	type MarketMetric
} from '$lib/server/content-db';
import type { Actions, PageServerLoad } from './$types';

const text = (data: FormData, key: string) => String(data.get(key) ?? '').trim();
const priority = (data: FormData, key = 'priority') => {
	const value = Number(text(data, key) || '0');
	return Number.isInteger(value) && value >= 0 && value <= 999 ? value : null;
};
const slugify = (value: string) =>
	value
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');

export const load: PageServerLoad = ({ locals }) => ({
	authenticated: locals.isAdmin,
	configured: adminConfigured(),
	posts: locals.isAdmin ? managedPosts() : [],
	marketSnapshots: locals.isAdmin ? marketSnapshots() : [],
	reviews: locals.isAdmin ? managedReviews() : []
});

export const actions: Actions = {
	login: async ({ request, cookies, url, getClientAddress }) => {
		if (!adminConfigured()) return fail(503, { error: 'Admin credentials are not configured.' });
		if (!isSameOrigin(request, url)) return fail(403, { error: 'Invalid request origin.' });
		if (!(await checkRateLimit(`admin-login:${getClientAddress()}`, 5, 15 * 60_000))) {
			return fail(429, { error: 'Too many login attempts. Try again in 15 minutes.' });
		}
		const password = text(await request.formData(), 'password');
		if (!verifyAdminPassword(password)) return fail(400, { error: 'Incorrect password.' });
		cookies.set(adminCookie, createAdminToken(), {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: url.protocol === 'https:',
			maxAge: adminSessionSeconds
		});
		redirect(303, '/admin');
	},
	logout: ({ request, cookies, url }) => {
		if (!isSameOrigin(request, url)) return fail(403, { error: 'Invalid request origin.' });
		cookies.delete(adminCookie, { path: '/' });
		redirect(303, '/admin');
	},
	save: async ({ request, locals, url }) => {
		if (!isSameOrigin(request, url)) return fail(403, { error: 'Invalid request origin.' });
		if (!locals.isAdmin) return fail(401, { error: 'Authentication required.' });
		const data = await request.formData();
		const title = text(data, 'title');
		const bodyText = text(data, 'bodyText');
		const slug = slugify(text(data, 'slug') || title);
		const intent = text(data, 'intent');
		const postPriority = priority(data);
		const publishedValue = text(data, 'published');
		const publishedDate = new Date(publishedValue);
		if (
			!title ||
			!slug ||
			!bodyText ||
			bodyText.length > 200_000 ||
			Number.isNaN(publishedDate.valueOf()) ||
			postPriority === null
		) {
			return fail(400, {
				error:
					'Title, body (up to 200,000 characters), a valid publication date, and a priority from 0 to 999 are required.',
				section: 'post'
			});
		}

		let image = text(data, 'existingImage') || null;
		const upload = data.get('image');
		if (upload instanceof File && upload.size) {
			try {
				image = await saveContentImage(upload);
			} catch (error) {
				return fail(400, {
					error: error instanceof Error ? error.message : 'Image upload failed.',
					section: 'post'
				});
			}
		}

		try {
			saveManagedPost({
				id: Number(text(data, 'id')) || undefined,
				slug,
				title,
				excerpt: text(data, 'excerpt'),
				bodyText,
				image,
				imageAlt: text(data, 'imageAlt'),
				published: publishedDate.toISOString(),
				status: intent === 'publish' ? 'published' : 'draft',
				priority: postPriority,
				seoTitle: text(data, 'seoTitle') || title,
				seoDescription: text(data, 'seoDescription') || text(data, 'excerpt')
			});
		} catch (error) {
			if (error instanceof Error && error.message.includes('UNIQUE')) {
				return fail(409, { error: 'That URL slug is already in use.', section: 'post' });
			}
			throw error;
		}
		return { success: true, section: 'post' };
	},
	managePost: async ({ request, locals, url }) => {
		if (!isSameOrigin(request, url)) return fail(403, { error: 'Invalid request origin.' });
		if (!locals.isAdmin) return fail(401, { error: 'Authentication required.' });
		const data = await request.formData();
		const id = Number(text(data, 'id'));
		const status = text(data, 'visibility');
		const postPriority = priority(data, 'contentPriority');
		if (
			!Number.isInteger(id) ||
			!['draft', 'published'].includes(status) ||
			postPriority === null
		) {
			return fail(400, { error: 'Choose valid visibility and priority values.', section: 'post' });
		}
		if (!updateManagedPostSettings(id, status as 'draft' | 'published', postPriority)) {
			return fail(404, { error: 'Post not found.', section: 'post' });
		}
		return { success: true, section: 'post', managed: true };
	},
	delete: async ({ request, locals, url }) => {
		if (!isSameOrigin(request, url)) return fail(403, { error: 'Invalid request origin.' });
		if (!locals.isAdmin) return fail(401, { error: 'Authentication required.' });
		const id = Number(text(await request.formData(), 'id'));
		if (!Number.isInteger(id) || !deleteManagedPost(id)) {
			return fail(404, { error: 'Post not found.' });
		}
		return { success: true };
	},
	saveMarketInsights: async ({ request, locals, url }) => {
		if (!isSameOrigin(request, url)) return fail(403, { error: 'Invalid request origin.' });
		if (!locals.isAdmin) return fail(401, { error: 'Authentication required.' });
		const data = await request.formData();
		const intent = text(data, 'intent');
		const status: MarketInsights['status'] = intent === 'publish' ? 'published' : 'draft';
		const marketPriority = priority(data);
		const sourceUrl = text(data, 'sourceUrl');
		const labels = data.getAll('metricLabel').map((value) => String(value).trim());
		const values = data.getAll('metricValue').map((value) => String(value).trim());
		const notes = data.getAll('metricNote').map((value) => String(value).trim());
		if (
			labels.length > 12 ||
			values.length !== labels.length ||
			notes.length !== labels.length ||
			marketPriority === null
		) {
			return fail(400, {
				error: 'Market snapshots support one to 12 metrics and a priority from 0 to 999.',
				section: 'market'
			});
		}
		const metrics: MarketMetric[] = labels
			.map((label, index) => ({ label, value: values[index], note: notes[index] }))
			.filter((metric) => metric.label || metric.value || metric.note);

		if (sourceUrl) {
			try {
				const parsed = new URL(sourceUrl);
				if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Unsupported protocol');
			} catch {
				return fail(400, {
					error: 'The market-data source must be a valid HTTP or HTTPS URL.',
					section: 'market'
				});
			}
		}

		const insights = {
			id: Number(text(data, 'marketId')) || undefined,
			headline: text(data, 'marketHeadline'),
			summary: text(data, 'marketSummary'),
			periodLabel: text(data, 'periodLabel'),
			sourceName: text(data, 'sourceName'),
			sourceUrl,
			sourceDate: text(data, 'sourceDate'),
			metrics,
			status,
			priority: marketPriority
		};
		if (
			status === 'published' &&
			(!insights.headline ||
				!insights.summary ||
				!insights.periodLabel ||
				!insights.sourceName ||
				!insights.sourceUrl ||
				!/^\d{4}-\d{2}-\d{2}$/.test(insights.sourceDate) ||
				!insights.metrics.length ||
				insights.metrics.some((metric) => !metric.label || !metric.value))
		) {
			return fail(400, {
				error: 'Publishing requires every marked field and both a label and value for each metric.',
				section: 'market'
			});
		}

		saveMarketInsights(insights);
		return { success: true, section: 'market', published: status === 'published' };
	},
	manageMarketInsights: async ({ request, locals, url }) => {
		if (!isSameOrigin(request, url)) return fail(403, { error: 'Invalid request origin.' });
		if (!locals.isAdmin) return fail(401, { error: 'Authentication required.' });
		const data = await request.formData();
		const id = Number(text(data, 'marketId'));
		const status = text(data, 'visibility');
		const marketPriority = priority(data, 'contentPriority');
		const snapshot = marketSnapshots().find((item) => item.id === id);
		if (!snapshot || !['draft', 'published'].includes(status) || marketPriority === null) {
			return fail(400, {
				error: 'Choose valid visibility and priority values.',
				section: 'market'
			});
		}
		if (
			status === 'published' &&
			(!snapshot.headline ||
				!snapshot.summary ||
				!snapshot.periodLabel ||
				!snapshot.sourceName ||
				!snapshot.sourceUrl ||
				!/^\d{4}-\d{2}-\d{2}$/.test(snapshot.sourceDate) ||
				!snapshot.metrics.length ||
				snapshot.metrics.some((metric) => !metric.label || !metric.value))
		) {
			return fail(400, {
				error: 'Complete all required snapshot fields before making it visible.',
				section: 'market'
			});
		}
		updateMarketInsightsSettings(id, status as 'draft' | 'published', marketPriority);
		return { success: true, section: 'market', managed: true };
	},
	deleteMarketInsights: async ({ request, locals, url }) => {
		if (!isSameOrigin(request, url)) return fail(403, { error: 'Invalid request origin.' });
		if (!locals.isAdmin) return fail(401, { error: 'Authentication required.' });
		const id = Number(text(await request.formData(), 'marketId'));
		if (!Number.isInteger(id) || !deleteMarketInsights(id)) {
			return fail(404, { error: 'Market snapshot was not found.', section: 'market' });
		}
		return { success: true, section: 'market-delete' };
	},
	saveReview: async ({ request, locals, url }) => {
		if (!isSameOrigin(request, url)) return fail(403, { error: 'Invalid request origin.' });
		if (!locals.isAdmin) return fail(401, { error: 'Authentication required.' });
		const data = await request.formData();
		const intent = text(data, 'intent');
		const status = intent === 'publish' ? 'published' : 'draft';
		const reviewPriority = priority(data);
		const sourceUrl = text(data, 'reviewSourceUrl');
		const ratingValue = text(data, 'reviewRating');
		const rating = ratingValue ? Number(ratingValue) : null;
		const publicationApproved = data.get('publicationApproved') === 'on';
		const review = {
			id: Number(text(data, 'reviewId')) || undefined,
			theme: text(data, 'reviewTheme'),
			quote: text(data, 'reviewQuote'),
			reviewerName: text(data, 'reviewerName'),
			relationship: text(data, 'reviewRelationship'),
			sourceName: text(data, 'reviewSourceName'),
			sourceUrl,
			rating,
			publicationApproved,
			status,
			priority: reviewPriority ?? 0
		} as const;

		if (sourceUrl) {
			try {
				const parsed = new URL(sourceUrl);
				if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Unsupported protocol');
			} catch {
				return fail(400, {
					error: 'The review source must be a valid HTTP or HTTPS URL.',
					section: 'review'
				});
			}
		}
		if (
			(rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) ||
			reviewPriority === null
		) {
			return fail(400, { error: 'Review rating must be from 1 to 5.', section: 'review' });
		}
		if (!review.theme || !review.quote || !review.reviewerName) {
			return fail(400, {
				error: 'A theme, review text, and reviewer display name are required.',
				section: 'review'
			});
		}
		if (
			status === 'published' &&
			(!review.sourceName || !review.sourceUrl || !review.publicationApproved)
		) {
			return fail(400, {
				error:
					'Published reviews require a source name, source URL, and confirmation of publication approval.',
				section: 'review'
			});
		}

		saveManagedReview(review);
		return { success: true, section: 'review' };
	},
	manageReview: async ({ request, locals, url }) => {
		if (!isSameOrigin(request, url)) return fail(403, { error: 'Invalid request origin.' });
		if (!locals.isAdmin) return fail(401, { error: 'Authentication required.' });
		const data = await request.formData();
		const id = Number(text(data, 'reviewId'));
		const status = text(data, 'visibility');
		const reviewPriority = priority(data, 'contentPriority');
		const review = managedReviews().find((item) => item.id === id);
		if (!review || !['draft', 'published'].includes(status) || reviewPriority === null) {
			return fail(400, {
				error: 'Choose valid visibility and priority values.',
				section: 'review'
			});
		}
		if (
			status === 'published' &&
			(!review.sourceName || !review.sourceUrl || !review.publicationApproved)
		) {
			return fail(400, {
				error: 'Add a source and confirm publication approval before making this review visible.',
				section: 'review'
			});
		}
		updateManagedReviewSettings(id, status as 'draft' | 'published', reviewPriority);
		return { success: true, section: 'review', managed: true };
	},
	deleteReview: async ({ request, locals, url }) => {
		if (!isSameOrigin(request, url)) return fail(403, { error: 'Invalid request origin.' });
		if (!locals.isAdmin) return fail(401, { error: 'Authentication required.' });
		const id = Number(text(await request.formData(), 'reviewId'));
		if (!Number.isInteger(id) || !deleteManagedReview(id)) {
			return fail(404, { error: 'Review not found.', section: 'review' });
		}
		return { success: true, section: 'review-delete' };
	}
};
