import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const headers = { authorization: 'Bearer playwright-editorial-key-at-least-32-characters' };

test('ChatGPT action advertises authenticated, explicitly approved publishing', async ({
	request
}) => {
	const response = await request.get('/api/editorial/openapi.json');
	expect(response.status()).toBe(200);
	const schema = await response.json();
	expect(schema.openapi).toBe('3.1.0');
	expect(schema.security).toEqual([{ EditorKey: [] }]);
	expect(
		schema.paths['/api/editorial/{kind}/{slug}/publish'].post['x-openai-isConsequential']
	).toBe(true);
	expect(
		schema.paths['/api/editorial/{kind}/{slug}'].post.requestBody.content['application/json']
	).toBeTruthy();
	expect(
		(await request.get('/api/editorial/blog/j32m6wn1936rr2q6gfzmli8e09dzy8', { headers })).status()
	).toBe(404);
});

test('editorial drafts stay private until approved and are reversible', async ({ request }) => {
	const slug = `editorial-test-${Date.now()}`;
	const path = `/api/editorial/blog/${slug}`;
	expect((await request.get(path)).status()).toBe(401);
	const draft = {
		title: 'An Ojai editorial test',
		excerpt: 'A temporary test of the publishing workflow.',
		bodyMarkdown: 'An Ojai article for testing.\n\n## Details\n\nOnly published content is public.',
		image: null,
		imageAlt: '',
		published: new Date().toISOString(),
		seoTitle: 'An Ojai editorial test',
		seoDescription: 'A temporary test of the publishing workflow.'
	};
	const saved = await request.post(path, {
		headers: { ...headers, origin: 'https://external-editor.example' },
		data: { content: draft, expectedPublishedRevision: null }
	});
	expect(saved.status()).toBe(201);
	const { revisionId } = await saved.json();
	expect((await request.get(`/blog/${slug}`)).status()).toBe(404);
	expect((await request.get('/sitemap.xml')).text()).resolves.not.toContain(`/blog/${slug}`);

	const preview = await request.get(`${path}/preview?revisionId=${revisionId}`, { headers });
	expect(preview.status()).toBe(200);
	expect((await preview.json()).renderedHtml).toContain('<h2>Details</h2>');
	const publish = await request.post(`${path}/publish`, {
		headers,
		data: { revisionId, expectedPublishedRevision: null, confirm: true }
	});
	expect(publish.status()).toBe(200);
	expect(await (await request.get(`/blog/${slug}`)).text()).toContain(draft.title);
	expect(await (await request.get('/rss.xml')).text()).toContain(`/blog/${slug}`);
	expect(await (await request.get('/sitemap.xml')).text()).toContain(`/blog/${slug}`);
	const stale = await request.post(`${path}/publish`, {
		headers,
		data: { revisionId, expectedPublishedRevision: null, confirm: true }
	});
	expect(stale.status()).toBe(409);

	const removed = await request.post(`${path}/unpublish`, {
		headers,
		data: { expectedPublishedRevision: revisionId, confirm: true }
	});
	expect(removed.status()).toBe(200);
	expect((await request.get(`/blog/${slug}`)).status()).toBe(404);
});

test('an imported blog article updates in place without duplicate feed entries', async ({
	request
}) => {
	const slug = 'what-does-as-is-really-mean-in-california-real-estate';
	const path = `/api/editorial/blog/${slug}`;
	const baseline = await (await request.get(path, { headers })).json();
	const current = baseline.published?.id ?? null;
	const draft = {
		title: 'What as-is means: editorial test',
		excerpt: 'A temporary revision to an existing Ojai-area article.',
		bodyMarkdown:
			'An updated article about California real estate.\n\n## As-is terms\n\nVerify disclosures.',
		image: baseline.baseline.image,
		imageAlt: baseline.baseline.imageAlt,
		published: baseline.baseline.published,
		seoTitle: 'What as-is means: editorial test',
		seoDescription: 'A temporary revision to an existing Ojai-area article.'
	};
	const saved = await request.post(path, {
		headers,
		data: { content: draft, expectedPublishedRevision: current }
	});
	expect(saved.status()).toBe(201);
	const { revisionId } = await saved.json();
	expect(
		(
			await request.post(`${path}/publish`, {
				headers,
				data: { revisionId, expectedPublishedRevision: current, confirm: true }
			})
		).status()
	).toBe(200);
	const article = await (await request.get(`/blog/${slug}`)).text();
	expect(article).toContain(draft.title);
	expect(article).toContain(draft.seoDescription);
	const sitemap = await (await request.get('/sitemap.xml')).text();
	expect(sitemap.split(`<loc>https://www.ainsleyhughes.com/blog/${slug}</loc>`)).toHaveLength(2);
	expect((await (await request.get('/rss.xml')).text()).split(`/blog/${slug}`)).toHaveLength(3);

	if (current) {
		await request.post(`${path}/publish`, {
			headers,
			data: { revisionId: current, expectedPublishedRevision: revisionId, confirm: true }
		});
	} else {
		await request.post(`${path}/unpublish`, {
			headers,
			data: { expectedPublishedRevision: revisionId, confirm: true }
		});
	}
	expect(await (await request.get(`/blog/${slug}`)).text()).not.toContain(draft.title);
});

test('neighborhood revisions preserve route metadata and roll back to the original page', async ({
	request
}) => {
	const path = '/api/editorial/neighborhood/taormina';
	const before = await (await request.get('/taormina')).text();
	const baseline = await request.get(path, { headers });
	const current = (await baseline.json()).published?.id ?? null;
	const content = {
		title: 'Living in Taormina: editorial test',
		seoTitle: 'Taormina neighborhood editorial test',
		seoDescription: 'A temporary, locally focused guide used to verify page metadata.',
		hero: null,
		bodyMarkdown:
			'A temporary guide for this neighborhood.\n\n## Neighborhood details\n\nLocal context.'
	};
	const saved = await request.post(path, {
		headers,
		data: { content, expectedPublishedRevision: current }
	});
	expect(saved.status()).toBe(201);
	const { revisionId } = await saved.json();
	expect(await (await request.get('/taormina')).text()).not.toContain(content.title);
	expect(
		(
			await request.post(`${path}/publish`, {
				headers,
				data: { revisionId, expectedPublishedRevision: current, confirm: true }
			})
		).status()
	).toBe(200);
	const live = await (await request.get('/taormina')).text();
	expect(live).toContain(content.title);
	expect(live).toContain(content.seoDescription);
	expect(live).toContain('Neighborhood details');
	expect(live).toContain('Taormina map');
	if (current) {
		expect(
			(
				await request.post(`${path}/publish`, {
					headers,
					data: { revisionId: current, expectedPublishedRevision: revisionId, confirm: true }
				})
			).status()
		).toBe(200);
	} else {
		expect(
			(
				await request.post(`${path}/unpublish`, {
					headers,
					data: { expectedPublishedRevision: revisionId, confirm: true }
				})
			).status()
		).toBe(200);
	}
	const restored = await (await request.get('/taormina')).text();
	expect(restored).not.toContain(content.title);
	expect(restored).toContain(
		before.includes('Living in Taormina') ? 'Living in Taormina' : 'Taormina'
	);
});

test('editorial image uploads require authorization and return a local URL', async ({
	request
}) => {
	const image = readFileSync(new URL('../static/kw-favicon.png', import.meta.url));
	const unauthenticated = await request.post('/api/editorial/media', {
		data: { mimeType: 'image/png', base64: image.toString('base64') }
	});
	expect(unauthenticated.status()).toBe(401);
	const invalid = await request.post('/api/editorial/media', {
		headers,
		data: { mimeType: 'image/png', base64: Buffer.from('not an image').toString('base64') }
	});
	expect(invalid.status()).toBe(400);
	const upload = await request.post('/api/editorial/media', {
		headers,
		data: { mimeType: 'image/png', base64: image.toString('base64') }
	});
	expect(upload.status()).toBe(201);
	const { url } = await upload.json();
	expect(url).toMatch(/^\/media\/[a-f0-9-]+\.png$/);
	expect((await request.get(url)).status()).toBe(200);
});

test('client reviews require a source and approval before publishing', async ({ request }) => {
	const slug = `review-test-${Date.now()}`;
	const path = `/api/editorial/review/${slug}`;
	const content = {
		theme: 'A thoughtful client experience',
		quote: 'A temporary sourced review to verify the publishing workflow.',
		reviewerName: 'T. R.',
		relationship: 'Seller',
		sourceName: 'Acceptance Test Source',
		sourceUrl: '',
		publicationApproved: false,
		priority: 0
	};
	const draft = await request.post(path, {
		headers,
		data: { content, expectedPublishedRevision: null }
	});
	expect(draft.status()).toBe(201);
	const unapprovedId = (await draft.json()).revisionId;
	const preview = await request.get(`${path}/preview?revisionId=${unapprovedId}`, { headers });
	expect(preview.status()).toBe(200);
	expect((await preview.json()).revision.content.quote).toBe(content.quote);
	expect(
		(
			await request.post(`${path}/publish`, {
				headers,
				data: { revisionId: unapprovedId, expectedPublishedRevision: null, confirm: true }
			})
		).status()
	).toBe(400);
	expect(await (await request.get('/ojai-real-estate-reviews')).text()).not.toContain(
		content.quote
	);

	const approved = await request.post(path, {
		headers,
		data: {
			content: { ...content, sourceUrl: 'https://example.org/review', publicationApproved: true },
			expectedPublishedRevision: null
		}
	});
	expect(approved.status()).toBe(201);
	const revisionId = (await approved.json()).revisionId;
	expect(
		(
			await request.post(`${path}/publish`, {
				headers,
				data: { revisionId, expectedPublishedRevision: null, confirm: true }
			})
		).status()
	).toBe(200);
	const html = await (await request.get('/ojai-real-estate-reviews')).text();
	expect(html).toContain(content.quote);
	expect(html).toContain('https://example.org/review');
	expect(html).not.toContain('"@type":"Review"');
	expect(
		(
			await request.post(`${path}/unpublish`, {
				headers,
				data: { expectedPublishedRevision: revisionId, confirm: true }
			})
		).status()
	).toBe(200);
	expect(await (await request.get('/ojai-real-estate-reviews')).text()).not.toContain(
		content.quote
	);
});

test('a sourced revision can replace and restore an existing grouped review', async ({
	request
}) => {
	const path = '/api/editorial/review/kw-seller-zillow';
	const resource = await (await request.get(path, { headers })).json();
	const current = resource.published?.id ?? null;
	const content = {
		...resource.baseline,
		quote: 'An approved temporary update to a previously published review.',
		sourceUrl: 'https://example.org/original-review',
		publicationApproved: true
	};
	expect(
		(
			await request.post(path, {
				headers,
				data: {
					content: { ...content, theme: 'Different group' },
					expectedPublishedRevision: current
				}
			})
		).status()
	).toBe(400);
	const draft = await request.post(path, {
		headers,
		data: { content, expectedPublishedRevision: current }
	});
	expect(draft.status()).toBe(201);
	const revisionId = (await draft.json()).revisionId;
	expect(
		(
			await request.post(`${path}/publish`, {
				headers,
				data: { revisionId, expectedPublishedRevision: current, confirm: true }
			})
		).status()
	).toBe(200);
	expect(await (await request.get('/ojai-real-estate-reviews')).text()).toContain(content.quote);
	if (current) {
		await request.post(`${path}/publish`, {
			headers,
			data: { revisionId: current, expectedPublishedRevision: revisionId, confirm: true }
		});
	} else {
		await request.post(`${path}/unpublish`, {
			headers,
			data: { expectedPublishedRevision: revisionId, confirm: true }
		});
	}
	const restored = await (await request.get('/ojai-real-estate-reviews')).text();
	expect(restored).not.toContain(content.quote);
	expect(restored).toContain('Clear, Steady Communication at Every Step');
	expect(restored).toContain('Highly recommend!');
});

test('new market updates appear in SSR and legacy charts stay retired', async ({ request }) => {
	const path = '/api/editorial/market/home';
	expect((await request.get('/market-stats', { maxRedirects: 0 })).status()).toBe(301);
	expect(await (await request.get('/sitemap.xml')).text()).not.toContain('/market-stats');
	const current = (await (await request.get(path, { headers })).json()).published?.id ?? null;
	const content = {
		headline: 'Verified market editorial test',
		summary: 'A temporary, sourced update to verify live server-rendered market content.',
		periodLabel: 'October 2026',
		sourceName: 'Example data source',
		sourceUrl: 'https://example.org/market',
		sourceDate: '2026-10-17',
		metrics: [{ label: 'Sample measure', value: '42', note: 'Test data only' }]
	};
	const saved = await request.post(path, {
		headers,
		data: { content, expectedPublishedRevision: current }
	});
	expect(saved.status()).toBe(201);
	const { revisionId } = await saved.json();
	expect(
		(
			await request.post(`${path}/publish`, {
				headers,
				data: { revisionId, expectedPublishedRevision: current, confirm: true }
			})
		).status()
	).toBe(200);
	const html = await (await request.get('/')).text();
	expect(html).toContain(content.headline);
	expect(html).toContain('Dataset');
	if (current) {
		await request.post(`${path}/publish`, {
			headers,
			data: { revisionId: current, expectedPublishedRevision: revisionId, confirm: true }
		});
	} else {
		await request.post(`${path}/unpublish`, {
			headers,
			data: { expectedPublishedRevision: revisionId, confirm: true }
		});
	}
	expect(await (await request.get('/')).text()).not.toContain(content.headline);
});
