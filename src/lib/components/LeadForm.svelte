<script lang="ts">
	let { topic = 'General inquiry', compact = false }: { topic?: string; compact?: boolean } =
		$props();
	let submissionStatus = $state<'idle' | 'sending' | 'success' | 'error'>('idle');
	let message = $state('');

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		submissionStatus = 'sending';
		const form = event.currentTarget as HTMLFormElement;
		const payload = Object.fromEntries(new FormData(form));
		const params = new URLSearchParams(location.search);
		Object.assign(payload, {
			utmSource: params.get('utm_source') ?? '',
			utmMedium: params.get('utm_medium') ?? '',
			utmCampaign: params.get('utm_campaign') ?? ''
		});
		try {
			const response = await fetch('/api/leads', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(payload)
			});
			const result = (await response.json()) as { message?: string };
			if (!response.ok) throw new Error(result.message ?? 'Unable to send your message.');
			submissionStatus = 'success';
			message = result.message ?? 'Thank you. Ainsley will be in touch soon.';
			form.reset();
		} catch (error) {
			submissionStatus = 'error';
			message = error instanceof Error ? error.message : 'Unable to send your message.';
		}
	}
</script>

<form class:compact onsubmit={submit} aria-busy={submissionStatus === 'sending'}>
	<input type="hidden" name="message" value={topic} />
	<label>
		Name
		<input name="name" autocomplete="name" required minlength="2" />
	</label>
	<label>
		Email
		<input name="email" type="email" autocomplete="email" required />
	</label>
	<label>
		Phone <span>(optional)</span>
		<input name="phone" type="tel" autocomplete="tel" />
	</label>
	{#if !compact}
		<label>
			Property address or area <span>(optional)</span>
			<input name="address" autocomplete="street-address" />
		</label>
		<label class="honeypot" aria-hidden="true">
			Website
			<input name="website" tabindex="-1" autocomplete="off" />
		</label>
	{/if}
	<button class="button" disabled={submissionStatus === 'sending'}>
		{submissionStatus === 'sending' ? 'Sending…' : 'Send inquiry'}
	</button>
	{#if message}
		<p
			class:form-error={submissionStatus === 'error'}
			role={submissionStatus === 'error' ? 'alert' : 'status'}
		>
			{message}
		</p>
	{/if}
</form>
