<script lang="ts">
	import { AiRole, type AiMessage } from '$lib/types';
	import { Button, Card, Input, Label } from 'flowbite-svelte';
	let scraperUrl = 'https://en.wikipedia.org/wiki/Hildegard_of_Bingen';
	let scrapedContent = '';
	const composerJson = {
		name: '',
		birth: '',
		death: '',
		era: '',
		period: '',
		instruments: [],
		works: [],
		awards: [],
		education: [],
		website: '',
		about: ''
	};
	let messages: AiMessage[] = [
		{
			role: AiRole.System,
			content:
				'You are a classical music expert. Your speciality is recommending works by female composers. Your primary audience are programme directors of major classical music companies.'
		}
	];

	const getRawHtml = async (url: string) => {
		const response = await fetch(`/api/scrape/html/?url=${encodeURIComponent(url)}`);
		const html = await response.text();

		return html;
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
		console.log(data);
	};
	const submitUrl = async () => {
		const rawData = await scrapeData(scraperUrl);
		console.log('rawData');
		const prompt = `from the following html please extract information about the composer in order to complete the following json. 
		return only the populated json object. do not explain your process or include any additional text.
		<JSON_EXAMPLE>
		${JSON.stringify(composerJson)}
		</JSON_EXAMPLE>

		<HTML>
		${rawData}
		</HTML>
		`;
		messages.push({ role: AiRole.User, content: prompt });
		const response = await fetch('/api/chat', {
			method: 'POST',
			body: JSON.stringify({ messages: messages })
		});
		console.log(response);
	};
</script>

<div class="flex min-h-screen items-center justify-center">
	<Card class="w-full max-w-md space-y-6 p-6">
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
