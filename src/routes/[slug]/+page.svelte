<script lang="ts">
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import JsonLd from '$lib/components/JsonLd.svelte';
	import NeighborhoodMap from '$lib/components/NeighborhoodMap.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { neighborhoodMaps, site } from '$lib/config';

	let { data } = $props();
	const title = $derived(data.source?.title ?? data.content?.title ?? '');
	const description = $derived(
		data.source?.seoDescription || data.content?.description || site.description
	);
	const hero = $derived(data.content?.hero || data.source?.hero);
	const heroTitle = $derived(data.content?.kicker || title);
	const map = $derived(
		neighborhoodMaps[data.slug as keyof typeof neighborhoodMaps] as
			(typeof neighborhoodMaps)[keyof typeof neighborhoodMaps] | undefined
	);
	const howSections = [
		{
			name: 'What I believe my role actually is',
			description:
				'Helping clients understand their options and make informed real estate decisions.'
		},
		{
			name: 'How I approach pricing decisions',
			description:
				'Pricing strategy informed by comparable sales, competing listings, buyer behavior, and current market response.'
		},
		{
			name: 'What sellers can expect when working with me',
			description:
				'Clear preparation, timing, exposure, showing-feedback, and market-response guidance.'
		},
		{
			name: 'How I help buyers make confident decisions',
			description:
				'Context on pricing, competition, contract terms, risk, and long-term considerations.'
		},
		{
			name: 'What you will and will not get from me',
			description:
				'Clear communication and honest local guidance without pressure or unsupported promises.'
		}
	];
</script>

<Seo
	title={data.source?.seoTitle || `${title} — ${site.name}`}
	{description}
	image={hero}
	type={data.slug === 'how-i-work' ? 'profile' : 'website'}
/>
<JsonLd
	data={{
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': data.slug === 'how-i-work' ? 'AboutPage' : 'WebPage',
				'@id': `${site.origin}/${data.slug}#webpage`,
				name: title,
				description,
				url: `${site.origin}/${data.slug}`,
				about: { '@id': `${site.origin}/#agent` },
				mainEntity: { '@id': `${site.origin}/#agent` },
				...(hero
					? {
							primaryImageOfPage: {
								'@type': 'ImageObject',
								url: hero.startsWith('/') ? `${site.origin}${hero}` : hero
							}
						}
					: {}),
				...(data.slug === 'how-i-work'
					? {
							hasPart: howSections.map((section) => ({
								'@type': 'WebPageElement',
								name: section.name,
								description: section.description
							}))
						}
					: {})
			},
			{
				'@type': 'BreadcrumbList',
				itemListElement: [
					{
						'@type': 'ListItem',
						position: 1,
						name: 'Home',
						item: site.origin
					},
					{
						'@type': 'ListItem',
						position: 2,
						name: title,
						item: `${site.origin}/${data.slug}`
					}
				]
			}
		]
	}}
/>

{#if data.slug !== 'how-i-work'}
	<Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: title }]} />
{/if}

{#if hero}
	<header class:how-hero={data.slug === 'how-i-work'} class="source-page-hero">
		<img src={hero} alt="" fetchpriority="high" />
		<h1>{heroTitle}</h1>
	</header>
{:else}
	<header class="page-hero"><h1>{title}</h1></header>
{/if}

{#if data.slug === 'how-i-work' && data.source?.html}
	<section class="how-layout">
		<article class="how-rich content">
			{@html data.source.html}
		</article>
		<aside class="contact-sidebar">
			<h2>Considering a Move?</h2>
			<strong>Ainsley Hughes</strong>
			<a href={`tel:${site.phone.replaceAll('-', '')}`}>+1 {site.phone}</a>
			<a href={`mailto:${site.email}`}>{site.email}</a>
		</aside>
	</section>
{:else if data.source?.html}
	<article class="source-rich content">
		{@html data.source.html}
	</article>
{:else if data.content}
	<article class="content section narrow">
		{#each data.content.sections as section}
			<section>
				<h2>{section.heading}</h2>
				<p>{section.body}</p>
				{#if section.items}
					<ul>
						{#each section.items as item}<li>{item}</li>{/each}
					</ul>
				{/if}
			</section>
		{/each}
	</article>
{/if}

{#if map}
	<NeighborhoodMap {...map} />
{/if}

{#if data.content?.cta && !data.source}
	<section class="cta">
		<div>
			<h2>{data.content.cta.title}</h2>
			<p>{data.content.cta.text}</p>
		</div>
		<a class="button" href={data.content.cta.href}>{data.content.cta.label}</a>
	</section>
{/if}

<style>
	.how-layout {
		display: grid;
		grid-template-columns: minmax(0, 860px) 220px;
		gap: 4.5rem;
		width: min(1200px, calc(100% - 48px));
		margin: 0 auto;
		padding: 4.25rem 0 7.5rem;
	}

	.how-rich :global(h2) {
		margin: 2.9rem 0 1.15rem;
		font-size: 1.25rem;
		font-weight: 600;
		line-height: 1.3;
	}

	.how-rich :global(h2:first-of-type) {
		margin-top: 4.75rem;
	}

	.how-rich :global(p),
	.how-rich :global(li) {
		font-size: 0.95rem;
		line-height: 1.65;
	}

	.how-rich :global(ul) {
		margin: 1rem 0 1.5rem;
		padding-left: 1.75rem;
	}

	.how-rich :global(li p) {
		margin: 0.35rem 0;
	}

	.how-layout aside {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.3rem;
	}

	.how-layout aside h2 {
		margin: 0 0 1rem;
		font-size: 1.25rem;
		font-weight: 400;
	}

	.how-layout aside strong,
	.how-layout aside a {
		font-size: 0.9rem;
	}

	.how-layout aside a {
		min-height: 24px;
		color: inherit;
	}

	:global(.how-hero h1) {
		width: min(1050px, calc(100% - 48px));
		font-size: clamp(3rem, 4vw, 4rem);
		white-space: normal;
	}

	:global(.how-hero) {
		height: 720px;
	}

	@media (max-width: 760px) {
		.how-layout {
			grid-template-columns: 1fr;
			gap: 3.5rem;
			width: calc(100% - 40px);
			padding: 3rem 0 5rem;
		}

		.how-rich :global(h2:first-of-type) {
			margin-top: 3.5rem;
		}

		.how-rich :global(h2) {
			margin-top: 2.25rem;
			font-size: 0.98rem;
			line-height: 1.25;
		}

		.how-rich :global(p),
		.how-rich :global(li) {
			font-size: 0.875rem;
			line-height: 1.55;
		}

		:global(.how-hero) {
			height: 470px;
		}

		:global(.how-hero h1) {
			width: 230px;
			font-size: 2.65rem;
			line-height: 1.28;
		}
	}
</style>
