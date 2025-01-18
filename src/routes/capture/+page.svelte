<script lang="ts">
	import { Button, Card, Input, Label } from 'flowbite-svelte';
	let scraperUrl = 'https://en.wikipedia.org/wiki/List_of_women_composers_by_birth_date';
	import { load } from 'cheerio';
	import type { Composer, ComposerList } from '$lib/zodDefinitions';
	let composerInfo: Composer;
	let composerList: ComposerList;

	const getOnlyLinks = async (url: string): Promise<string> => {
		try {
			// Input validation
			if (!url || typeof url !== 'string') {
				throw new Error('Invalid URL provided');
			}

			const response = await fetch(`/api/scrape/html/?url=${encodeURIComponent(url)}`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const html = await response.text();
			const x = load(html);
			const rootUrl = new URL(url).origin;
			const extractedElements: string[] = [];
			// Extract elements and their properties
			x('body *').each((_, el) => {
				const $el = x(el);
				const tag = el.tagName.toLowerCase();
				const text = $el.text().trim();

				if (!text) return; // Skip empty elements

				if (tag === 'a') {
					let href = $el.attr('href');

					if (!href || href === '#') return; // Skip invalid links

					// Convert relative URLs to absolute
					if (href.startsWith('/')) {
						href = new URL(href, rootUrl).href;
					}

					extractedElements.push(`${text} (${href})`);
				} else if (['h1', 'h2', 'h3', 'h4', 'h5'].includes(tag)) {
					extractedElements.push(`${tag.toUpperCase()}: ${text}`);
				}
			});

			return extractedElements.join('\n');
		} catch (error) {
			console.error('Error scraping content:', error);
			if (error instanceof Error) {
				throw new Error(`Scraping failed: ${error.message}`);
			} else {
				throw new Error('Scraping failed with an unknown error');
			}
		}
	};

	const getPageText = async (url: string) => {
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

			const textWithLinks = $('body')
				.find('*')
				.map((_, el) => {
					if ($(el).is('a')) {
						const href = $(el).attr('href') || '#';
						const text = $(el).text().trim();
						return text ? `${text} (${href})` : href; // Format: "Link Text (URL)"
					}
					return $(el).text().trim();
				})
				.get()
				.join(' ') // Join all extracted text with space
				.replace(/[\r\n\t]+/g, ' ') // Replace newlines and tabs with space
				.replace(/\s{2,}/g, ' ') // Replace multiple spaces with single space
				.trim();
			// console.log(textContent);

			return textWithLinks;
		} catch (error) {
			console.error('Error scraping content:', error);
			throw error;
		}
	};
	// returns raw HTML from a web page
	const scrapeData = async (url: string): Promise<string> => {
		const rawData = await getRawHtml(url);

		return rawData;
	};
	const scrapeLinksList = async (url: string): Promise<string> => {
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
		// const rawData = await scrapeData(scraperUrl);
		const rawData = await getOnlyLinks(scraperUrl);
		console.log(rawData);
		const response = await fetch('/api/scrape/composerList', {
			method: 'POST',
			body: JSON.stringify({ text: rawData })
		});
		const composerRaw = await response.json();
		try {
			composerInfo = composerRaw.data;
		} catch {
			console.log('not a composer');
		}
		try {
			composerList = composerRaw.data;
			console.log(composerList.links.length);
			console.log(composerList);
		} catch {
			console.log('not a list');
		}
	};
	const submitComposerUrl = async (url: string) => {
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
		// const rawData = await scrapeData(scraperUrl);
		const rawData = await getOnlyLinks(url);
		console.log(rawData);
		return;
		const response = await fetch('/api/scrape/composerList', {
			method: 'POST',
			body: JSON.stringify({ text: rawData })
		});
		const composerRaw = await response.json();
		try {
			composerInfo = composerRaw.data;
		} catch {
			console.log('not a composer');
		}
		try {
			composerList = composerRaw.data;
			console.log(composerList.links.length);
		} catch {
			console.log('not a list');
		}
	};
</script>

<div class="flex min-h-screen items-center justify-center">
	<Card class="mb-4 max-h-full w-full max-w-md space-y-6 overflow-scroll p-6">
		{#if composerList}
			{#each composerList.links as composer}
				<div class="flex">
					<p>
						{composer.name}
						<a href={composer.url}>{composer.url}</a>
					</p>
					<Button
						size="xs"
						on:click={() => {
							console.log('sending', composer.url);
						}}
					>
						scrape</Button
					>
				</div>
			{/each}
		{:else if composerInfo}
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
		<p>or https://en.wikipedia.org/wiki/List_of_women_composers_by_birth_date</p>
		<form on:submit|preventDefault={submitUrl} class="space-y-4">
			<div>
				<Label for="scraperUrl" class="mb-2">scraperUrl</Label>
				<Input id="scraperUrl" placeholder="name@company.com" bind:value={scraperUrl} required />
			</div>
			<Button type="submit" color="primary">Submit</Button>
		</form>
	</Card>
</div>
