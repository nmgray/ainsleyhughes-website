<script lang="ts">
	let { items }: { items: { label: string; href?: string }[] } = $props();
</script>

<nav
	class="mx-auto flex w-[min(1200px,calc(100%-48px))] gap-2 py-5 text-[11px] tracking-[.08em] uppercase"
	aria-label="Breadcrumb"
>
	{#each items as item, index}
		{#if index > 0}<span aria-hidden="true">/</span>{/if}
		{#if item.href}
			<a class="underline-offset-4 hover:underline" href={item.href}>{item.label}</a>
		{:else}
			<span aria-current="page">{item.label}</span>
		{/if}
	{/each}
</nav>
