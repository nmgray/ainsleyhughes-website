<script lang="ts">
	import './layout.css';
	import AdobeFonts from '$lib/components/AdobeFonts.svelte';
	import CookieConsent from '$lib/components/CookieConsent.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Header from '$lib/components/Header.svelte';
	import LocalAssistant from '$lib/components/LocalAssistant.svelte';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" type="image/png" href="/kw-favicon.png" />
	<link rel="apple-touch-icon" href="/kw-favicon.png" />
	<meta name="theme-color" content="#f3efe8" />
	<meta name="format-detection" content="telephone=no" />
</svelte:head>

<AdobeFonts />
<Header />
<main id="main" tabindex="-1">{@render children()}</main>
<Footer />
<CookieConsent />
<LocalAssistant />
