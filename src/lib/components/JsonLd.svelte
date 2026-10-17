<script lang="ts">
	let { data }: { data: Record<string, unknown> | Record<string, unknown>[] } = $props();
	const serialized = $derived(
		'<script type="application/ld+json">' +
			JSON.stringify(data).replaceAll('<', '\\u003c') +
			'</' +
			'script>'
	);
</script>

<svelte:head>
	{@html serialized}
</svelte:head>
