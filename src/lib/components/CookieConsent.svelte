<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount, tick } from 'svelte';

	type Consent = { analytics: boolean; marketing: boolean; updatedAt: string };
	let visible = $state(false);
	let managing = $state(false);
	let analytics = $state(false);
	let marketing = $state(false);
	let analyticsInput = $state<HTMLInputElement>();
	let manageButton = $state<HTMLButtonElement>();
	let returnFocus: HTMLElement | null = null;

	async function save(next: Omit<Consent, 'updatedAt'>) {
		if (!browser) return;
		const consent = { ...next, updatedAt: new Date().toISOString() };
		localStorage.setItem('ainsley-cookie-consent', JSON.stringify(consent));
		window.dispatchEvent(new CustomEvent('consentchange', { detail: consent }));
		visible = false;
		managing = false;
		await tick();
		if (returnFocus?.isConnected) returnFocus.focus();
		else document.querySelector<HTMLElement>('#main')?.focus();
		returnFocus = null;
	}

	async function showManager() {
		managing = true;
		await tick();
		analyticsInput?.focus();
	}

	async function returnToBanner() {
		managing = false;
		await tick();
		manageButton?.focus();
	}

	onMount(() => {
		const stored = localStorage.getItem('ainsley-cookie-consent');
		if (stored) {
			try {
				const consent = JSON.parse(stored) as Consent;
				analytics = Boolean(consent.analytics);
				marketing = Boolean(consent.marketing);
			} catch {
				localStorage.removeItem('ainsley-cookie-consent');
				visible = true;
			}
		} else {
			visible = true;
		}

		const open = () => {
			returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
			visible = true;
			void showManager();
		};
		document.querySelector('[data-cookie-preferences]')?.addEventListener('click', open);
		window.addEventListener('openconsentpreferences', open);
		return () => {
			document.querySelector('[data-cookie-preferences]')?.removeEventListener('click', open);
			window.removeEventListener('openconsentpreferences', open);
		};
	});
</script>

{#if visible}
	<section class="consent" aria-label="Cookie preferences" aria-live="polite">
		{#if managing}
			<h2>Cookie preferences</h2>
			<p>
				Essential storage keeps this site secure and remembers these choices. Optional categories
				remain off unless you enable them.
			</p>
			<label><input type="checkbox" checked disabled /> Essential — always active</label>
			<label
				><input bind:this={analyticsInput} type="checkbox" bind:checked={analytics} /> Analytics and performance</label
			>
			<label><input type="checkbox" bind:checked={marketing} /> Marketing and embedded media</label>
			<div class="actions">
				<button class="button" onclick={() => save({ analytics, marketing })}>Save choices</button>
				<button class="button secondary" onclick={returnToBanner}>Back</button>
			</div>
		{:else}
			<h2>Your privacy choices</h2>
			<p>
				We use optional cookies only with your permission. Choose whether analytics and marketing
				technologies may load. <a href="/privacy">Read the privacy notice</a>.
			</p>
			<div class="actions">
				<button class="button" onclick={() => save({ analytics: true, marketing: true })}
					>Accept all</button
				>
				<button
					class="button secondary"
					onclick={() => save({ analytics: false, marketing: false })}>Decline all</button
				>
				<button bind:this={manageButton} class="text-button" onclick={showManager}
					>Manage cookies</button
				>
			</div>
		{/if}
	</section>
{/if}
