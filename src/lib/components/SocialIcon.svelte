<script lang="ts">
	let { platform, size = 18 }: { platform: 'instagram' | 'facebook' | 'linkedin'; size?: number } =
		$props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="currentColor"
	aria-hidden="true"
	focusable="false"
>
	{#if platform === 'instagram'}
		<path
			d="M7.75 2h8.5A5.76 5.76 0 0 1 22 7.75v8.5A5.76 5.76 0 0 1 16.25 22h-8.5A5.76 5.76 0 0 1 2 16.25v-8.5A5.76 5.76 0 0 1 7.75 2Zm0 2A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5ZM17 5.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
		/>
	{:else if platform === 'facebook'}
		<path
			d="M13.5 22v-9h3l.45-3.5H13.5V7.26c0-1.01.28-1.7 1.73-1.7H17V2.43A23.7 23.7 0 0 0 14.42 2C11.87 2 10 3.56 10 6.43V9.5H7V13h3v9h3.5Z"
		/>
	{:else}
		<path
			d="M5.34 7.33H2V22h3.34V7.33ZM3.67 2A1.96 1.96 0 1 0 3.67 5.92 1.96 1.96 0 0 0 3.67 2ZM22 13.6c0-4.42-2.36-6.48-5.51-6.48a4.75 4.75 0 0 0-4.32 2.37V7.33H8.83V22h3.34v-7.26c0-1.91.36-3.77 2.74-3.77 2.35 0 2.38 2.2 2.38 3.9V22H22v-8.4Z"
		/>
	{/if}
</svg>
