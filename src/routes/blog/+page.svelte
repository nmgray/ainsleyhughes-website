<script lang="ts">
	import BlogHero from '$lib/components/BlogHero.svelte';
	import JsonLd from '$lib/components/JsonLd.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { site } from '$lib/config';

	let { data } = $props();
	const blogImage = '/images/migrated/11-web-or-mls-Upmarketmedia-504Dro-48-22c7e2c9f.webp';
</script>

<Seo
	title={`Ojai Real Estate Blog | ${site.name}`}
	description="Educational articles covering California home selling, escrow, disclosures, pricing, and local real estate trends in Ojai, Ventura County, and Santa Barbara."
	image={blogImage}
/>
<JsonLd
	data={{
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'Blog',
				'@id': `${site.origin}/blog#blog`,
				name: 'Ainsley Hughes Real Estate Blog',
				description:
					'Educational articles about Ojai-area real estate, California home selling, pricing, escrow, disclosures, and local market conditions.',
				url: `${site.origin}/blog`,
				image: `${site.origin}${blogImage}`,
				publisher: { '@id': `${site.origin}/#agent` },
				blogPost: data.posts.map((post) => ({
					'@type': 'BlogPosting',
					'@id': `${site.origin}/blog/${post.slug}#article`,
					headline: post.title,
					description: post.seoDescription || post.excerpt,
					datePublished: post.published,
					dateModified: post.modified,
					url: `${site.origin}/blog/${post.slug}`
				}))
			},
			{
				'@type': 'BreadcrumbList',
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: site.origin },
					{ '@type': 'ListItem', position: 2, name: 'Blog', item: `${site.origin}/blog` }
				]
			}
		]
	}}
/>

<BlogHero />

<section class="blog-layout">
	<div class="blog-feed">
		{#each data.posts as post}
			<article class="blog-entry">
				<header>
					<h2><a href={`/blog/${post.slug}`}>{post.title}</a></h2>
					<time datetime={post.published}
						>{new Date(post.published).toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						})}</time
					>
				</header>
				{#if post.image}
					<a class="blog-entry-image" href={`/blog/${post.slug}`} tabindex="-1" aria-hidden="true">
						<img src={post.image} alt="" loading="lazy" />
					</a>
				{/if}
			</article>
		{/each}

		{#if data.pages > 1}
			<nav aria-label="Blog pagination" class="blog-pagination">
				{#if data.page > 1}<a class="outline-button" href={`?page=${data.page - 1}`}>Newer</a>{/if}
				{#if data.page < data.pages}<a class="outline-button" href={`?page=${data.page + 1}`}
						>Older</a
					>{/if}
			</nav>
		{/if}
	</div>

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
	.blog-layout {
		display: grid;
		grid-template-columns: minmax(0, 900px) 220px;
		gap: 4.5rem;
		width: min(1200px, calc(100% - 48px));
		margin: 0 auto;
		padding: 5.5rem 0 8rem;
	}

	.blog-feed {
		display: grid;
		gap: 6rem;
	}

	.blog-entry h2 {
		max-width: 820px;
		margin: 0 0 0.5rem;
		font-size: clamp(2rem, 3.1vw, 3rem);
		font-weight: 300;
		line-height: 1.2;
	}

	.blog-entry h2 a {
		color: inherit;
		text-decoration: none;
	}

	.blog-entry h2 a:hover {
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 0.15em;
	}

	.blog-entry time {
		display: block;
		margin-bottom: 1.75rem;
		color: var(--muted);
		font-size: 0.85rem;
	}

	.blog-entry-image {
		display: block;
		margin-bottom: 1.5rem;
	}

	.blog-entry-image img {
		width: 100%;
		aspect-ratio: 4 / 3;
		object-fit: cover;
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

	.blog-pagination {
		display: flex;
		gap: 1rem;
	}

	@media (max-width: 800px) {
		.blog-layout {
			grid-template-columns: 1fr;
			gap: 4rem;
			width: calc(100% - 40px);
			padding: 3.5rem 0 5rem;
		}

		.blog-feed {
			gap: 4.5rem;
		}

		.blog-entry h2 {
			font-size: 2rem;
		}
	}
</style>
