import { expect, test } from '@playwright/test';

test('homepage hydrates, uses local imagery, and supports consent', async ({ page }) => {
	const consoleErrors: string[] = [];
	page.on('console', (message) => {
		if (message.type() === 'error') consoleErrors.push(message.text());
	});

	await page.goto('/');
	await expect(page.getByRole('heading', { name: /Ainsley Hughes, Realtor/ })).toBeVisible();
	await expect(page.locator('.source-hero img')).toHaveAttribute('src', /^\/images\/migrated\//);
	await expect(page.getByRole('region', { name: 'Cookie preferences' })).toBeVisible();
	await page.getByRole('button', { name: 'Decline all' }).click();
	await expect(page.getByRole('region', { name: 'Cookie preferences' })).toBeHidden();
	expect(consoleErrors).toEqual([]);
});

test('homepage publishes a connected real estate entity graph', async ({ page }) => {
	await page.goto('/');
	const documents = await page
		.locator('script[type="application/ld+json"]')
		.evaluateAll((scripts) => scripts.map((script) => JSON.parse(script.textContent ?? '{}')));
	const graph = documents.flatMap((document) => document['@graph'] ?? []);
	const agent = graph.find((entity) => entity['@type'] === 'RealEstateAgent');

	expect(agent).toMatchObject({
		'@id': 'https://www.ainsleyhughes.com/#agent',
		telephone: '805-896-5383',
		parentOrganization: { '@id': 'https://www.ainsleyhughes.com/#brokerage' },
		mainEntityOfPage: { '@id': 'https://www.ainsleyhughes.com/#webpage' }
	});
	expect(agent.areaServed).toHaveLength(3);
	expect(agent.hasCredential).toHaveLength(4);
	expect(agent.makesOffer).toHaveLength(2);
	expect(
		graph.find((entity) => entity['@id'] === 'https://www.ainsleyhughes.com/#ventura-county')
	).toMatchObject({
		'@type': 'AdministrativeArea',
		geo: { '@type': 'GeoCoordinates', latitude: 34.4458248, longitude: -119.0779359 }
	});
	expect(
		graph.find((entity) => entity['@id'] === 'https://www.ainsleyhughes.com/#santa-barbara-county')
	).toMatchObject({
		'@type': 'AdministrativeArea',
		geo: { '@type': 'GeoCoordinates', latitude: 34.7136533, longitude: -119.985823 }
	});
	expect(graph.map((entity) => entity['@type'])).toEqual(
		expect.arrayContaining([
			'Organization',
			'Place',
			'AdministrativeArea',
			'WebSite',
			'WebPage',
			'ImageObject',
			'FAQPage'
		])
	);
});

test('visible FAQ accordions have matching FAQPage schema', async ({ page }) => {
	for (const path of ['/', '/sell']) {
		await page.goto(path);
		const visibleFaqs = await page.locator('.faq details').evaluateAll((details) =>
			details.map((item) => ({
				question: item.querySelector('summary')?.textContent?.trim(),
				answer: item.querySelector('p')?.textContent?.trim()
			}))
		);
		const schemaFaqs = await page
			.locator('script[type="application/ld+json"]')
			.evaluateAll((scripts) =>
				scripts
					.map((script) => JSON.parse(script.textContent ?? '{}'))
					.flatMap((document) => document['@graph'] ?? [document])
					.find((entity) => entity['@type'] === 'FAQPage')
					?.mainEntity.map((question: { name: string; acceptedAnswer: { text: string } }) => ({
						question: question.name,
						answer: question.acceptedAnswer.text
					}))
			);

		expect(schemaFaqs, `${path} FAQ schema should match its visible accordion`).toEqual(
			visibleFaqs
		);
	}
});

test('How I Work matches the source layout and exposes descriptive page metadata', async ({
	page
}) => {
	await page.goto('/how-i-work');
	await expect(
		page.getByRole('heading', { level: 1, name: 'How I work as a Real Estate Advisor in Ojai' })
	).toBeVisible();
	await expect(page.locator('.how-hero img')).toHaveAttribute(
		'src',
		'/images/migrated/unsplash-image-HpnxDROrv4o-dd81987f3.webp'
	);
	await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toHaveCount(0);
	await expect(page.getByRole('heading', { name: 'Considering a Move?' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'ainsleyhughes@kw.com' })).toHaveAttribute(
		'href',
		'mailto:ainsleyhughes@kw.com'
	);
	await expect(page.getByRole('heading', { name: 'Frequently asked questions' })).toHaveCount(0);
	expect(
		await page
			.getByRole('heading', { name: 'What I believe my role actually is' })
			.evaluate((heading) => Number.parseFloat(getComputedStyle(heading).fontSize))
	).toBeLessThanOrEqual(22);

	const pageEntity = await page
		.locator('script[type="application/ld+json"]')
		.evaluateAll((scripts) =>
			scripts
				.map((script) => JSON.parse(script.textContent ?? '{}'))
				.flatMap((document) => document['@graph'] ?? [document])
				.find((entity) => entity['@type'] === 'AboutPage')
		);
	expect(pageEntity).toMatchObject({
		'@id': 'https://www.ainsleyhughes.com/how-i-work#webpage',
		mainEntity: { '@id': 'https://www.ainsleyhughes.com/#agent' },
		primaryImageOfPage: {
			url: 'https://www.ainsleyhughes.com/images/migrated/unsplash-image-HpnxDROrv4o-dd81987f3.webp'
		}
	});
	expect(pageEntity.hasPart.map((part: { name: string }) => part.name)).toContain(
		'How I approach pricing decisions'
	);
});

test('contact sidebars remain visible while desktop content scrolls', async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	for (const path of [
		'/how-i-work',
		'/contact',
		'/sell',
		'/ojai-real-estate-reviews',
		'/blog',
		'/blog/what-does-as-is-really-mean-in-california-real-estate'
	]) {
		await page.goto(path);
		const sidebar = page.locator('.contact-sidebar');
		await expect(sidebar).toHaveCSS('position', 'sticky');
		await expect(sidebar).toHaveCSS('top', '32px');
	}

	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/how-i-work');
	await expect(page.locator('.contact-sidebar')).toHaveCSS('position', 'static');
});

test('blog presentation and structured metadata match published content', async ({ page }) => {
	await page.goto('/blog');
	await expect(page.locator('.blog-hero img')).toHaveAttribute(
		'src',
		'/images/migrated/11-web-or-mls-Upmarketmedia-504Dro-48-22c7e2c9f.webp'
	);
	await expect(page.getByRole('heading', { level: 1, name: 'Blog' })).toBeVisible();
	await expect(page.locator('.blog-entry')).toHaveCount(20);
	const blogEntity = await page
		.locator('script[type="application/ld+json"]')
		.evaluateAll((scripts) =>
			scripts
				.map((script) => JSON.parse(script.textContent ?? '{}'))
				.flatMap((document) => document['@graph'] ?? [document])
				.find((entity) => entity['@type'] === 'Blog')
		);
	expect(blogEntity.blogPost).toHaveLength(20);

	await page.goto('/blog/what-does-as-is-really-mean-in-california-real-estate');
	await expect(
		page.getByRole('heading', {
			level: 1,
			name: 'What Does “As-Is” Really Mean in California Real Estate?'
		})
	).toBeVisible();
	await expect(page.locator('main h1')).toHaveCount(1);
	await expect(page.locator('.article-image')).toHaveCount(0);
	const articleEntity = await page
		.locator('script[type="application/ld+json"]')
		.evaluateAll((scripts) =>
			scripts
				.map((script) => JSON.parse(script.textContent ?? '{}'))
				.flatMap((document) => document['@graph'] ?? [document])
				.find((entity) => entity['@type'] === 'BlogPosting')
		);
	expect(articleEntity).toMatchObject({
		author: { '@id': 'https://www.ainsleyhughes.com/#agent' },
		publisher: { '@id': 'https://www.ainsleyhughes.com/#agent' },
		isPartOf: { '@id': 'https://www.ainsleyhughes.com/blog#blog' },
		inLanguage: 'en-US'
	});
	expect(articleEntity.wordCount).toBeGreaterThan(500);
});

test('article likes persist and share controls create canonical links', async ({
	page,
	context
}) => {
	const articlePath = '/blog/what-does-as-is-really-mean-in-california-real-estate';
	await page.goto(articlePath);
	const likeButton = page.getByRole('button', { name: /Like this article/ });
	const initialCount = Number((await likeButton.textContent())?.match(/\d+/)?.[0] ?? 0);
	await likeButton.click();
	await expect(page.getByRole('button', { name: /Remove like/ })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
	await expect(page.getByRole('status')).toHaveText('Article liked.');

	await page.reload();
	const likedButton = page.getByRole('button', { name: /Remove like/ });
	await expect(likedButton).toContainText(String(initialCount + 1));

	await page.getByText('Share', { exact: true }).click();
	await context.grantPermissions(['clipboard-read', 'clipboard-write']);
	await page.getByRole('button', { name: 'Copy link' }).click();
	await expect(page.getByRole('status')).toHaveText('Article link copied.');
	expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
		'https://www.ainsleyhughes.com/blog/what-does-as-is-really-mean-in-california-real-estate'
	);
	await expect(
		page.locator('.article-engagement').getByRole('link', { name: 'Facebook' })
	).toHaveAttribute('href', /https:\/\/www\.facebook\.com\/sharer/);

	await likedButton.click();
	await expect(page.getByRole('button', { name: /Like this article/ })).toHaveAttribute(
		'aria-pressed',
		'false'
	);
});

test('local FAQ assistant answers a question', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Ask about Ojai real estate' }).click();
	await expect(page.getByLabel('Your question')).toBeFocused();
	await page.getByLabel('Your question').fill('How should I price my Ojai home?');
	await page.getByRole('button', { name: 'Ask', exact: true }).click();
	await expect(page.getByText(/recent comparable sales/)).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(page.getByRole('button', { name: 'Ask about Ojai real estate' })).toBeFocused();
	await expect(page.getByLabel('Your question')).toHaveCount(0);
});

test('mobile navigation exposes source routes', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');
	await expect(page.getByText('Ainsley Hughes', { exact: true })).toBeVisible();
	await expect(page.locator('.mobile-compliance-logo')).toBeVisible();
	await expect(page.locator('.mobile-compliance-logo')).toHaveAttribute(
		'alt',
		'Keller Williams World Class'
	);
	await expect(page.getByLabel('Open navigation')).toBeVisible();
	await page.getByLabel('Open navigation').click();
	await expect(page.getByLabel('Close navigation')).toBeVisible();
	await expect(page.getByRole('link', { name: 'Client Reviews' })).toBeVisible();
	await page.locator('details.mobile-menu > div > details > summary').click();
	await expect(page.getByRole('link', { name: 'Ojai Terrace' })).toBeVisible();
	await expect(page.locator('details.mobile-menu > div')).toHaveCSS('width', '390px');
	await page.keyboard.press('Escape');
	await expect(page.getByLabel('Open navigation')).toBeFocused();
	await expect(page.locator('details.mobile-menu')).not.toHaveAttribute('open');
	await page.getByLabel('Open navigation').click();
	await page.locator('details.mobile-menu > div > details > summary').click();
	await page.getByRole('link', { name: 'Ojai Terrace' }).click();
	await expect(page).toHaveURL(/\/ojaiterrace$/);
	await expect(page.locator('details.mobile-menu')).not.toHaveAttribute('open');
});

test('critical public pages preserve mobile readability and layout', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });

	for (const path of ['/', '/contact', '/sell', '/ojai-real-estate-reviews', '/blog']) {
		await page.goto(path);
		expect(
			await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
			`${path} should not scroll horizontally`
		).toBe(true);
		expect(
			await page.evaluate(() => Number.parseFloat(getComputedStyle(document.body).fontSize)),
			`${path} should use readable body text`
		).toBeGreaterThanOrEqual(15);
		expect(await page.locator('h1').count(), `${path} should have one primary heading`).toBe(1);
	}
});

test('skip link and valuation progress expose useful semantics', async ({ page }) => {
	await page.goto('/');
	await page.keyboard.press('Tab');
	await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(page.locator('main')).toBeFocused();

	await page.goto('/sell');
	await expect(
		page.getByRole('progressbar', { name: 'Valuation request progress' })
	).toHaveAttribute('aria-valuetext', 'Step 1 of 2');
});

test('cookie preferences preserve keyboard focus through state changes', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Manage cookies' }).click();
	await expect(page.getByLabel('Analytics and performance')).toBeFocused();
	await page.getByRole('button', { name: 'Back' }).click();
	await expect(page.getByRole('button', { name: 'Manage cookies' })).toBeFocused();
	await page.getByRole('button', { name: 'Decline all' }).click();
	await expect(page.locator('main')).toBeFocused();
});

test('desktop neighborhood dropdown clears the social links', async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto('/');
	await page.locator('nav details summary').click();

	const menu = await page.locator('nav details > div').boundingBox();
	const socials = await page.locator('[aria-label="Social profiles"]').boundingBox();
	expect(menu).not.toBeNull();
	expect(socials).not.toBeNull();
	const intersects =
		(menu?.x ?? 0) < (socials?.x ?? 0) + (socials?.width ?? 0) &&
		(menu?.x ?? 0) + (menu?.width ?? 0) > (socials?.x ?? 0) &&
		(menu?.y ?? 0) < (socials?.y ?? 0) + (socials?.height ?? 0) &&
		(menu?.y ?? 0) + (menu?.height ?? 0) > (socials?.y ?? 0);
	expect(intersects).toBe(false);

	await page.locator('.source-hero').click({ position: { x: 20, y: 20 } });
	await expect(page.locator('nav details')).not.toHaveAttribute('open');
});

test('neighborhood maps respect embedded-media consent', async ({ page }) => {
	await page.goto('/ojaiterrace');
	await expect(page.getByRole('button', { name: 'Manage cookies' }).last()).toBeVisible();
	await expect(page.getByTitle('Map of Ojai Terrace')).toHaveCount(0);

	await page.getByRole('button', { name: 'Manage cookies' }).last().click();
	await page.getByLabel('Marketing and embedded media').check();
	await page.getByRole('button', { name: 'Save choices' }).click();
	await expect(page.getByTitle('Map of Ojai Terrace')).toBeVisible();
});

test('content, article, and discovery routes render', async ({ page, request }) => {
	for (const path of [
		'/about',
		'/buy',
		'/sell',
		'/contact',
		'/featured-properties',
		'/blog/what-does-as-is-really-mean-in-california-real-estate',
		'/oldblog/im-back'
	]) {
		const response = await page.goto(path);
		expect(response?.status(), path).toBe(200);
	}

	expect((await request.get('/health')).status()).toBe(200);
	expect((await request.get('/sitemap.xml')).status()).toBe(200);
	expect((await request.get('/rss.xml')).status()).toBe(200);
	expect((await request.get('/llms.txt')).status()).toBe(200);
	expect((await request.get('/kw-favicon.png')).status()).toBe(200);
	expect((await request.get('/api/openapi.json')).status()).toBe(200);
});

test('opaque article URLs permanently redirect to descriptive canonical URLs', async ({
	request
}) => {
	const response = await request.get('/blog/j32m6wn1936rr2q6gfzmli8e09dzy8', {
		maxRedirects: 0
	});
	expect(response.status()).toBe(301);
	expect(response.headers().location).toBe('/blog/city-of-ojai-vs-unincorporated-ojai');
});

test('authenticated editor publishes and removes a scheduled article', async ({ page }) => {
	const slug = `editor-acceptance-${Date.now()}`;
	const title = `Editor acceptance ${Date.now()}`;
	await page.goto('/admin');
	await page.getByLabel('Password').fill('playwright-admin-password');
	await page.getByRole('button', { name: 'Sign in' }).click();

	const postForm = page.locator('form[action="?/save"]');
	await postForm.getByLabel('Title', { exact: true }).fill(title);
	await postForm.getByLabel('URL slug').fill(slug);
	await postForm
		.getByLabel('Summary', { exact: true })
		.fill('A temporary publishing acceptance article.');
	await postForm
		.getByLabel('Article body')
		.fill(
			'This article was created without editing source code.\n\n## Local guidance\n\n- First useful point\n- Second useful point\n\nRead the **important details** and [source](https://example.com/article-source).'
		);
	await postForm.getByRole('button', { name: 'Preview article' }).click();
	await expect(
		page.locator('.article-preview').getByRole('heading', { name: 'Local guidance' })
	).toBeVisible();
	await expect(page.locator('.article-preview').getByRole('listitem')).toHaveCount(2);
	await postForm.getByLabel('Publication date and time').fill('2026-01-01T09:00');
	await postForm.getByLabel('Priority').fill('42');
	await postForm.getByRole('button', { name: 'Publish post' }).click();
	await expect(page.getByText('Saved successfully.')).toBeVisible();

	await page.goto(`/blog/${slug}`);
	await expect(page.getByRole('heading', { name: title })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Local guidance' })).toBeVisible();
	await expect(page.getByRole('listitem')).toHaveCount(2);
	await expect(page.getByRole('link', { name: 'source' })).toHaveAttribute(
		'href',
		'https://example.com/article-source'
	);

	await page.goto('/blog');
	await expect(page.locator('.blog-entry').filter({ hasText: title })).toBeVisible();

	await page.goto('/admin');
	let savedPost = page.locator('aside article').filter({ hasText: title });
	const managePost = savedPost.locator('form[action="?/managePost"]');
	await managePost.getByLabel('Visibility').selectOption('draft');
	await managePost.getByLabel('Priority').fill('42');
	await managePost.getByRole('button', { name: 'Apply' }).click();
	savedPost = page.locator('aside article').filter({ hasText: title });
	await expect(savedPost.getByLabel('Visibility')).toHaveValue('draft');
	await expect(savedPost.getByLabel('Priority')).toHaveValue('42');
	const hiddenResponse = await page.goto(`/blog/${slug}`);
	expect(hiddenResponse?.status()).toBe(404);

	await page.goto('/admin');
	savedPost = page.locator('aside article').filter({ hasText: title });
	page.once('dialog', (dialog) => dialog.dismiss());
	await savedPost.getByRole('button', { name: 'Delete' }).click();
	await expect(page.locator('aside article').filter({ hasText: title })).toBeVisible();
	page.once('dialog', (dialog) => dialog.accept());
	await savedPost.getByRole('button', { name: 'Delete' }).click();
	await expect(page.locator('aside article').filter({ hasText: title })).toHaveCount(0);
});

test('authenticated editor publishes and removes sourced market insights', async ({ page }) => {
	const headline = `Ojai Valley market snapshot ${Date.now()}`;
	await page.goto('/admin');
	await page.getByLabel('Password').fill('playwright-admin-password');
	await page.getByRole('button', { name: 'Sign in' }).click();
	await page.getByRole('button', { name: /Market snapshots/ }).click();

	const form = page.locator('form[action="?/saveMarketInsights"]');
	await expect(form.getByLabel('Label')).toHaveCount(1);
	await form.getByRole('button', { name: 'Add metric' }).click();
	await expect(form.getByLabel('Label')).toHaveCount(2);
	await form.getByRole('button', { name: 'Remove metric 2' }).click();
	await expect(form.getByLabel('Label')).toHaveCount(1);

	await form.getByLabel('Section headline').fill(headline);
	await form
		.getByLabel('Summary and interpretation')
		.fill('A sourced test snapshot used only for browser acceptance.');
	await form.getByLabel('Reporting period').fill('September 2026');
	await form.getByLabel('Source publication date').fill('2026-09-26');
	await form.getByLabel('Source name').fill('Acceptance Test Market Report');
	await form.getByLabel('Source URL').fill('https://example.com/ojai-market-report');
	await form.getByLabel('Label').first().fill('Median sale price');
	await form.getByLabel('Value').first().fill('$1.2M');
	await form.getByLabel('Optional context').first().fill('Test data');
	await form.getByRole('button', { name: 'Publish snapshot' }).click();
	await expect(page.getByText('Market snapshot published to the homepage.')).toBeVisible();
	const savedSnapshot = page.locator('article').filter({ hasText: headline });
	await expect(savedSnapshot).toContainText('published · September 2026');
	await savedSnapshot.getByRole('button', { name: 'Edit' }).click();
	await expect(form.getByLabel('Section headline')).toHaveValue(headline);
	await expect(form.getByLabel('Section headline')).toBeFocused();

	await page.goto('/');
	await expect(page.getByRole('heading', { name: headline })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Acceptance Test Market Report' })).toHaveAttribute(
		'href',
		'https://example.com/ojai-market-report'
	);
	const dataset = await page
		.locator('script[type="application/ld+json"]')
		.evaluateAll((scripts) =>
			scripts
				.flatMap((script) => JSON.parse(script.textContent ?? '{}')['@graph'] ?? [])
				.find((entity) => entity['@type'] === 'Dataset')
		);
	expect(dataset).toMatchObject({
		name: headline,
		temporalCoverage: 'September 2026'
	});

	await page.goto('/admin');
	await page.getByRole('button', { name: /Market snapshots/ }).click();
	const snapshotToDelete = page.locator('article').filter({ hasText: headline });
	page.once('dialog', (dialog) => dialog.accept());
	await snapshotToDelete.getByRole('button', { name: 'Delete' }).click();
	await expect(page.locator('article').filter({ hasText: headline })).toHaveCount(0);
});

test('approved sourced reviews publish without self-serving structured data', async ({ page }) => {
	const theme = `Review acceptance ${Date.now()}`;
	await page.goto('/admin');
	await page.getByLabel('Password').fill('playwright-admin-password');
	await page.getByRole('button', { name: 'Sign in' }).click();
	await page.getByRole('button', { name: /Client reviews/ }).click();

	const form = page.locator('form[action="?/saveReview"]');
	await form.getByLabel('Review theme').fill(theme);
	await form
		.getByLabel('Review text')
		.fill('A sourced review used only to verify the publishing workflow.');
	await form.getByLabel('Reviewer display name').fill('T. R.');
	await form.getByLabel('Client relationship').fill('Seller');
	await form.getByLabel('Original source').fill('Acceptance Review Source');
	await form.getByLabel('Source URL').fill('https://example.com/review');
	await form.getByLabel('Rating, if shown by the source').selectOption('5');
	await form.getByLabel(/I confirm this review may be republished/).check();
	await form.getByRole('button', { name: 'Publish review' }).click();
	await expect(page.getByText('Review saved successfully.')).toBeVisible();

	await page.goto('/ojai-real-estate-reviews');
	await expect(page.getByText(theme)).toBeVisible();
	await expect(page.getByRole('link', { name: 'Acceptance Review Source' })).toHaveAttribute(
		'href',
		'https://example.com/review'
	);
	const structuredReviews = await page
		.locator('script[type="application/ld+json"]')
		.evaluateAll((scripts) =>
			scripts
				.map((script) => JSON.parse(script.textContent ?? '{}'))
				.flatMap((document) => document.review ?? [])
		);
	expect(structuredReviews).toEqual([]);

	await page.goto('/admin');
	await page.getByRole('button', { name: /Client reviews/ }).click();
	const savedReview = page.locator('aside article').filter({ hasText: theme });
	page.once('dialog', (dialog) => dialog.accept());
	await savedReview.getByRole('button', { name: 'Delete' }).click();
	await expect(page.locator('aside article').filter({ hasText: theme })).toHaveCount(0);
});
