<script lang="ts">
	import { onMount } from 'svelte';

	let { name, latitude, longitude }: { name: string; latitude: number; longitude: number } =
		$props();
	let allowed = $state(false);

	function readConsent() {
		try {
			const stored = localStorage.getItem('ainsley-cookie-consent');
			allowed = stored ? Boolean((JSON.parse(stored) as { marketing?: boolean }).marketing) : false;
		} catch {
			allowed = false;
		}
	}

	function requestConsent() {
		window.dispatchEvent(new Event('openconsentpreferences'));
	}

	onMount(() => {
		readConsent();
		const update = () => readConsent();
		window.addEventListener('consentchange', update);
		return () => window.removeEventListener('consentchange', update);
	});

	const mapUrl = $derived(
		`https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`
	);
</script>

<section class="mx-auto w-[min(980px,calc(100%-48px))] pb-[130px]" aria-labelledby="map-title">
	<h2 id="map-title" class="mb-6 text-[2rem] font-light">{name} map</h2>
	{#if allowed}
		<iframe
			class="h-[420px] w-full border-0"
			title={`Map of ${name}`}
			src={mapUrl}
			loading="lazy"
			referrerpolicy="no-referrer-when-downgrade"
		></iframe>
	{:else}
		<div
			class="grid min-h-[280px] place-items-center border border-line bg-[#f6f6f4] p-8 text-center"
		>
			<div>
				<p class="mb-5">
					Enable marketing and embedded media cookies to view the interactive Google map.
				</p>
				<button class="outline-button" type="button" onclick={requestConsent}>Manage cookies</button
				>
			</div>
		</div>
	{/if}
</section>
