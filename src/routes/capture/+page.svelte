<script lang="ts">
	import { Card, Input, Label } from 'flowbite-svelte';
	let scraperUrl = '';
	const submitUrl = async () => {
		const response = await fetch('/api/vector/create', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ text: scraperUrl })
		});
		const data = await response.json();
		console.log(data);
	};
</script>

<div class="flex min-h-screen items-center justify-center">
	<Card class="w-full max-w-md space-y-6 p-6">
		<h3 class="text-center text-xl font-medium text-gray-900 dark:text-white">
			Submit a URL to scrape for data
		</h3>

		<form on:submit|preventDefault={submitUrl} class="space-y-4">
			<div>
				<Label for="scraperUrl" class="mb-2">scraperUrl</Label>
				<Input id="scraperUrl" placeholder="name@company.com" bind:value={scraperUrl} required />
			</div>
		</form>
	</Card>
</div>
