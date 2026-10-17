<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import { site } from '$lib/config';
	let { data } = $props();
</script>

<Seo
	title={`Archive — ${site.name}`}
	description="Earlier stories and local Ojai articles from Ainsley Hughes."
/>
<header class="page-hero">
	<p class="eyebrow">Archive</p>
	<h1>Earlier stories</h1>
</header>
<section class="section">
	<div class="post-grid">
		{#each data.posts as post}
			<a class="post-card" href={`/oldblog/${post.slug}`}>
				{#if post.image}<img src={post.image} alt={post.imageAlt} loading="lazy" />{:else}<div
						class="post-placeholder"
					></div>{/if}
				<h2>{post.title}</h2>
				<p>{post.excerpt}</p>
			</a>
		{/each}
	</div>
</section>
