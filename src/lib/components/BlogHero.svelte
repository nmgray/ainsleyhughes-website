<script lang="ts">
	let { pageTitle = true }: { pageTitle?: boolean } = $props();
</script>

<header class="blog-hero">
	<img
		src="/images/migrated/11-web-or-mls-Upmarketmedia-504Dro-48-22c7e2c9f.webp"
		alt=""
		fetchpriority="high"
	/>
	<div>
		{#if pageTitle}
			<h1>Blog</h1>
		{:else}
			<p class="title">Blog</p>
		{/if}
		<p class="description">
			Educational articles covering California home selling, escrow, disclosures, pricing, and local
			real estate trends in Ojai, Ventura County, and Santa Barbara.
		</p>
	</div>
</header>

<style>
	.blog-hero {
		position: relative;
		height: 720px;
		overflow: hidden;
		background: #8c8377;
		color: #fff;
	}

	.blog-hero img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: brightness(0.82);
	}

	.blog-hero div {
		position: absolute;
		inset: 50% auto auto 50%;
		width: min(680px, calc(100% - 48px));
		transform: translate(-50%, -50%);
		text-align: center;
	}

	h1,
	.title {
		margin: 0 0 0.75rem;
		font-size: clamp(3.5rem, 5vw, 5rem);
		font-weight: 300;
	}

	.description {
		margin: 0;
		font-size: 0.8rem;
		font-weight: 600;
		letter-spacing: 0.18em;
		line-height: 1.7;
		text-transform: uppercase;
	}

	@media (max-width: 800px) {
		.blog-hero {
			height: 380px;
		}

		.blog-hero div {
			width: calc(100% - 40px);
		}

		h1,
		.title {
			font-size: 3.4rem;
		}

		p {
			display: none;
		}
	}
</style>
