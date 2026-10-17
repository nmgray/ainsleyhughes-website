<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import { site } from '$lib/config';
	let { data } = $props();
</script>

<Seo
	title={`${data.post.title} — ${site.name}`}
	description={data.post.seoDescription}
	image={data.post.image}
	type="article"
/>
<header class="page-hero article-hero">
	<p class="eyebrow">From the archive</p>
	<h1>{data.post.title}</h1>
	<time datetime={data.post.published}>{new Date(data.post.published).toLocaleDateString()}</time>
</header>
<article class="content section narrow">{@html data.post.body}</article>
