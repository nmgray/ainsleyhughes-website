<script lang="ts">
	import SocialIcon from '$lib/components/SocialIcon.svelte';
	import { site } from '$lib/config';

	const socials = [
		{ href: site.social[0], label: 'Instagram', platform: 'instagram' },
		{ href: site.social[1], label: 'Facebook', platform: 'facebook' },
		{ href: site.social[2], label: 'LinkedIn', platform: 'linkedin' }
	] as const;
</script>

<footer>
	<div class="footer-socials">
		{#each socials as social}
			<a href={social.href} target="_blank" rel="noreferrer" aria-label={social.label}>
				<SocialIcon platform={social.platform} size={20} />
			</a>
		{/each}
	</div>
	<p class="accessibility">
		Ainsley Hughes is committed to providing an accessible website. If you have difficulty accessing
		content, have difficulty viewing a file on the website, or notice any accessibility problems,
		please contact us at <a href={`tel:${site.phone.replaceAll('-', '')}`}>{site.phone}</a>
		to specify the nature of the accessibility issue and any assistive technology you use. We strive to
		provide the content you need in the format you require.
	</p>
	<div class="footer-base">
		<span>© {new Date().getFullYear()} {site.name}</span>
		<button class="text-button" data-cookie-preferences>Cookie Preferences</button>
		<a href="/privacy">Privacy</a>
	</div>
</footer>
