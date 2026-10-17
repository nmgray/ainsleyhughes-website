<script lang="ts">
	import LeadForm from '$lib/components/LeadForm.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { site } from '$lib/config';
</script>

<Seo
	title={`Contact — ${site.name}`}
	description="Contact Ainsley Hughes for thoughtful Ojai real estate guidance."
	image="/images/migrated/image-asset-d97650339.webp"
/>

<header class="source-page-hero">
	<img src="/images/migrated/image-asset-d97650339.webp" alt="Lemons growing in Ojai" />
	<h1>Contact</h1>
</header>

<section class="source-form-layout contact-copy">
	<div>
		<h2>
			Whether you’re just starting to think about a move or already weighing specific options, I’m
			always happy to talk things through.
		</h2>
		<p>
			I’m based in Ojai and primarily serve <a href="/ojai-neighborhoods-1"
				><strong>Ojai and West Ventura County</strong></a
			>, with select clients in <strong>South Santa Barbara County</strong>. My work is focused on
			providing clear, thoughtful guidance around pricing, timing, and next steps, without pressure.
		</p>
		<h3>How to Reach Me</h3>
		<p>
			<strong>Phone:</strong> <a href={`tel:${site.phone.replaceAll('-', '')}`}>{site.phone}</a><br
			/>
			<strong>Email:</strong> <a href={`mailto:${site.email}`}>{site.email}</a>
		</p>
		<h3>What to Expect When You Reach Out</h3>
		<ul>
			<li>A thoughtful conversation, not a sales pitch</li>
			<li>Clear answers to your questions, even if the answer is “not yet”</li>
			<li>An honest discussion about options, timing, and tradeoffs</li>
		</ul>
		<p>Some conversations lead to a next step. Others simply provide clarity. Both are valuable.</p>
		<h3>Service Area</h3>
		<p>
			<strong>Ojai and West Ventura County</strong>, including Oak View and Ventura<br />
			<strong>Select clients in South Santa Barbara County</strong>
		</p>
		<LeadForm />
	</div>
	<aside class="contact-sidebar">
		<h3>Considering a move?</h3>
		<strong>Ainsley Hughes</strong>
		<a href={`tel:${site.phone.replaceAll('-', '')}`}>{site.phone}</a>
		<a href={`mailto:${site.email}`}>{site.email}</a>
	</aside>
</section>
