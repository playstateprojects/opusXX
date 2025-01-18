<script lang="ts">
	import { Button, Card, Input, Label } from 'flowbite-svelte';
	let scraperUrl = 'https://en.wikipedia.org/wiki/Hildegard_of_Bingen';
	import { load } from 'cheerio';
	import type { Composer } from '$lib/zodDefinitions';
	let composerInfo: Composer;

	const getRawHtml = async (url: string) => {
		try {
			const response = await fetch(`/api/scrape/html/?url=${encodeURIComponent(url)}`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const html = await response.text();
			const $ = load(html);

			// Clean the HTML first
			$('script').remove();
			$('style').remove();
			$('noscript').remove();
			$('head').remove();

			// Get all text content
			const textContent = $('body')
				.text()
				.replace(/[\r\n\t]+/g, ' ') // Replace newlines and tabs with space
				.replace(/\s{2,}/g, ' ') // Replace multiple spaces with single space
				.trim();

			return textContent;
		} catch (error) {
			console.error('Error scraping content:', error);
			throw error;
		}
	};

	const scrapeData = async (url: string): Promise<string> => {
		const rawData = await getRawHtml(url);
		return rawData;
	};
	const saveVector = async () => {
		const response = await fetch('/api/vector/create', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ text: scraperUrl })
		});
		const data = await response.json();
		console.log('datata', data);
	};
	const submitUrl = async () => {
		// const existing = await fetch(
		// 	`/api/base/composers?name=${encodeURIComponent('Aleotti, Vittoria')}`,
		// 	{
		// 		method: 'GET'
		// 	}
		// );
		// const created = await await fetch(`/api/base/composers`, {
		// 	method: 'POST',
		// 	headers: {
		// 		'Content-Type': 'application/json'
		// 	},
		// 	body: JSON.stringify({ name: 'Aleotti, demo' })
		// });
		// console.log('created', created.json());
		// return;
		const rawData = await scrapeData(scraperUrl);
		const response = await fetch('/api/scrape/data', {
			method: 'POST',
			body: JSON.stringify({ text: rawData })
		});
		const composerRaw = await response.json();
		composerInfo = composerRaw.data;
		console.log('ci', composerInfo);
	};
</script>

<div class="flex min-h-screen items-center justify-center">
	<Card class="w-full max-w-md space-y-6 p-6">
		{#if composerInfo}
			<h1>{composerInfo.name}</h1>
			<h3>born: {composerInfo.birthDate}</h3>
			<h3>Description</h3>
			<p>{composerInfo.description}</p>
			{#each composerInfo.works as work}
				<h2>{work.title}</h2>
				<p>{work.description}</p>
			{/each}
		{/if}
		<h3 class="text-center text-xl font-medium text-gray-900 dark:text-white">
			Submit a URL to scrape for data
		</h3>
		<p>for example: https://en.wikipedia.org/wiki/Hildegard_of_Bingen</p>
		<form on:submit|preventDefault={submitUrl} class="space-y-4">
			<div>
				<Label for="scraperUrl" class="mb-2">scraperUrl</Label>
				<Input id="scraperUrl" placeholder="name@company.com" bind:value={scraperUrl} required />
			</div>
			<Button type="submit" color="primary">Submit</Button>
		</form>
	</Card>
</div>
