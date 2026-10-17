<script lang="ts">
	let props: {
		slug: string;
		title: string;
		url: string;
		initialCount: number;
		initialLiked: boolean;
	} = $props();

	// svelte-ignore state_referenced_locally
	let count = $state(props.initialCount);
	// svelte-ignore state_referenced_locally
	let liked = $state(props.initialLiked);
	let busy = $state(false);
	let message = $state('');

	const encodedUrl = $derived(encodeURIComponent(props.url));
	const encodedTitle = $derived(encodeURIComponent(props.title));

	async function toggleLike() {
		busy = true;
		message = '';
		try {
			const response = await fetch(`/api/posts/${props.slug}/like`, { method: 'POST' });
			const result = (await response.json()) as {
				count?: number;
				liked?: boolean;
				message?: string;
			};
			if (!response.ok || typeof result.count !== 'number' || typeof result.liked !== 'boolean') {
				throw new Error(result.message || 'Your like could not be saved.');
			}
			count = result.count;
			liked = result.liked;
			message = liked ? 'Article liked.' : 'Like removed.';
		} catch (error) {
			message = error instanceof Error ? error.message : 'Your like could not be saved.';
		} finally {
			busy = false;
		}
	}

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(props.url);
			message = 'Article link copied.';
		} catch {
			message = 'Copying failed. Select the link from your browser address bar.';
		}
	}

	async function nativeShare() {
		if (!navigator.share) {
			await copyLink();
			return;
		}
		try {
			await navigator.share({ title: props.title, url: props.url });
			message = 'Share options opened.';
		} catch (error) {
			if (error instanceof DOMException && error.name === 'AbortError') return;
			message = 'Sharing could not be opened.';
		}
	}
</script>

<div class="article-engagement">
	<button
		class:liked
		type="button"
		aria-pressed={liked}
		aria-label={liked ? `Remove like. ${count} likes` : `Like this article. ${count} likes`}
		disabled={busy}
		onclick={toggleLike}
	>
		<span aria-hidden="true">{liked ? '♥' : '♡'}</span>
		<span>{count}</span>
	</button>

	<details>
		<summary>Share</summary>
		<div>
			<button type="button" onclick={nativeShare}>Share article</button>
			<button type="button" onclick={copyLink}>Copy link</button>
			<a href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}>Email</a>
			<a
				href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
				target="_blank"
				rel="noopener noreferrer">Facebook</a
			>
			<a
				href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
				target="_blank"
				rel="noopener noreferrer">LinkedIn</a
			>
		</div>
	</details>
	<p class="sr-only" role="status">{message}</p>
</div>

<style>
	.article-engagement {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 1rem;
		margin-top: 1.5rem;
		border-top: 1px solid var(--line);
		padding-top: 1rem;
	}

	.article-engagement > button,
	summary {
		display: inline-flex;
		min-height: 44px;
		align-items: center;
		gap: 0.4rem;
		border: 0;
		background: transparent;
		padding: 0.5rem;
		color: inherit;
		font: inherit;
		cursor: pointer;
	}

	.article-engagement > button span:first-child {
		font-size: 1.25rem;
	}

	.article-engagement > button.liked {
		color: #873b35;
	}

	details {
		position: relative;
	}

	summary {
		list-style: none;
	}

	summary::-webkit-details-marker {
		display: none;
	}

	details > div {
		position: absolute;
		z-index: 2;
		right: 0;
		display: grid;
		min-width: 170px;
		border: 1px solid var(--line);
		background: #fff;
		box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
	}

	details a,
	details button {
		min-height: 44px;
		border: 0;
		background: transparent;
		padding: 0.7rem 1rem;
		color: inherit;
		font: inherit;
		text-align: left;
		text-decoration: none;
	}

	details a:hover,
	details button:hover {
		background: #f5f3ef;
	}
</style>
