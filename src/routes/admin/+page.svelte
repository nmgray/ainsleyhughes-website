<script lang="ts">
	import { tick } from 'svelte';
	import Seo from '$lib/components/Seo.svelte';
	import type { PageData } from './$types';

	let {
		data,
		form
	}: {
		data: PageData;
		form: {
			error?: string;
			success?: boolean;
			section?: string;
			published?: boolean;
			managed?: boolean;
		} | null;
	} = $props();
	type AdminSection = 'posts' | 'market' | 'reviews';
	let selectedSection = $state<AdminSection>('posts');
	let editing = $state<(typeof data.posts)[number] | undefined>();
	let editingReview = $state<(typeof data.reviews)[number] | undefined>();
	let editingMarket = $state<(typeof data.marketSnapshots)[number] | undefined>();
	let marketMetrics = $state([{ key: 0, label: '', value: '', note: '' }]);
	let nextMetricKey = 1;
	let postTitleInput = $state<HTMLInputElement>();
	let postBodyInput = $state<HTMLTextAreaElement>();
	let inlineImageInput = $state<HTMLInputElement>();
	let reviewThemeInput = $state<HTMLInputElement>();
	let marketHeadlineInput = $state<HTMLInputElement>();
	let postBody = $state('');
	let previewHtml = $state('');
	let previewError = $state('');
	let previewBusy = $state(false);
	let imageUploadBusy = $state(false);
	let postTitle = $state('');
	let postSlug = $state('');
	let postExcerpt = $state('');
	let postImageAlt = $state('');
	let postPublished = $state(
		new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
	);
	let postPriority = $state(0);
	let postSeoTitle = $state('');
	let postSeoDescription = $state('');

	$effect(() => {
		if (form?.section === 'market') selectedSection = 'market';
		if (form?.section === 'review') selectedSection = 'reviews';
		if (form?.section === 'post') selectedSection = 'posts';
	});

	const localDate = (value?: string) => {
		const date = value ? new Date(value) : new Date();
		return new Date(date.valueOf() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
	};

	async function editPost(post?: (typeof data.posts)[number]) {
		selectedSection = 'posts';
		editing = post;
		postTitle = post?.title ?? '';
		postSlug = post?.slug ?? '';
		postExcerpt = post?.excerpt ?? '';
		postBody = post?.bodyText ?? '';
		postImageAlt = post?.imageAlt ?? '';
		postPublished = localDate(post?.published);
		postPriority = post?.priority ?? 0;
		postSeoTitle = post?.seoTitle ?? '';
		postSeoDescription = post?.seoDescription ?? '';
		previewHtml = '';
		previewError = '';
		await tick();
		postTitleInput?.focus();
	}

	async function insertMarkdown(prefix: string, suffix: string, placeholder: string) {
		const input = postBodyInput;
		if (!input) return;
		const start = input.selectionStart;
		const end = input.selectionEnd;
		const selection = postBody.slice(start, end) || placeholder;
		postBody = `${postBody.slice(0, start)}${prefix}${selection}${suffix}${postBody.slice(end)}`;
		await tick();
		input.focus();
		input.setSelectionRange(start + prefix.length, start + prefix.length + selection.length);
	}

	async function previewPost() {
		previewBusy = true;
		previewError = '';
		try {
			const response = await fetch('/api/admin/markdown-preview', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ markdown: postBody })
			});
			const result = (await response.json()) as { html?: string; error?: string };
			if (!response.ok || !result.html)
				throw new Error(result.error || 'Preview could not be generated.');
			previewHtml = result.html;
		} catch (error) {
			previewError = error instanceof Error ? error.message : 'Preview could not be generated.';
		} finally {
			previewBusy = false;
		}
	}

	async function uploadInlineImage(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const upload = input.files?.[0];
		if (!upload) return;
		imageUploadBusy = true;
		previewError = '';
		const data = new FormData();
		data.set('image', upload);
		try {
			const response = await fetch('/api/admin/media', { method: 'POST', body: data });
			const result = (await response.json()) as { url?: string; error?: string };
			if (!response.ok || !result.url) throw new Error(result.error || 'Image upload failed.');
			const description = upload.name.replace(/\.[^.]+$/, '').replaceAll(/[-_]+/g, ' ');
			await insertMarkdown('![', `](${result.url})`, description);
		} catch (error) {
			previewError = error instanceof Error ? error.message : 'Image upload failed.';
		} finally {
			imageUploadBusy = false;
			input.value = '';
		}
	}

	async function editReview(review?: (typeof data.reviews)[number]) {
		selectedSection = 'reviews';
		editingReview = review;
		await tick();
		reviewThemeInput?.focus();
	}

	async function editMarket(snapshot?: (typeof data.marketSnapshots)[number]) {
		selectedSection = 'market';
		editingMarket = snapshot;
		marketMetrics = snapshot?.metrics.length
			? snapshot.metrics.map((metric) => ({ key: nextMetricKey++, ...metric }))
			: [{ key: nextMetricKey++, label: '', value: '', note: '' }];
		await tick();
		marketHeadlineInput?.focus();
	}

	function addMetric() {
		if (marketMetrics.length >= 12) return;
		marketMetrics.push({ key: nextMetricKey++, label: '', value: '', note: '' });
	}

	function removeMetric(index: number) {
		if (marketMetrics.length === 1) {
			marketMetrics[0] = { ...marketMetrics[0], label: '', value: '', note: '' };
			return;
		}
		marketMetrics.splice(index, 1);
	}

	function confirmRemoval(event: SubmitEvent, description: string) {
		if (!globalThis.confirm(`Permanently delete ${description}? This cannot be undone.`)) {
			event.preventDefault();
		}
	}
</script>

<Seo title="Content editor — Ainsley Hughes" noindex />

{#if !data.authenticated}
	<section class="section narrow">
		<h1 class="text-[3rem]">Content editor</h1>
		{#if data.configured}
			<form method="POST" action="?/login" class="mt-8 max-w-md">
				<label>
					<span>Password</span>
					<input name="password" type="password" autocomplete="current-password" required />
				</label>
				{#if form?.error}<p class="form-error" role="alert">{form.error}</p>{/if}
				<button class="button" type="submit">Sign in</button>
			</form>
		{:else}
			<p class="form-error">
				Set <code>ADMIN_PASSWORD_HASH</code> and a random
				<code>ADMIN_SESSION_SECRET</code> of at least 32 characters before using the editor.
			</p>
		{/if}
	</section>
{:else}
	<section
		class="mx-auto w-[min(1440px,calc(100%-32px))] py-10 md:w-[min(1440px,calc(100%-64px))] md:py-16"
	>
		<div class="mb-10 flex flex-wrap items-center justify-between gap-4">
			<div>
				<p class="eyebrow">Private administration</p>
				<h1 class="m-0 text-[3rem]">Content editor</h1>
			</div>
			<form method="POST" action="?/logout">
				<button class="outline-button" type="submit">Sign out</button>
			</form>
		</div>

		<div class="admin-shell">
			<aside class="admin-nav" aria-label="Content sections">
				<p class="eyebrow">Manage content</p>
				<nav>
					<button
						type="button"
						class:active={selectedSection === 'posts'}
						aria-current={selectedSection === 'posts' ? 'page' : undefined}
						onclick={() => (selectedSection = 'posts')}
					>
						<span>Blog posts</span>
						<strong>{data.posts.length}</strong>
					</button>
					<button
						type="button"
						class:active={selectedSection === 'market'}
						aria-current={selectedSection === 'market' ? 'page' : undefined}
						onclick={() => (selectedSection = 'market')}
					>
						<span>Market snapshots</span>
						<strong>{data.marketSnapshots.length}</strong>
					</button>
					<button
						type="button"
						class:active={selectedSection === 'reviews'}
						aria-current={selectedSection === 'reviews' ? 'page' : undefined}
						onclick={() => (selectedSection = 'reviews')}
					>
						<span>Client reviews</span>
						<strong>{data.reviews.length}</strong>
					</button>
				</nav>
				<p class="admin-help">
					Priority controls display order. Higher numbers appear first; use 0 for normal order.
				</p>
			</aside>

			<main class="min-w-0">
				{#if selectedSection === 'posts'}
					<section aria-labelledby="posts-heading">
						<div class="section-heading">
							<div>
								<p class="eyebrow">Articles and updates</p>
								<h2 id="posts-heading" class="m-0 text-[2rem]">Blog posts</h2>
							</div>
							<button class="outline-button" type="button" onclick={() => editPost()}
								>Create post</button
							>
						</div>
						<div class="content-workspace">
							{#key editing?.id}
								<form method="POST" action="?/save" enctype="multipart/form-data">
									<input type="hidden" name="id" value={editing?.id ?? ''} />
									<input type="hidden" name="existingImage" value={editing?.image ?? ''} />
									<label>
										<span>Title</span>
										<input
											bind:this={postTitleInput}
											bind:value={postTitle}
											name="title"
											required
										/>
									</label>
									<label>
										<span>URL slug (leave blank to generate it from the title)</span>
										<input bind:value={postSlug} name="slug" pattern="[a-z0-9-]+" />
									</label>
									<label>
										<span>Summary</span>
										<textarea bind:value={postExcerpt} name="excerpt" rows="3"></textarea>
									</label>
									<div class="body-field">
										<label for="post-body">Article body (Markdown)</label>
										<div class="markdown-toolbar" aria-label="Article formatting controls">
											<button
												type="button"
												aria-label="Add section heading"
												onclick={() => insertMarkdown('\n## ', '\n', 'Section heading')}
												>Heading</button
											>
											<button
												type="button"
												aria-label="Make selected text bold"
												onclick={() => insertMarkdown('**', '**', 'bold text')}>Bold</button
											>
											<button
												type="button"
												aria-label="Make selected text italic"
												onclick={() => insertMarkdown('*', '*', 'italic text')}>Italic</button
											>
											<button
												type="button"
												aria-label="Add link"
												onclick={() => insertMarkdown('[', '](https://)', 'link text')}>Link</button
											>
											<button
												type="button"
												aria-label="Add bulleted list item"
												onclick={() => insertMarkdown('\n- ', '', 'List item')}>List</button
											>
											<button
												type="button"
												aria-label="Add block quote"
												onclick={() => insertMarkdown('\n> ', '', 'Quote')}>Quote</button
											>
											<button
												type="button"
												disabled={imageUploadBusy}
												onclick={() => inlineImageInput?.click()}
											>
												{imageUploadBusy ? 'Uploading…' : 'Add image'}
											</button>
											<input
												bind:this={inlineImageInput}
												class="sr-only"
												type="file"
												accept="image/jpeg,image/png,image/webp,image/gif"
												onchange={uploadInlineImage}
											/>
										</div>
										<textarea
											id="post-body"
											bind:this={postBodyInput}
											bind:value={postBody}
											name="bodyText"
											rows="22"
											placeholder={'Opening paragraph.\n\n## Section heading\n\nWrite the next section here.'}
											required></textarea>
									</div>
									<details class="markdown-help">
										<summary>Formatting guide</summary>
										<div>
											<p><code>## Heading</code> creates a section heading.</p>
											<p><code>### Heading</code> creates a smaller heading.</p>
											<p><code>**bold**</code> and <code>*italic*</code> format emphasis.</p>
											<p><code>- item</code> creates a bulleted list.</p>
											<p><code>[link text](https://example.com)</code> creates a link.</p>
											<p>Leave a blank line between paragraphs.</p>
										</div>
									</details>
									<div class="preview-controls">
										<button
											class="outline-button"
											type="button"
											disabled={previewBusy}
											onclick={previewPost}
										>
											{previewBusy ? 'Rendering…' : 'Preview article'}
										</button>
										<span>The preview uses the same safe renderer as the published article.</span>
									</div>
									{#if previewError}<p class="form-error" role="alert">{previewError}</p>{/if}
									{#if previewHtml}
										<div class="article-preview" aria-label="Article preview">
											<p class="eyebrow">Article preview</p>
											<div class="content">{@html previewHtml}</div>
										</div>
									{/if}
									<div class="grid gap-4 md:grid-cols-2">
										<label>
											<span>Feature image</span>
											<input
												name="image"
												type="file"
												accept="image/jpeg,image/png,image/webp,image/gif"
											/>
										</label>
										<label>
											<span>Image description</span>
											<input bind:value={postImageAlt} name="imageAlt" />
										</label>
									</div>
									<div class="grid gap-4 md:grid-cols-2">
										<label>
											<span>Publication date and time (future dates are scheduled)</span>
											<input
												name="published"
												type="datetime-local"
												bind:value={postPublished}
												required
											/>
										</label>
										<div class="self-end">
											<p class="eyebrow">Current status</p>
											<p class="m-0 capitalize">{editing?.status ?? 'New draft'}</p>
										</div>
									</div>
									<label>
										<span>Priority (0–999)</span>
										<input
											name="priority"
											type="number"
											min="0"
											max="999"
											step="1"
											bind:value={postPriority}
											required
										/>
										<small>Higher-priority posts appear before lower-priority posts.</small>
									</label>
									<label>
										<span>Search title</span>
										<input bind:value={postSeoTitle} name="seoTitle" />
									</label>
									<label>
										<span>Search description</span>
										<textarea bind:value={postSeoDescription} name="seoDescription" rows="3"
										></textarea>
									</label>
									{#if form?.error && (!form.section || form.section === 'post')}
										<p class="form-error" role="alert">{form.error}</p>
									{/if}
									{#if form?.success && form.section === 'post'}
										<p role="status">
											{form.managed ? 'Post controls updated.' : 'Saved successfully.'}
										</p>
									{/if}
									<div class="actions">
										<button class="outline-button" type="submit" name="intent" value="draft"
											>Save draft</button
										>
										<button class="button" type="submit" name="intent" value="publish">
											{editing?.status === 'published' ? 'Update published post' : 'Publish post'}
										</button>
										{#if editing}
											<button class="outline-button" type="button" onclick={() => editPost()}
												>New post</button
											>
										{/if}
									</div>
								</form>
							{/key}

							<aside class="content-library">
								<h3 class="text-[1.5rem]">Manage posts</h3>
								{#if data.posts.length}
									<div class="grid gap-5">
										{#each data.posts as post}
											<article class="border-t border-line pt-4">
												<p class="eyebrow">
													{post.status} · {new Date(post.published).toLocaleDateString()}
												</p>
												<h3 class="text-[1.2rem]">{post.title}</h3>
												<form class="manage-row" method="POST" action="?/managePost">
													<input type="hidden" name="id" value={post.id} />
													<label>
														<span>Visibility</span>
														<select name="visibility" value={post.status}>
															<option value="published">Visible</option>
															<option value="draft">Hidden</option>
														</select>
													</label>
													<label>
														<span>Priority</span>
														<input
															name="contentPriority"
															type="number"
															min="0"
															max="999"
															step="1"
															value={post.priority}
														/>
													</label>
													<button class="outline-button" type="submit">Apply</button>
												</form>
												<div class="actions">
													<button
														class="outline-button"
														type="button"
														onclick={() => editPost(post)}>Edit</button
													>
													<form
														method="POST"
														action="?/delete"
														onsubmit={(event) => confirmRemoval(event, `“${post.title}”`)}
													>
														<input type="hidden" name="id" value={post.id} />
														<button class="text-button" type="submit">Delete</button>
													</form>
												</div>
											</article>
										{/each}
									</div>
								{:else}
									<p>No managed posts yet.</p>
								{/if}
							</aside>
						</div>
					</section>
				{/if}

				{#if selectedSection === 'market'}
					<section aria-labelledby="market-heading">
						<p class="eyebrow">Homepage GEO content</p>
						<div class="section-heading">
							<h2 id="market-heading" class="m-0 text-[2rem]">Local market snapshots</h2>
							<button class="outline-button" type="button" onclick={() => editMarket()}
								>Create snapshot</button
							>
						</div>
						<p class="max-w-3xl">
							Published snapshots appear on the homepage. Drafts remain private. Fields marked
							<strong>*</strong> are required to publish but may be incomplete in a draft.
						</p>
						<div class="content-workspace mt-8">
							{#key editingMarket?.id ?? 'new-market-snapshot'}
								<form method="POST" action="?/saveMarketInsights">
									<input type="hidden" name="marketId" value={editingMarket?.id ?? ''} />
									<label>
										<span>Section headline <strong aria-hidden="true">*</strong></span>
										<input
											bind:this={marketHeadlineInput}
											name="marketHeadline"
											value={editingMarket?.headline ?? ''}
											placeholder="Ojai Valley market snapshot"
											required
										/>
									</label>
									<label>
										<span>Summary and interpretation <strong aria-hidden="true">*</strong></span>
										<textarea name="marketSummary" rows="5" required
											>{editingMarket?.summary ?? ''}</textarea
										>
									</label>
									<div class="grid gap-4 md:grid-cols-2">
										<label>
											<span>Reporting period <strong aria-hidden="true">*</strong></span>
											<input
												name="periodLabel"
												value={editingMarket?.periodLabel ?? ''}
												placeholder="August 2026"
												required
											/>
										</label>
										<label>
											<span>Source publication date <strong aria-hidden="true">*</strong></span>
											<input
												name="sourceDate"
												type="date"
												value={editingMarket?.sourceDate ?? ''}
												required
											/>
										</label>
									</div>
									<div class="grid gap-4 md:grid-cols-2">
										<label>
											<span>Source name <strong aria-hidden="true">*</strong></span>
											<input
												name="sourceName"
												value={editingMarket?.sourceName ?? ''}
												placeholder="Source organization or report"
												required
											/>
										</label>
										<label>
											<span>Source URL <strong aria-hidden="true">*</strong></span>
											<input
												name="sourceUrl"
												type="url"
												value={editingMarket?.sourceUrl ?? ''}
												placeholder="https://"
												required
											/>
										</label>
									</div>

									<div class="py-4">
										<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
											<div>
												<h3 class="m-0 text-[1.35rem]">Metrics</h3>
												<p class="m-0 text-sm">Add between one and twelve figures.</p>
											</div>
											<button
												class="outline-button"
												type="button"
												onclick={addMetric}
												disabled={marketMetrics.length >= 12}>Add metric</button
											>
										</div>
										<div class="grid gap-4 md:grid-cols-2">
											{#each marketMetrics as metric, index (metric.key)}
												<fieldset class="border border-line p-4">
													<legend class="px-1 text-base">Metric {index + 1}</legend>
													<div class="mb-3 flex justify-end">
														<button
															class="text-button"
															type="button"
															aria-label={`Remove metric ${index + 1}`}
															onclick={() => removeMetric(index)}>Remove</button
														>
													</div>
													<label>
														<span>Label <strong aria-hidden="true">*</strong></span>
														<input
															name="metricLabel"
															bind:value={metric.label}
															placeholder="Median listing price"
															required
														/>
													</label>
													<label>
														<span>Value <strong aria-hidden="true">*</strong></span>
														<input
															name="metricValue"
															bind:value={metric.value}
															placeholder="$1.2M"
															required
														/>
													</label>
													<label>
														<span>Optional context</span>
														<input
															name="metricNote"
															bind:value={metric.note}
															placeholder="Up 3% year over year"
														/>
													</label>
												</fieldset>
											{/each}
										</div>
									</div>

									<div>
										<p class="eyebrow">Current status</p>
										<p class="m-0 capitalize">{editingMarket?.status ?? 'New draft'}</p>
									</div>
									<label>
										<span>Priority (0–999)</span>
										<input
											name="priority"
											type="number"
											min="0"
											max="999"
											step="1"
											value={editingMarket?.priority ?? 0}
											required
										/>
										<small>Higher-priority snapshots appear first in this content library.</small>
									</label>
									{#if form?.error && form.section === 'market'}
										<p class="form-error" role="alert">{form.error}</p>
									{/if}
									{#if form?.success && form.section === 'market'}
										<p role="status">
											{form.managed
												? 'Snapshot controls updated.'
												: form.published
													? 'Market snapshot published to the homepage.'
													: 'Market snapshot saved as a private draft.'}
										</p>
										{#if form.published}
											<p><a href="/" target="_blank">View the published homepage snapshot</a></p>
										{/if}
									{/if}
									<div class="actions">
										<button
											class="outline-button"
											type="submit"
											name="intent"
											value="draft"
											formnovalidate>Save draft</button
										>
										<button class="button" type="submit" name="intent" value="publish">
											{editingMarket?.status === 'published'
												? 'Update published snapshot'
												: 'Publish snapshot'}
										</button>
										{#if editingMarket}
											<button class="outline-button" type="button" onclick={() => editMarket()}
												>New snapshot</button
											>
										{/if}
									</div>
								</form>
							{/key}

							<aside class="content-library">
								<h3 class="text-[1.5rem]">Snapshot history</h3>
								{#if data.marketSnapshots.length}
									<div class="grid gap-5">
										{#each data.marketSnapshots as snapshot}
											<article class="border-t border-line pt-4">
												<p class="eyebrow">
													{snapshot.status} · {snapshot.periodLabel || 'No period'}
												</p>
												<h4 class="text-[1.1rem]">{snapshot.headline || 'Untitled snapshot'}</h4>
												<p>
													{snapshot.metrics.length}
													{snapshot.metrics.length === 1 ? 'metric' : 'metrics'}
													· Priority {snapshot.priority}
													· Updated {new Date(snapshot.updated).toLocaleDateString()}
												</p>
												<form class="manage-row" method="POST" action="?/manageMarketInsights">
													<input type="hidden" name="marketId" value={snapshot.id} />
													<label>
														<span>Visibility</span>
														<select name="visibility" value={snapshot.status}>
															<option value="published">Visible</option>
															<option value="draft">Hidden</option>
														</select>
													</label>
													<label>
														<span>Priority</span>
														<input
															name="contentPriority"
															type="number"
															min="0"
															max="999"
															step="1"
															value={snapshot.priority}
														/>
													</label>
													<button class="outline-button" type="submit">Apply</button>
												</form>
												<div class="actions">
													<button
														class="outline-button"
														type="button"
														onclick={() => editMarket(snapshot)}>Edit</button
													>
													<form
														method="POST"
														action="?/deleteMarketInsights"
														onsubmit={(event) =>
															confirmRemoval(
																event,
																`the “${snapshot.headline || 'untitled'}” snapshot`
															)}
													>
														<input type="hidden" name="marketId" value={snapshot.id} />
														<button class="text-button" type="submit">Delete</button>
													</form>
												</div>
											</article>
										{/each}
									</div>
								{:else}
									<p>No market snapshots yet.</p>
								{/if}
							</aside>
						</div>
					</section>
				{/if}

				{#if selectedSection === 'reviews'}
					<section aria-labelledby="reviews-heading">
						<p class="eyebrow">Trust and entity data</p>
						<div class="section-heading">
							<h2 id="reviews-heading" class="m-0 text-[2rem]">Client reviews</h2>
							<button class="outline-button" type="button" onclick={() => editReview()}
								>Create review</button
							>
						</div>
						<p class="max-w-3xl">
							Only publish a review when its wording may be republished and the original source is
							available. Reviews are displayed with source attribution. Review structured data is
							not emitted because Google excludes self-controlled local-business reviews from
							review-star eligibility.
						</p>
						<div class="content-workspace mt-8">
							{#key editingReview?.id}
								<form method="POST" action="?/saveReview">
									<input type="hidden" name="reviewId" value={editingReview?.id ?? ''} />
									<label>
										<span>Review theme</span>
										<input
											bind:this={reviewThemeInput}
											name="reviewTheme"
											value={editingReview?.theme ?? ''}
											placeholder="Clear, steady communication"
											required
										/>
									</label>
									<label>
										<span>Review text</span>
										<textarea name="reviewQuote" rows="7" required
											>{editingReview?.quote ?? ''}</textarea
										>
									</label>
									<div class="grid gap-4 md:grid-cols-2">
										<label>
											<span>Reviewer display name</span>
											<input
												name="reviewerName"
												value={editingReview?.reviewerName ?? ''}
												placeholder="K. W."
												required
											/>
										</label>
										<label>
											<span>Client relationship</span>
											<input
												name="reviewRelationship"
												value={editingReview?.relationship ?? ''}
												placeholder="Seller"
											/>
										</label>
									</div>
									<div class="grid gap-4 md:grid-cols-2">
										<label>
											<span>Original source</span>
											<input
												name="reviewSourceName"
												value={editingReview?.sourceName ?? ''}
												placeholder="Google or Zillow"
											/>
										</label>
										<label>
											<span>Source URL</span>
											<input
												name="reviewSourceUrl"
												type="url"
												value={editingReview?.sourceUrl ?? ''}
												placeholder="https://"
											/>
										</label>
									</div>
									<label>
										<span>Rating, if shown by the source</span>
										<select name="reviewRating" value={editingReview?.rating?.toString() ?? ''}>
											<option value="">Not specified</option>
											<option value="5">5 stars</option>
											<option value="4">4 stars</option>
											<option value="3">3 stars</option>
											<option value="2">2 stars</option>
											<option value="1">1 star</option>
										</select>
									</label>
									<label class="grid-cols-[auto_1fr] items-start gap-3">
										<input
											name="publicationApproved"
											type="checkbox"
											checked={editingReview?.publicationApproved ?? false}
										/>
										<span
											>I confirm this review may be republished and the text matches the cited
											source.</span
										>
									</label>
									<label>
										<span>Priority (0–999)</span>
										<input
											name="priority"
											type="number"
											min="0"
											max="999"
											step="1"
											value={editingReview?.priority ?? 0}
											required
										/>
										<small>Higher-priority reviews appear first on the reviews page.</small>
									</label>
									{#if form?.error && form.section === 'review'}
										<p class="form-error" role="alert">{form.error}</p>
									{/if}
									{#if form?.success && form.section === 'review'}
										<p role="status">
											{form.managed ? 'Review controls updated.' : 'Review saved successfully.'}
										</p>
									{/if}
									<div class="actions">
										<button class="outline-button" type="submit" name="intent" value="draft"
											>Save review draft</button
										>
										<button class="button" type="submit" name="intent" value="publish">
											{editingReview?.status === 'published'
												? 'Update published review'
												: 'Publish review'}
										</button>
										{#if editingReview}
											<button class="outline-button" type="button" onclick={() => editReview()}
												>New review</button
											>
										{/if}
									</div>
								</form>
							{/key}

							<aside class="content-library">
								<h3 class="text-[1.5rem]">Saved reviews</h3>
								{#if data.reviews.length}
									<div class="grid gap-5">
										{#each data.reviews as review}
											<article class="border-t border-line pt-4">
												<p class="eyebrow">
													{review.status} · {review.publicationApproved
														? 'approved'
														: 'not approved'}
												</p>
												<h4 class="text-[1.1rem]">{review.theme}</h4>
												<p>{review.reviewerName} · Priority {review.priority}</p>
												<form class="manage-row" method="POST" action="?/manageReview">
													<input type="hidden" name="reviewId" value={review.id} />
													<label>
														<span>Visibility</span>
														<select name="visibility" value={review.status}>
															<option value="published">Visible</option>
															<option value="draft">Hidden</option>
														</select>
													</label>
													<label>
														<span>Priority</span>
														<input
															name="contentPriority"
															type="number"
															min="0"
															max="999"
															step="1"
															value={review.priority}
														/>
													</label>
													<button class="outline-button" type="submit">Apply</button>
												</form>
												<div class="actions">
													<button
														class="outline-button"
														type="button"
														onclick={() => editReview(review)}>Edit</button
													>
													<form
														method="POST"
														action="?/deleteReview"
														onsubmit={(event) =>
															confirmRemoval(event, `the “${review.theme}” review`)}
													>
														<input type="hidden" name="reviewId" value={review.id} />
														<button class="text-button" type="submit">Delete</button>
													</form>
												</div>
											</article>
										{/each}
									</div>
								{:else}
									<p>No managed reviews yet.</p>
								{/if}
							</aside>
						</div>
					</section>
				{/if}
			</main>
		</div>
	</section>
{/if}

<style>
	.admin-shell {
		display: grid;
		gap: 2rem;
	}

	.admin-nav {
		align-self: start;
		border: 1px solid var(--color-line, #d8d2c8);
		background: #f7f4ef;
		padding: 1rem;
	}

	.admin-nav nav {
		display: grid;
		gap: 0.35rem;
	}

	.admin-nav nav button {
		display: flex;
		min-height: 48px;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		border: 0;
		background: transparent;
		padding: 0.75rem;
		text-align: left;
	}

	.admin-nav nav button:hover,
	.admin-nav nav button.active {
		background: #fff;
	}

	.admin-nav nav button.active {
		box-shadow: inset 3px 0 #323a34;
	}

	.admin-nav nav strong {
		min-width: 2rem;
		border-radius: 999px;
		background: #e8e2d9;
		padding: 0.15rem 0.55rem;
		text-align: center;
	}

	.admin-help {
		margin: 1rem 0 0;
		font-size: 0.9rem;
		line-height: 1.45;
	}

	.section-heading {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.content-workspace {
		display: grid;
		gap: 2.5rem;
	}

	.content-library {
		align-self: start;
		border: 1px solid var(--color-line, #d8d2c8);
		padding: 1.25rem;
	}

	.manage-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 90px;
		gap: 0.65rem;
		margin: 1rem 0;
	}

	.manage-row label {
		margin: 0;
	}

	.manage-row label span {
		font-size: 0.78rem;
	}

	.manage-row button {
		grid-column: 1 / -1;
		justify-self: start;
	}

	.markdown-toolbar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		border: 1px solid var(--color-line, #d8d2c8);
		border-bottom: 0;
		background: #f7f4ef;
		padding: 0.55rem;
	}

	.markdown-toolbar button {
		min-height: 40px;
		border: 1px solid var(--color-line, #d8d2c8);
		background: #fff;
		padding: 0.45rem 0.7rem;
		font-size: 0.86rem;
	}

	.markdown-toolbar + textarea {
		border-top-left-radius: 0;
		border-top-right-radius: 0;
		font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
		line-height: 1.55;
	}

	.markdown-help {
		border: 1px solid var(--color-line, #d8d2c8);
		padding: 0.8rem 1rem;
	}

	.markdown-help summary {
		cursor: pointer;
		font-weight: 600;
	}

	.markdown-help p {
		margin: 0.65rem 0 0;
	}

	.preview-controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem;
	}

	.preview-controls span {
		color: var(--muted);
		font-size: 0.9rem;
	}

	.article-preview {
		max-height: 640px;
		overflow: auto;
		border: 1px solid var(--color-line, #d8d2c8);
		background: #fff;
		padding: clamp(1rem, 3vw, 2rem);
	}

	small {
		display: block;
		margin-top: 0.35rem;
	}

	@media (min-width: 960px) {
		.admin-shell {
			grid-template-columns: 230px minmax(0, 1fr);
			gap: 3rem;
		}

		.admin-nav {
			position: sticky;
			top: 1.5rem;
		}

		.content-workspace {
			grid-template-columns: minmax(0, 1fr) 360px;
		}
	}
</style>
