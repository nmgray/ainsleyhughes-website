<script lang="ts">
	let step = $state(1);
	let submissionStatus = $state<'idle' | 'sending' | 'success' | 'error'>('idle');
	let responseMessage = $state('');
	let address = $state('');
	let bedrooms = $state('');
	let bathrooms = $state('');
	let squareFeet = $state('');
	let condition = $state('');

	function continueToContact(event: MouseEvent) {
		const form = (event.currentTarget as HTMLButtonElement).form;
		if (form?.reportValidity()) step = 2;
	}

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		const form = event.currentTarget as HTMLFormElement;
		submissionStatus = 'sending';
		try {
			const response = await fetch('/api/valuation', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					...Object.fromEntries(new FormData(form)),
					address,
					bedrooms,
					bathrooms,
					squareFeet,
					condition,
					utmSource: new URLSearchParams(location.search).get('utm_source') ?? '',
					utmMedium: new URLSearchParams(location.search).get('utm_medium') ?? '',
					utmCampaign: new URLSearchParams(location.search).get('utm_campaign') ?? ''
				})
			});
			const result = (await response.json()) as { message?: string };
			if (!response.ok) throw new Error(result.message ?? 'Unable to request your valuation.');
			submissionStatus = 'success';
			responseMessage =
				result.message ?? 'Your request is in. Ainsley will review the property details.';
		} catch (error) {
			submissionStatus = 'error';
			responseMessage =
				error instanceof Error ? error.message : 'Unable to request your valuation.';
		}
	}
</script>

<form class="valuation" onsubmit={submit} aria-busy={submissionStatus === 'sending'}>
	<div
		class="progress"
		role="progressbar"
		aria-label="Valuation request progress"
		aria-valuemin="1"
		aria-valuemax="2"
		aria-valuenow={step}
		aria-valuetext={`Step ${step} of 2`}
	>
		<span style={`width:${step * 50}%`}></span>
	</div>
	{#if step === 1}
		<fieldset>
			<legend>Tell us about the property</legend>
			<label
				>Property address<input
					name="address"
					autocomplete="street-address"
					bind:value={address}
					required
				/></label
			>
			<div class="fields">
				<label
					>Bedrooms<input
						name="bedrooms"
						type="number"
						min="0"
						max="20"
						bind:value={bedrooms}
						required
					/></label
				>
				<label
					>Bathrooms<input
						name="bathrooms"
						type="number"
						min="0"
						max="20"
						step="0.5"
						bind:value={bathrooms}
						required
					/></label
				>
				<label
					>Approx. square feet<input
						name="squareFeet"
						type="number"
						min="100"
						max="100000"
						bind:value={squareFeet}
						required
					/></label
				>
			</div>
			<label
				>Condition
				<select name="condition" bind:value={condition} required>
					<option value="">Choose one</option>
					<option value="needs-work">Needs work</option>
					<option value="average">Average</option>
					<option value="updated">Recently updated</option>
				</select>
			</label>
			<button class="button" type="button" onclick={continueToContact}>Continue</button>
		</fieldset>
	{:else}
		<fieldset>
			<legend>Where should we send your property review?</legend>
			<label>Name<input name="name" autocomplete="name" required minlength="2" /></label>
			<label>Email<input name="email" type="email" autocomplete="email" required /></label>
			<label
				>Phone <span>(optional)</span><input name="phone" type="tel" autocomplete="tel" /></label
			>
			<label class="honeypot" aria-hidden="true"
				>Website<input name="website" tabindex="-1" autocomplete="off" /></label
			>
			<div class="actions">
				<button class="button secondary" type="button" onclick={() => (step = 1)}>Back</button>
				<button class="button" disabled={submissionStatus === 'sending'}>
					{submissionStatus === 'sending' ? 'Requesting…' : 'Request valuation'}
				</button>
			</div>
		</fieldset>
	{/if}
	{#if responseMessage}
		<p
			class:form-error={submissionStatus === 'error'}
			role={submissionStatus === 'error' ? 'alert' : 'status'}
		>
			{responseMessage}
		</p>
	{/if}
</form>
