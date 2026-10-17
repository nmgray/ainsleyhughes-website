<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import { site } from '$lib/config';
</script>

<Seo title={`Privacy and cookies — ${site.name}`} />
<article class="content section narrow">
	<p class="eyebrow">Privacy</p>
	<h1>Privacy and cookie notice</h1>
	<p>Last updated September 25, 2026.</p>
	<h2>Information you provide</h2>
	<p>
		When you submit a form, we use the contact and property information you provide to respond to
		your request and deliver the requested real estate service. Do not submit sensitive financial or
		identity information through a website form.
	</p>
	<h2>Cookies and optional technology</h2>
	<p>
		Essential browser storage remembers your consent choices. Analytics, advertising, embedded
		media, and marketing technologies remain disabled unless you affirmatively enable the
		corresponding category. You may withdraw consent through Cookie Preferences in the footer.
	</p>
	<p>
		If you like a blog article, a first-party functional cookie assigns a random identifier so the
		site can remember your choice and avoid counting repeated clicks as separate likes. The
		identifier is not used for advertising, cross-site tracking, or identification and expires after
		one year. Article share links do not load third-party scripts; visiting a selected social
		network is subject to that service’s privacy practices.
	</p>
	<h2>Service providers and retention</h2>
	<p>
		Form information may be transmitted to configured CRM and automation providers solely to process
		your inquiry. Retention and vendor details should be reviewed and finalized by the site owner
		and legal counsel before production launch.
	</p>
	<h2>Contact</h2>
	<p>
		Questions may be sent to <a href={`mailto:${site.email}`}>{site.email}</a> or by calling
		<a href={`tel:${site.phone.replaceAll('-', '')}`}>{site.phone}</a>.
	</p>
</article>
