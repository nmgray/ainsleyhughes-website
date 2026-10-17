<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import { site } from '$lib/config';

	let { data } = $props();

	const reviewGroups = [
		{
			theme: 'Clear, Steady Communication at Every Step',
			intro:
				'Clients frequently mention clear communication, responsiveness, and knowing what to expect throughout the process.',
			reviews: [
				{
					quote:
						'Ainsley was amazing to work with from start to finish! Her breadth of knowledge and professionalism got our home sold quickly and for a great price. The entire process was smooth and efficient, with great communication along the way. Highly recommend!',
					reviewer: 'K. W.',
					relationship: 'Seller',
					source: 'Zillow'
				},
				{
					quote: 'Knowledgeable, easy to work with, and made the whole process easy and fast.',
					reviewer: 'R. P.',
					relationship: 'Seller',
					source: 'Google'
				},
				{
					quote:
						'Ainsley provided exceptional service, going above and beyond our expectations. Her deep knowledge of the local real estate market, combined with her efficiency and responsiveness, was precisely what we needed for our urgent timeline. She expertly navigated every in and out of the process, ensuring a smooth and incredibly fast experience from start to finish.',
					reviewer: 'K. J.',
					relationship: 'Buyer',
					source: 'Google'
				}
			]
		},
		{
			theme: 'Thoughtful Pricing Strategy and Strong Results',
			intro:
				'Sellers often point to negotiation, preparation, and strategy that helped achieve strong outcomes.',
			reviews: [
				{
					quote:
						'Ainsley Hughes is an absolute rock star of a realtor! She is super sharp, knowledgeable and a pleasure to work with. Ainsley’s unique approach to selling had us four offers in less than 72 hours! Can’t recommend her enough!',
					reviewer: 'P. H.',
					relationship: 'Seller',
					source: 'Zillow'
				},
				{
					quote:
						'Thank goodness for Ainsley Hughes of Keller Williams of Ojai, CA! She was able to walk us through negotiations and ultimately the sale of our house. Her professionalism and wide range of skills made the sale possible. We can’t thank her enough!',
					reviewer: 'P. W.',
					relationship: 'Seller',
					source: 'Realtor'
				}
			]
		},
		{
			theme: 'Calm, Professional Guidance Through Big Decisions',
			intro:
				'Clients describe a calm, no-pressure approach and steady support when decisions felt stressful.',
			reviews: [
				{
					quote:
						'Ainsley was awesome. The sale of our home had multiple unforeseen problems and she guided us through with empathy and compassion. She always gave 110% to make sure that we got a fair deal and always showed honesty and professionalism at every bump in the road. I can’t recommend her highly enough.',
					reviewer: 'C. M.',
					relationship: 'Seller',
					source: 'Google'
				},
				{
					quote:
						'I had much ambivalence to sell initially, but Ainsley didn’t exert any pressure and was able to provide information to help me make a decision. She ably managed many of the hurdles in the sale of my home and communicated every step of the way. She worked tirelessly and was thorough in every aspect of the sale. I enthusiastically recommend her!',
					reviewer: 'V. G.',
					relationship: 'Seller',
					source: 'Google'
				}
			]
		},
		{
			theme: 'Professional, Honest, and Trust-Centered Representation',
			intro: 'Professionalism, integrity, and trust are common themes in client experiences.',
			reviews: [
				{
					quote:
						'Ainsley has been efficient and responsive, and she did an excellent job for us. She really loves what she’s doing, and it shows. I would highly recommend her.',
					reviewer: 'B. R.',
					relationship: 'Landlord',
					source: 'Google'
				}
			]
		}
	];
</script>

<Seo
	title="Ainsley Hughes real estate reviews | Ojai, CA"
	description="Read buyer and seller experiences with Ojai REALTOR® Ainsley Hughes."
	image="/images/migrated/image-asset-e651451ff.webp"
/>

<header class="source-page-hero reviews-hero">
	<img
		src="/images/migrated/image-asset-e651451ff.webp"
		alt="Mountain ridges surrounding the Ojai Valley"
		width="2500"
		height="1406"
	/>
	<h1>Reviews and Client Experiences</h1>
</header>

<main class="reviews-layout">
	<div class="reviews-content">
		<p class="reviews-intro">
			These reviews reflect work with buyers and sellers across Ojai, Ventura County, and Santa
			Barbara County. Clients consistently mention clear communication, thoughtful pricing guidance,
			and a calm, hands-on approach.
		</p>

		{#if data.managedReviews.length}
			<section class="review-group" aria-labelledby="recent-client-experiences">
				<h2 id="recent-client-experiences">Recent Client Experiences</h2>
				{#each data.managedReviews as review}
					<article class="review">
						<h3>{review.theme}</h3>
						<blockquote>“{review.quote}”</blockquote>
						<p class="review-attribution">
							{review.reviewerName}{review.relationship ? ` | ${review.relationship}` : ''}
							| <a href={review.sourceUrl} target="_blank" rel="noreferrer">{review.sourceName}</a>
						</p>
					</article>
				{/each}
			</section>
		{/if}

		{#each reviewGroups as group, groupIndex}
			<section class="review-group" aria-labelledby={`review-group-${groupIndex}`}>
				<h2 id={`review-group-${groupIndex}`}>{group.theme}</h2>
				<p class="group-intro">{group.intro}</p>
				{#each group.reviews as review}
					<article class="review">
						<blockquote>“{review.quote}”</blockquote>
						<p class="review-attribution">
							{review.reviewer} | {review.relationship} | {review.source}
						</p>
					</article>
				{/each}
			</section>
		{/each}
	</div>

	<aside class="reviews-contact contact-sidebar">
		<h2>Considering a Move?</h2>
		<p>
			<strong>{site.name}</strong><br />
			<a href={`tel:+1${site.phone.replaceAll('-', '')}`}
				>+1 ({site.phone.slice(0, 3)}) {site.phone.slice(4)}</a
			><br />
			<a href={`mailto:${site.email}`}>{site.email}</a>
		</p>
	</aside>
</main>

<style>
	.reviews-hero {
		height: clamp(440px, 50vw, 680px);
	}

	.reviews-hero h1 {
		width: min(1120px, calc(100% - 48px));
		font-size: clamp(2.5rem, 4vw, 3.6rem);
		font-weight: 300;
		white-space: nowrap;
	}

	.reviews-layout {
		display: grid;
		grid-template-columns: minmax(0, 880px) 220px;
		gap: clamp(55px, 7vw, 100px);
		width: min(1200px, calc(100% - 48px));
		margin: 0 auto;
		padding: 70px 0 125px;
	}

	.reviews-intro {
		max-width: 850px;
		margin-bottom: 3.15rem;
		font-size: 1rem;
		line-height: 1.65;
	}

	.review-group {
		margin-bottom: 3.5rem;
	}

	.review-group h2 {
		margin-bottom: 0.75rem;
		font-size: 1.3rem;
		font-weight: 600;
		letter-spacing: 0.01em;
	}

	.group-intro {
		margin-bottom: 1.8rem;
		color: #666;
		font-size: 0.95rem;
	}

	.review {
		margin: 0 0 2.25rem;
	}

	.review h3 {
		margin-bottom: 1rem;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	blockquote {
		margin: 0 0 0.7rem;
		max-width: 850px;
		font-size: clamp(1.15rem, 1.45vw, 1.35rem);
		font-weight: 300;
		line-height: 1.4;
	}

	.review-attribution {
		margin: 0;
		font-size: 0.82rem;
	}

	.review-attribution a {
		text-underline-offset: 0.18em;
	}

	.reviews-contact {
		position: sticky;
		top: 2rem;
		align-self: start;
	}

	.reviews-contact h2 {
		margin-bottom: 1.2rem;
		font-size: 1.35rem;
	}

	.reviews-contact p {
		font-size: 0.95rem;
		line-height: 1.7;
	}

	.reviews-contact a {
		text-decoration: none;
	}

	@media (max-width: 820px) {
		.reviews-hero {
			height: 470px;
		}

		.reviews-hero h1 {
			width: min(100% - 40px, 620px);
			font-size: clamp(2.25rem, 11vw, 3rem);
			line-height: 1.1;
			white-space: normal;
		}

		.reviews-layout {
			grid-template-columns: 1fr;
			gap: 3rem;
			width: min(100% - 40px, 680px);
			padding: 55px 0 85px;
		}

		.review-group {
			margin-bottom: 3.25rem;
		}

		blockquote {
			font-size: 1.2rem;
			line-height: 1.45;
		}

		.reviews-contact {
			position: static;
			padding-top: 2.5rem;
			border-top: 1px solid var(--line);
		}
	}
</style>
