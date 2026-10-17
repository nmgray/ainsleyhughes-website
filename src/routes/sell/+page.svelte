<script lang="ts">
	import JsonLd from '$lib/components/JsonLd.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import ValuationForm from '$lib/components/ValuationForm.svelte';
	import { site } from '$lib/config';

	const faqs = [
		{
			question: 'How is my home’s value determined?',
			answer:
				'A useful valuation considers recent sales, active competition, condition, location, lot, improvements, and current buyer behavior.'
		},
		{
			question: 'Should I renovate before selling?',
			answer:
				'Not automatically. The right preparation depends on likely buyers, the property, timing, and whether an improvement is likely to return more than it costs.'
		}
	];
</script>

<Seo
	title={`Sell your Ojai home — ${site.name}`}
	description="Get a thoughtful, property-specific Ojai home valuation and a clear strategy for preparing, pricing, and selling."
	image="/images/migrated/image-asset-b0860c85c.webp"
/>
<JsonLd
	data={{
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'Service',
				name: 'Ojai home selling and property valuation',
				provider: { '@id': `${site.origin}/#agent` },
				areaServed: ['Ojai Valley', 'West Ventura County', 'South Santa Barbara County'],
				url: `${site.origin}/sell`
			},
			{
				'@type': 'FAQPage',
				mainEntity: faqs.map((faq) => ({
					'@type': 'Question',
					name: faq.question,
					acceptedAnswer: { '@type': 'Answer', text: faq.answer }
				}))
			}
		]
	}}
/>

<header class="source-page-hero">
	<img src="/images/migrated/image-asset-b0860c85c.webp" alt="Blue doors and outdoor seating" />
	<h1>Thinking of Selling?</h1>
</header>

<section class="source-form-layout">
	<div>
		<h2>Request your free, no-obligation valuation</h2>
		<p>
			Share a few details for a personalized property review grounded in current local market
			behavior, or review Ainsley’s <a href="/how-i-work">approach to real estate strategy</a>.
		</p>
		<ValuationForm />
	</div>
	<aside class="contact-sidebar">
		<h3>Considering a move?</h3>
		<strong>Ainsley Hughes</strong>
		<a href="tel:18058965383">+1 (805) 896 5383</a>
		<a href="mailto:ainsleyhughes@kw.com">ainsleyhughes@kw.com</a>
	</aside>
</section>

<section class="section">
	<div class="card-grid">
		<article class="info-card">
			<h3>Understand the property</h3>
			<p>Condition, location, improvements, risks, and the details buyers will notice.</p>
		</article>
		<article class="info-card">
			<h3>Price for the market</h3>
			<p>Comparable sales matter, but so do current competition, buyer behavior, and timing.</p>
		</article>
		<article class="info-card">
			<h3>Manage the transaction</h3>
			<p>
				Preparation, exposure, negotiation, inspections, and escrow handled with steady
				communication.
			</p>
		</article>
	</div>
</section>

<section class="faq section narrow">
	<h2>What Ojai sellers often ask</h2>
	{#each faqs as faq}
		<details>
			<summary>{faq.question}</summary>
			<p>{faq.answer}</p>
		</details>
	{/each}
</section>
