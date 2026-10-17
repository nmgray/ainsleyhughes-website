<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import { site } from '$lib/config';
	let { data } = $props();
</script>

<Seo title={`${data.category} archive — ${site.name}`} noindex />
<header class="page-hero">
	<p class="eyebrow">Archive category</p>
	<h1>{data.category}</h1>
</header>
<section class="section">
	<div class="post-grid">
		{#each data.posts as post}
			<a class="post-card" href={`/oldblog/${post.slug}`}
				><h2>{post.title}</h2>
				<p>{post.excerpt}</p></a
			>
		{:else}
			<p>No retained articles are assigned to this category.</p>
		{/each}
	</div>
</section>
