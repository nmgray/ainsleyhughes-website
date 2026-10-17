<script lang="ts">
	import { onMount } from 'svelte';
	import { adobeFontKitUrl } from '$lib/config';

	onMount(() => {
		const existing = document.querySelector<HTMLScriptElement>('script[data-adobe-fonts]');
		if (existing) return;

		const script = document.createElement('script');
		script.src = adobeFontKitUrl;
		script.async = true;
		script.dataset.adobeFonts = '';
		script.onload = () => {
			const typekit = (window as Window & { Typekit?: { load: () => void } }).Typekit;
			typekit?.load();
		};
		document.head.append(script);
	});
</script>

<svelte:head>
	<link rel="preconnect" href="https://use.typekit.net" crossorigin="anonymous" />
	<link rel="preconnect" href="https://p.typekit.net" crossorigin="anonymous" />
</svelte:head>
