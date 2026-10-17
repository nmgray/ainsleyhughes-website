<script lang="ts">
	import JsonLd from '$lib/components/JsonLd.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { site } from '$lib/config';

	let { data } = $props();

	const faqs = [
		{
			question: 'What areas does Ainsley Hughes serve?',
			answer:
				'Ainsley helps buyers and sellers throughout the Ojai Valley, West Ventura County, and South Santa Barbara County.'
		},
		{
			question: 'Does Ainsley work with both buyers and sellers?',
			answer:
				'Yes. Ainsley advises buyers, sellers, and property owners through residential sales, negotiation, property management, and complex transactions.'
		},
		{
			question: 'How do I start a conversation about buying or selling?',
			answer:
				'Use the contact page or call 805-896-5383. An initial conversation can cover timing, priorities, property details, and practical next steps without obligation.'
		}
	];
	const serviceAreas = [
		{ '@id': `${site.origin}/#ojai-valley` },
		{ '@id': `${site.origin}/#west-ventura-county` },
		{ '@id': `${site.origin}/#south-santa-barbara-county` }
	];
</script>

<Seo title={site.title} />
<JsonLd
	data={{
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'RealEstateAgent',
				'@id': `${site.origin}/#agent`,
				name: site.name,
				url: site.origin,
				mainEntityOfPage: { '@id': `${site.origin}/#webpage` },
				image: { '@id': `${site.origin}/#primaryimage` },
				logo: `${site.origin}${site.logo}`,
				description: site.description,
				telephone: site.phone,
				email: site.email,
				address: { '@type': 'PostalAddress', ...site.address },
				geo: { '@type': 'GeoCoordinates', latitude: 34.448, longitude: -119.2429 },
				areaServed: serviceAreas,
				contactPoint: {
					'@type': 'ContactPoint',
					contactType: 'real estate inquiries',
					telephone: site.phone,
					email: site.email,
					areaServed: ['Ojai Valley', 'West Ventura County', 'South Santa Barbara County'],
					availableLanguage: 'English'
				},
				knowsAbout: [
					'Ojai real estate market',
					'Residential home buying and selling',
					'Investment properties',
					'Real estate negotiation',
					'Local zoning and land use'
				],
				identifier: {
					'@type': 'PropertyValue',
					propertyID: 'California DRE License',
					value: '02105320'
				},
				hasCredential: [
					{
						'@type': 'EducationalOccupationalCredential',
						name: 'California Real Estate License 02105320',
						credentialCategory: 'Professional license',
						recognizedBy: {
							'@type': 'GovernmentOrganization',
							name: 'California Department of Real Estate'
						}
					},
					{
						'@type': 'EducationalOccupationalCredential',
						name: 'Real Estate Negotiation Expert (RENE)'
					},
					{
						'@type': 'EducationalOccupationalCredential',
						name: 'Seller Representative Specialist (SRS)'
					},
					{
						'@type': 'EducationalOccupationalCredential',
						name: 'GREEN Designation'
					}
				],
				parentOrganization: { '@id': `${site.origin}/#brokerage` },
				makesOffer: [
					{
						'@type': 'Offer',
						itemOffered: {
							'@type': 'Service',
							name: 'Residential buyer representation',
							serviceType: 'Real estate buyer representation',
							areaServed: serviceAreas,
							provider: { '@id': `${site.origin}/#agent` }
						}
					},
					{
						'@type': 'Offer',
						itemOffered: {
							'@type': 'Service',
							name: 'Residential seller representation',
							serviceType: 'Real estate seller representation',
							areaServed: serviceAreas,
							provider: { '@id': `${site.origin}/#agent` }
						}
					}
				],
				sameAs: site.social
			},
			{
				'@type': 'Organization',
				'@id': `${site.origin}/#brokerage`,
				name: site.brokerage,
				logo: `${site.origin}${site.logo}`
			},
			{
				'@type': 'Place',
				'@id': `${site.origin}/#ojai-valley`,
				name: 'Ojai Valley',
				geo: {
					'@type': 'GeoCoordinates',
					latitude: 34.4480495,
					longitude: -119.242889
				},
				containedInPlace: { '@id': `${site.origin}/#ventura-county` }
			},
			{
				'@type': 'Place',
				'@id': `${site.origin}/#west-ventura-county`,
				name: 'West Ventura County',
				containedInPlace: { '@id': `${site.origin}/#ventura-county` }
			},
			{
				'@type': 'AdministrativeArea',
				'@id': `${site.origin}/#ventura-county`,
				name: 'Ventura County',
				sameAs: 'https://www.openstreetmap.org/relation/396505',
				geo: {
					'@type': 'GeoCoordinates',
					latitude: 34.4458248,
					longitude: -119.0779359
				}
			},
			{
				'@type': 'Place',
				'@id': `${site.origin}/#south-santa-barbara-county`,
				name: 'South Santa Barbara County',
				containedInPlace: { '@id': `${site.origin}/#santa-barbara-county` }
			},
			{
				'@type': 'AdministrativeArea',
				'@id': `${site.origin}/#santa-barbara-county`,
				name: 'Santa Barbara County',
				sameAs: 'https://www.openstreetmap.org/relation/396510',
				geo: {
					'@type': 'GeoCoordinates',
					latitude: 34.7136533,
					longitude: -119.985823
				}
			},
			{
				'@type': 'WebSite',
				'@id': `${site.origin}/#website`,
				url: `${site.origin}/`,
				name: site.name,
				description: site.description,
				publisher: { '@id': `${site.origin}/#agent` },
				inLanguage: 'en-US'
			},
			{
				'@type': 'ImageObject',
				'@id': `${site.origin}/#primaryimage`,
				url: `${site.origin}${site.portrait}`,
				contentUrl: `${site.origin}${site.portrait}`,
				caption: 'Ainsley Hughes, Ojai REALTOR®'
			},
			{
				'@type': 'WebPage',
				'@id': `${site.origin}/#webpage`,
				url: `${site.origin}/`,
				name: site.title,
				description: site.description,
				isPartOf: { '@id': `${site.origin}/#website` },
				about: { '@id': `${site.origin}/#agent` },
				mainEntity: { '@id': `${site.origin}/#agent` },
				primaryImageOfPage: { '@id': `${site.origin}/#primaryimage` },
				inLanguage: 'en-US'
			},
			{
				'@type': 'FAQPage',
				'@id': `${site.origin}/#faq`,
				isPartOf: { '@id': `${site.origin}/#webpage` },
				mainEntity: faqs.map((faq) => ({
					'@type': 'Question',
					name: faq.question,
					acceptedAnswer: { '@type': 'Answer', text: faq.answer }
				}))
			},
			...(data.marketInsights
				? [
						{
							'@type': 'Dataset',
							'@id': `${site.origin}/#market-insights`,
							name: data.marketInsights.headline,
							description: data.marketInsights.summary,
							temporalCoverage: data.marketInsights.periodLabel,
							dateModified: data.marketInsights.updated,
							creator: { '@id': `${site.origin}/#agent` },
							isPartOf: { '@id': `${site.origin}/#webpage` },
							citation: {
								'@type': 'CreativeWork',
								name: data.marketInsights.sourceName,
								url: data.marketInsights.sourceUrl,
								datePublished: data.marketInsights.sourceDate
							},
							variableMeasured: data.marketInsights.metrics.map((metric) => ({
								'@type': 'PropertyValue',
								name: metric.label,
								value: metric.value,
								description: metric.note || undefined
							}))
						}
					]
				: [])
		]
	}}
/>

<section class="source-hero relative h-[600px] overflow-hidden md:h-[680px]">
	<img
		class="h-full w-full object-cover brightness-[.62]"
		src={site.defaultImage}
		srcset="/images/migrated/image-asset-f4553fde4-768.webp 768w, /images/migrated/image-asset-f4553fde4-1440.webp 1440w, /images/migrated/image-asset-f4553fde4.webp 2200w"
		sizes="100vw"
		alt="Ojai citrus grove"
		width="2200"
		height="1467"
		fetchpriority="high"
		decoding="async"
	/>
	<h1
		class="absolute top-1/2 left-1/2 m-0 w-full -translate-x-1/2 -translate-y-1/2 px-7 text-center text-[3.5rem] leading-[1.3] font-light tracking-[.005em] text-white md:px-[30px] md:text-[62px] md:leading-[77.5px]"
	>
		Ainsley Hughes, Realtor® #02105320
	</h1>
</section>

<section class="mx-auto max-w-[760px] px-[18px] py-[35px] text-center md:px-6 md:py-[120px]">
	<p class="m-0 text-[2rem] leading-[1.55] font-extralight md:text-[36px] md:leading-[54px]">
		Ainsley Hughes is an Ojai-based REALTOR® helping <a
			class="underline decoration-1 underline-offset-4"
			href="/buy">buyers</a
		>
		and <a class="underline decoration-1 underline-offset-4" href="/sell">sellers</a> throughout the
		<a class="underline decoration-1 underline-offset-4" href="/ojai-neighborhoods-1">Ojai Valley</a
		>, West Ventura County, and South Santa Barbara County. With a real estate career that began in
		2004, Ainsley brings experience in residential sales, negotiation, property management, and
		<a class="underline decoration-1 underline-offset-4" href="/how-i-work"
			>complex real estate transactions</a
		> to her work with clients. Her approach is thoughtful, strategic, and grounded in a deep understanding
		of the local market.
	</p>
</section>

<section
	class="mx-6 grid items-center gap-5 pb-[55px] md:mx-auto md:w-[min(1200px,calc(100%-48px))] md:grid-cols-2 md:gap-20 md:pb-[100px]"
>
	<img
		class="w-full justify-self-center md:max-w-[460px]"
		src={site.portrait}
		srcset="/images/migrated/image-asset-865d23788-768.webp 768w, /images/migrated/image-asset-865d23788-1200.webp 1200w, /images/migrated/image-asset-865d23788.webp 2200w"
		sizes="(min-width: 768px) 460px, calc(100vw - 48px)"
		alt="Ainsley Hughes, Ojai REALTOR®"
		width="2200"
		height="1467"
		loading="lazy"
	/>
	<div>
		<h2 class="m-0 font-display text-[2rem] font-normal text-[#888] italic md:text-[5rem]">
			Meet Ainsley
		</h2>
	</div>
</section>

<section
	class="mx-6 border-y border-line py-[35px] md:mx-auto md:w-[min(1200px,calc(100%-48px))] md:pt-10 md:pb-[90px]"
>
	<a class="outline-button" href="/about">More about Ainsley</a>
</section>

<section
	class="relative mx-6 grid gap-10 py-[55px] pb-[120px] md:mx-auto md:w-[min(1200px,calc(100%-48px))] md:grid-cols-[2fr_1fr] md:gap-[120px] md:pt-[85px] md:pb-[170px]"
>
	<div>
		<blockquote
			class="mb-[50px] max-w-[660px] font-display text-[1.8rem] leading-normal italic md:text-[2.6rem] md:leading-[1.5]"
		>
			“Working with Ainsley is a breeze, due to her meticulous planning, execution, and
			communication”
		</blockquote>
		<a class="outline-button" href="/ojai-real-estate-reviews">Read testimonials</a>
	</div>
	<div class="[&_p]:mb-6">
		<p>Education and Credentials</p>
		<p>Alumna- UC Santa Barbara</p>
		<p>Realtor®</p>
		<p>RENE: Real Estate Negotiation Expert</p>
		<p>SRS: Seller Representative Specialist</p>
		<p>GREEN: Green Designee</p>
	</div>
	<a
		class="outline-button absolute bottom-[50px] left-1/2 -translate-x-1/2 md:bottom-20"
		href="/ojai-neighborhoods-1">Explore Ojai neighborhoods</a
	>
</section>

<section class="mx-auto w-[min(1200px,calc(100%-48px))] border-t border-line py-16 md:py-24">
	<p class="eyebrow">Real estate guidance</p>
	<h2 class="max-w-3xl text-[2.4rem] md:text-[3.5rem]">
		Buying and selling real estate in the Ojai Valley
	</h2>
	<div class="mt-10 grid gap-10 md:grid-cols-3">
		<div>
			<h3 class="text-[1.4rem]">Buying</h3>
			<p>Local market guidance, property evaluation, negotiation, and transaction strategy.</p>
			<a class="outline-button" href="/buy">Buying guidance</a>
		</div>
		<div>
			<h3 class="text-[1.4rem]">Selling</h3>
			<p>Thoughtful preparation, pricing, positioning, marketing, and offer evaluation.</p>
			<a class="outline-button" href="/sell">Selling guidance</a>
		</div>
		<div>
			<h3 class="text-[1.4rem]">Neighborhood expertise</h3>
			<p>Guides to Ojai, Meiners Oaks, Taormina, Ojai Terrace, and downtown Ojai.</p>
			<a class="outline-button" href="/ojai-neighborhoods-1">Explore neighborhoods</a>
		</div>
	</div>
</section>

{#if data.marketInsights}
	<section class="mx-auto w-[min(1200px,calc(100%-48px))] border-t border-line py-16 md:py-24">
		<p class="eyebrow">Ojai market data · {data.marketInsights.periodLabel}</p>
		<h2 class="max-w-3xl text-[2.4rem] md:text-[3.5rem]">{data.marketInsights.headline}</h2>
		<p class="max-w-3xl text-lg">{data.marketInsights.summary}</p>
		<div class="mt-10 grid gap-8 md:grid-cols-3">
			{#each data.marketInsights.metrics as metric}
				<article class="border-t border-ink pt-5">
					<p class="eyebrow">{metric.label}</p>
					<strong class="block text-[2rem] font-light">{metric.value}</strong>
					{#if metric.note}<p class="mt-2">{metric.note}</p>{/if}
				</article>
			{/each}
		</div>
		<p class="mt-8 text-sm">
			Source:
			<a
				class="underline underline-offset-4"
				href={data.marketInsights.sourceUrl}
				target="_blank"
				rel="noreferrer">{data.marketInsights.sourceName}</a
			>, published
			<time datetime={data.marketInsights.sourceDate}>{data.marketInsights.sourceDate}</time>.
		</p>
	</section>
{/if}

<section class="mx-auto w-[min(900px,calc(100%-48px))] border-t border-line py-16 md:py-24">
	<p class="eyebrow">Frequently asked questions</p>
	<h2 class="text-[2.4rem] md:text-[3.5rem]">Working with an Ojai real estate advisor</h2>
	<div class="faq mt-8">
		{#each faqs as faq}
			<details>
				<summary>{faq.question}</summary>
				<p class="pt-4">{faq.answer}</p>
			</details>
		{/each}
	</div>
</section>
