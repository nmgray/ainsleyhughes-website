<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import { site } from '$lib/config';

	const properties = [
		{
			status: 'Active listing',
			address: '65 Baldwin Road, Ojai',
			price: '$899,000',
			description:
				'Nearly 13,000 square feet of highly visible commercial land near the junction of Highways 150 and 33, with a recently renovated 720-square-foot structure, flat parcel, and generous on-site parking.',
			image: '/images/migrated/3-web-or-mls-Upmarketmedia-65Bal-9-46d7dc649.webp'
		},
		{
			status: 'Sold · Multiple offers in 2 days',
			address: '213 South Carrillo, Ojai',
			price: '$940,000',
			description:
				'A lovingly maintained home with mountain views, updated bathrooms, a covered patio, and an oversized finished garage in the Ojai Terrace neighborhood.',
			image: '/images/migrated/3-web-or-mls-UpmarketMedia-213Carillo-105a-baded83bf.webp'
		},
		{
			status: 'Sold · Multiple offers in 2 days',
			address: '504 Drown Avenue, Ojai',
			price: '$970,000',
			description:
				'An Ojai cottage with Topa Topa and Chief’s Peak views, a fireplace, hardwood floors, and indoor-outdoor living near downtown.',
			image: '/images/migrated/0-web-or-mls-Upmarketmedia-504Dro-5a-838b324e5.webp'
		}
	];
</script>

<Seo
	title={`Featured properties — ${site.name}`}
	description="View current and recently sold properties represented by Ainsley Hughes."
/>
<header class="page-hero">
	<p class="eyebrow">Portfolio</p>
	<h1>Featured properties</h1>
</header>
<section class="section">
	<div class="post-grid">
		{#each properties as property}
			<article class="post-card">
				<img src={property.image} alt={property.address} loading="lazy" />
				<p class="eyebrow">{property.status}</p>
				<h2>{property.address}</h2>
				<p><strong>{property.price}</strong></p>
				<p>{property.description}</p>
				<a class="text-link" href="/contact?topic=property">Ask about this property →</a>
			</article>
		{/each}
	</div>
</section>
