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

test('legacy admin routes are removed and admin cookies cannot authorize publishing', async ({
	request
}) => {
	expect((await request.get('/admin')).status()).toBe(404);
	expect(
		(await request.post('/api/admin/markdown-preview', { data: { markdown: 'Draft' } })).status()
	).toBe(404);
	expect((await request.post('/api/admin/media', { data: {} })).status()).toBe(404);
	expect(
		(
			await request.get('/api/editorial', {
				headers: { cookie: 'ainsley-admin-session=obsolete' }
			})
		).status()
	).toBe(401);
});
