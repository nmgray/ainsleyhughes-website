<script lang="ts">
	import { page } from '$app/state';
	import { site } from '$lib/config';

	let {
		title,
		description = site.description,
		image = site.defaultImage,
		type = 'website',
		noindex = false
	}: {
		title: string;
		description?: string;
		image?: string | null;
		type?: string;
		noindex?: boolean;
	} = $props();

	let canonical = $derived(`${site.origin}${page.url.pathname}`);
	let socialImage = $derived(
		(image ?? site.defaultImage).startsWith('/')
			? `${site.origin}${image ?? site.defaultImage}`
			: (image ?? site.defaultImage)
	);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />
	<meta property="og:type" content={type} />
	<meta property="og:site_name" content={site.name} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={socialImage} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={socialImage} />
	{#if noindex}<meta name="robots" content="noindex,nofollow" />{/if}
</svelte:head>
