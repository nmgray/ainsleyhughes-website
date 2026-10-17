<script lang="ts">
	import { onMount } from 'svelte';
	import SocialIcon from '$lib/components/SocialIcon.svelte';
	import { navigation, neighborhoods, site } from '$lib/config';

	let headerElement: HTMLElement;
	let mobileMenuOpen = $state(false);
	const socials = [
		{ href: site.social[0], label: 'Instagram', platform: 'instagram' },
		{ href: site.social[1], label: 'Facebook', platform: 'facebook' },
		{ href: site.social[2], label: 'LinkedIn', platform: 'linkedin' }
	] as const;

	function closeMenus() {
		headerElement
			?.querySelectorAll<HTMLDetailsElement>('details[open]')
			.forEach((menu) => (menu.open = false));
	}

	onMount(() => {
		const closeOutside = (event: PointerEvent) => {
			if (!(event.target instanceof Node)) return;
			headerElement.querySelectorAll<HTMLDetailsElement>('details[open]').forEach((menu) => {
				if (!menu.contains(event.target as Node)) menu.open = false;
			});
		};
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key !== 'Escape') return;
			const openMenus = [...headerElement.querySelectorAll<HTMLDetailsElement>('details[open]')];
			const trigger =
				openMenus
					.find((menu) => menu.matches('.mobile-menu, nav > details'))
					?.querySelector<HTMLElement>('summary') ??
				openMenus[0]?.querySelector<HTMLElement>('summary');
			closeMenus();
			trigger?.focus();
		};
		const closeAfterNavigation = (event: MouseEvent) => {
			if (event.target instanceof Element && event.target.closest('a')) closeMenus();
		};
		document.addEventListener('pointerdown', closeOutside);
		document.addEventListener('keydown', closeOnEscape);
		headerElement.addEventListener('click', closeAfterNavigation);
		return () => {
			document.removeEventListener('pointerdown', closeOutside);
			document.removeEventListener('keydown', closeOnEscape);
			headerElement.removeEventListener('click', closeAfterNavigation);
		};
	});
</script>

<header bind:this={headerElement} class="relative z-20 h-12 bg-white site:h-[205px]">
	<a class="skip-link" href="#main">Skip to content</a>
	<div
		class="relative mx-auto flex h-12 w-full items-center justify-center px-3.5 site:h-[140px] site:w-[min(1200px,calc(100%-48px))] site:items-start site:justify-between site:gap-12 site:px-0 site:pt-3.5"
	>
		<a class="site:w-[400px]" href="/" aria-label="Ainsley Hughes home">
			<img
				class="hidden h-[85px] w-[400px] object-contain object-left-top site:block"
				src={site.logo}
				alt="Keller Williams World Class"
				width="1473"
				height="333"
			/>
			<span
				class="font-sans text-[14px] leading-none font-bold tracking-[.08em] uppercase site:hidden"
			>
				{site.name}
			</span>
		</a>
		<img
			class="mobile-compliance-logo absolute right-2 h-8 w-24 object-contain site:hidden"
			src={site.logo}
			alt="Keller Williams World Class"
			width="1473"
			height="333"
		/>
		<nav
			class="hidden items-start gap-4 pt-10 whitespace-nowrap site:flex"
			aria-label="Primary navigation"
		>
			{#each navigation as item}
				{#if item.href === '/ojai-neighborhoods-1'}
					<details class="group relative">
						<summary
							class="cursor-pointer list-none text-[11px] tracking-[.12em] uppercase [&::-webkit-details-marker]:hidden"
						>
							{item.label}
						</summary>
						<div
							class="absolute top-full right-0 z-50 mt-3 min-w-[220px] border border-line bg-white p-3 shadow-lg"
						>
							{#each neighborhoods as neighborhood}
								<a
									class="block px-3 py-2 text-[11px] tracking-[.1em] uppercase"
									href={neighborhood.href}>{neighborhood.label}</a
								>
							{/each}
						</div>
					</details>
				{:else}
					<a
						class="text-[11px] tracking-[.12em] uppercase no-underline hover:underline focus-visible:underline"
						href={item.href}>{item.label}</a
					>
				{/if}
			{/each}
		</nav>
		<details bind:open={mobileMenuOpen} class="mobile-menu absolute inset-y-0 left-0 site:hidden">
			<summary
				class="grid size-12 cursor-pointer list-none place-items-center text-[17px] leading-none [&::-webkit-details-marker]:hidden"
				aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
			>
				<span aria-hidden="true">☰</span>
			</summary>
			<div
				class="fixed top-12 right-0 left-0 flex max-h-[calc(100vh-48px)] flex-col overflow-y-auto border-y border-line bg-white px-5 py-[18px] shadow-lg"
			>
				{#each navigation as item}
					{#if item.href === '/ojai-neighborhoods-1'}
						<details>
							<summary
								class="cursor-pointer list-none px-2 py-2 uppercase [&::-webkit-details-marker]:hidden"
								>{item.label}</summary
							>
							<div class="flex flex-col border-l border-line pl-3">
								{#each neighborhoods as neighborhood}
									<a class="px-2 py-2 uppercase no-underline" href={neighborhood.href}
										>{neighborhood.label}</a
									>
								{/each}
							</div>
						</details>
					{:else}
						<a class="px-2 py-2 uppercase no-underline" href={item.href}>{item.label}</a>
					{/if}
				{/each}
			</div>
		</details>
	</div>
	<div
		class="absolute right-[max(24px,calc((100vw-1200px)/2))] bottom-[45px] hidden gap-[13px] text-[#aaa] site:flex"
		aria-label="Social profiles"
	>
		{#each socials as social}
			<a
				class="grid min-h-6 min-w-6 place-items-center"
				href={social.href}
				target="_blank"
				rel="noreferrer"
				aria-label={social.label}
			>
				<SocialIcon platform={social.platform} />
			</a>
		{/each}
	</div>
</header>
