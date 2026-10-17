<script lang="ts">
	import LeadForm from '$lib/components/LeadForm.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { site } from '$lib/config';
</script>

<Seo
	title={`Buyer’s consultation — ${site.name}`}
	description="Request a no-pressure Ojai home buyer consultation."
/>
<header class="page-hero contact-hero">
	<div>
		<p class="eyebrow">Buyer’s consultation</p>
		<h1>Make your home search more intentional.</h1>
		<p>
			We’ll discuss priorities, timing, financing, neighborhoods, and the tradeoffs that matter
			before you make an offer.
		</p>
	</div>
	<LeadForm topic="Buyer consultation request" />
</header>
