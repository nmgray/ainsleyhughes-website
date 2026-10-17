<script lang="ts">
	import { onMount, tick } from 'svelte';

	let open = $state(false);
	let question = $state('');
	let answer = $state('');
	let loading = $state(false);
	let toggleButton: HTMLButtonElement;
	let questionInput = $state<HTMLTextAreaElement>();

	async function toggle() {
		open = !open;
		await tick();
		if (open) questionInput?.focus();
		else toggleButton?.focus();
	}

	onMount(() => {
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key !== 'Escape' || !open) return;
			open = false;
			tick().then(() => toggleButton?.focus());
		};
		document.addEventListener('keydown', closeOnEscape);
		return () => document.removeEventListener('keydown', closeOnEscape);
	});

	async function ask(event: SubmitEvent) {
		event.preventDefault();
		loading = true;
		try {
			const response = await fetch('/api/assistant', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ question })
			});
			const result = (await response.json()) as { answer?: string; message?: string };
			if (!response.ok) throw new Error(result.message ?? 'Unable to answer right now.');
			answer = result.answer ?? '';
		} catch (error) {
			answer = error instanceof Error ? error.message : 'Unable to answer right now.';
		} finally {
			loading = false;
		}
	}
</script>

<aside class="assistant">
	<button
		bind:this={toggleButton}
		class="assistant-toggle"
		aria-expanded={open}
		aria-controls="local-assistant"
		onclick={toggle}>Ask about Ojai real estate</button
	>
	{#if open}
		<div
			id="local-assistant"
			class="assistant-panel"
			role="region"
			aria-labelledby="local-assistant-title"
		>
			<h2 id="local-assistant-title">Ask Ainsley’s local guide</h2>
			<p>Get a quick, general answer from the site’s local FAQ library.</p>
			<form onsubmit={ask} aria-busy={loading}>
				<label
					>Your question
					<textarea
						bind:this={questionInput}
						bind:value={question}
						required
						minlength="4"
						maxlength="500"
						rows="3"
						placeholder="How should I price my Ojai home?"></textarea>
				</label>
				<button class="button" disabled={loading}>{loading ? 'Checking…' : 'Ask'}</button>
			</form>
			{#if answer}
				<div class="assistant-answer" role="status" aria-live="polite">
					<p>{answer}</p>
					<a href="/contact">Ask about your specific situation →</a>
				</div>
			{/if}
		</div>
	{/if}
</aside>
