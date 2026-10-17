<script lang="ts">
	import ArticleEngagement from '$lib/components/ArticleEngagement.svelte';
	import BlogHero from '$lib/components/BlogHero.svelte';
	import JsonLd from '$lib/components/JsonLd.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { site } from '$lib/config';

	let { data } = $props();
	const metadataTitle = $derived(
		data.post.seoTitle.includes(site.name)
			? data.post.seoTitle
			: `${data.post.seoTitle} — ${site.name}`
	);
	const articleUrl = $derived(`${site.origin}/blog/${data.post.slug}`);
	const articleImage = $derived(
		data.post.image
			? data.post.image.startsWith('/')
				? `${site.origin}${data.post.image}`
				: data.post.image
			: undefined
	);
	const wordCount = $derived(
		data.post.body
			.replace(/<[^>]+>/g, ' ')
			.trim()
			.split(/\s+/)
			.filter(Boolean).length
	);
</script>

<Seo
	title={metadataTitle}
	description={data.post.seoDescription}
	image={data.post.image}
	type="article"
/>
<JsonLd
	data={{
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'BlogPosting',
				'@id': `${articleUrl}#article`,
				headline: data.post.title,
				description: data.post.seoDescription,
				...(articleImage ? { image: { '@type': 'ImageObject', url: articleImage } } : {}),
				datePublished: data.post.published,
				dateModified: data.post.modified,
				author: { '@id': `${site.origin}/#agent` },
				publisher: { '@id': `${site.origin}/#agent` },
				mainEntityOfPage: { '@id': articleUrl },
				isPartOf: { '@id': `${site.origin}/blog#blog` },
				url: articleUrl,
				inLanguage: 'en-US',
				wordCount,
				...(data.post.categories.length ? { articleSection: data.post.categories } : {}),
				...(data.post.tags.length ? { keywords: data.post.tags.join(', ') } : {})
			},
			{
				'@type': 'BreadcrumbList',
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: site.origin },
					{ '@type': 'ListItem', position: 2, name: 'Blog', item: `${site.origin}/blog` },
					{ '@type': 'ListItem', position: 3, name: data.post.title, item: articleUrl }
				]
			}
		]
	}}
/>

<BlogHero pageTitle={false} />

<section class="article-layout">
	<article>
		<header class="article-heading">
			<h1>{data.post.title}</h1>
			<time datetime={data.post.published}
				>{new Date(data.post.published).toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})}</time
			>
		</header>
		<div class="blog-article-body content">
			{@html data.post.body}
		</div>
		<footer>
			<div class="article-byline">By {data.post.author}</div>
			<ArticleEngagement
				slug={data.post.slug}
				title={data.post.title}
				url={articleUrl}
				initialCount={data.engagement.count}
				initialLiked={data.engagement.liked}
			/>
		</footer>
		<nav class="article-navigation" aria-label="Related articles">
			{#if data.previous}<a href={`/blog/${data.previous.slug}`}>← {data.previous.title}</a>{/if}
			{#if data.next}<a href={`/blog/${data.next.slug}`}>{data.next.title} →</a>{/if}
		</nav>
	</article>

	<aside class="blog-contact contact-sidebar">
		<h2>Considering a Move?</h2>
		<strong>{site.name}</strong>
		<a href={`tel:+1${site.phone.replaceAll('-', '')}`}
			>+1 ({site.phone.slice(0, 3)}) {site.phone.slice(4)}</a
		>
		<a href={`mailto:${site.email}`}>{site.email}</a>
	</aside>
</section>

<style>
	.article-layout {
		display: grid;
		grid-template-columns: minmax(0, 900px) 220px;
		gap: 4.5rem;
		width: min(1200px, calc(100% - 48px));
		margin: 0 auto;
		padding: 4.5rem 0 8rem;
	}

	.article-heading {
		margin-bottom: 5rem;
	}

	.article-heading h1 {
		margin: 0 0 0.65rem;
		font-size: clamp(2rem, 3vw, 3rem);
		font-weight: 300;
		line-height: 1.2;
	}

	.article-heading time {
		color: var(--muted);
		font-size: 0.85rem;
	}

	.blog-article-body :global(h2) {
		margin: 2.8rem 0 1rem;
		font-size: 1.45rem;
		line-height: 1.25;
	}

	.blog-article-body :global(h3) {
		margin: 2rem 0 0.8rem;
		font-size: 1.1rem;
	}

	.blog-article-body :global(p),
	.blog-article-body :global(li) {
		font-size: 0.95rem;
		line-height: 1.7;
	}

	.blog-article-body :global(img) {
		width: 100%;
	}

	.article-byline {
		margin-top: 4rem;
		border-top: 1px solid var(--line);
		padding-top: 1rem;
		color: var(--muted);
		font-size: 0.85rem;
	}

	.article-navigation {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
		margin-top: 3rem;
	}

	.article-navigation a:last-child {
		text-align: right;
	}

	.blog-contact {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.3rem;
	}

	.blog-contact h2 {
		margin: 0 0 1rem;
		font-size: 1.25rem;
		font-weight: 400;
	}

	.blog-contact strong,
	.blog-contact a {
		font-size: 0.9rem;
	}

	.blog-contact a {
		min-height: 24px;
		color: inherit;
	}

	@media (max-width: 800px) {
		.article-layout {
			grid-template-columns: 1fr;
			gap: 4rem;
			width: calc(100% - 40px);
			padding: 3.5rem 0 5rem;
		}

		.article-heading {
			margin-bottom: 3.5rem;
		}

		.article-heading h1 {
			font-size: 2rem;
		}

		.blog-article-body :global(h2) {
			font-size: 1.25rem;
		}

		.blog-article-body :global(p),
		.blog-article-body :global(li) {
			font-size: 0.95rem;
		}

		.article-navigation {
			grid-template-columns: 1fr;
		}

		.article-navigation a:last-child {
			text-align: left;
		}
	}
</style>
