<script lang="ts">
	import { Button, Card, Input, Label } from 'flowbite-svelte';
	import TurndownService from 'turndown';
	import { gfm } from 'turndown-plugin-gfm';
	let scraperUrl = 'https://en.wikipedia.org/wiki/List_of_women_composers_by_birth_date';
	import { load } from 'cheerio';
	import type { Composer, ComposerList, Source } from '$lib/zodDefinitions';
	import composers from '$lib/composerList.json';
	const loadingComposers: boolean[] = composers.map(() => false);
	let composerInfo: Composer;
	let composerList: ComposerList;
	let { data } = $props();
	let { genres } = $derived(data);

	const emptyComposer = {
		name: '',
		birthDate: '',
		birthLocation: '',
		longDescription: '',
		shortDescription: '',
		tags: [],
		refrences: [],
		works: [],
		links: []
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
	const scrapeComposerList = async () => {
		const rawData = await getMarkdown(scraperUrl);
		const response = await fetch('/api/scrape/composerList', {
			method: 'POST',
			body: JSON.stringify({ text: rawData })
		});
		const composerRaw = await response.json();

		try {
			composerList = composerRaw.data;
		} catch {
			console.log('not a list');
		}
	};
	const getHTML = async (url: string): Promise<string> => {
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

			// Remove unnecessary elements
			x('script, style, noscript, iframe, form, .ads, .sidebar, .popup').remove();

			// Extract the main content (adjust based on the website)
			let mainContent = x('article, main, .content, #content').first();
			if (!mainContent.length) {
				mainContent = x('body'); // Fallback to entire body
			}

			// Convert cleaned HTML to a string
			const cleanedHtml = mainContent.html();
			if (!cleanedHtml) return '';

			// Initialize Turndown with GitHub-Flavored Markdown (GFM)

			return cleanedHtml;
			// Extract elements and their properties
		} catch (error) {
			console.log(error);
		}
		return '';
	};
	const getMarkdown = async (cleanedHtml: string): Promise<string> => {
		try {
			// Input validation
			if (!cleanedHtml) return '';

			// Initialize Turndown with GitHub-Flavored Markdown (GFM)
			const turndownService = new TurndownService({ headingStyle: 'atx' });
			turndownService.use(gfm);

			// Preserve code blocks
			turndownService.addRule('preformatted', {
				filter: ['pre'],
				replacement: (content: any) => `\n\`\`\`\n${content}\n\`\`\`\n`
			});

			// Convert HTML to Markdown
			const markdown = turndownService.turndown(cleanedHtml);

			console.log('md', markdown);
			return markdown;
			// Extract elements and their properties
		} catch (error) {
			console.log(error);
		}
		return '';
	};
	const scrapeComposer = async (url: string, composerIndex: number = -1) => {
		const cleanedHtml = await getHTML(url);
		const rawData = await getMarkdown(cleanedHtml);
		console.log('compIdx', composerIndex);
		if (composerIndex > -1) loadingComposers[composerIndex] = true;
		const source: Source = {
			URL: url,
			Content: rawData,
			RawHTML: cleanedHtml
		};
		const response = await fetch('/api/scrape/composer', {
			method: 'POST',
			body: JSON.stringify({ text: rawData, source: source })
		});
		const composerRaw = await response.json();
		try {
			composerInfo = composerRaw.data;
			console.log('ci', composerInfo);
		} catch {
			console.log('not a composer');
		} finally {
			if (composerIndex > -1) loadingComposers[composerIndex] = false;
		}
	};
</script>

<div class="flex min-h-screen items-center justify-center">
	<Card class="mb-4 max-h-full w-full max-w-md space-y-6 overflow-scroll p-6">
		<div class="flex max-h-[600px] flex-col space-y-4 overflow-scroll">
			{#if composers}
				Composers found: {composers.length}
				{#each composers as composer, idx}
					<div class="flex border-b-2 border-b-slate-100 pb-2">
						<p>
							{composer.composer}
							<a href={composer.link} target="_blank">{composer.link}</a>
						</p>
						{idx}
						<Button
							size="xs"
							on:click={() => {
								loadingComposers[idx] = true;
								scrapeComposer(composer.link, idx);
							}}
							disabled={loadingComposers[idx]}
						>
							{#if !loadingComposers[idx]}
								scrape
							{:else}
								...
							{/if}
						</Button>
					</div>
				{/each}
			{:else if composerInfo}
				<h1>{composerInfo.name}</h1>
				<h3>born: {composerInfo.birthDate}</h3>
				<h3>Description</h3>
				<p>{composerInfo.shortDescription}</p>
				{#each composerInfo.works as work}
					<h2>{work.title}</h2>
					<p>{work.shortDescription}</p>
				{/each}
			{/if}
		</div>
		<h3 class="text-center text-xl font-medium text-gray-900 dark:text-white">
			Submit a URL to scrape for data
		</h3>
		<p>for example: https://en.wikipedia.org/wiki/Hildegard_of_Bingen</p>
		<p>or https://en.wikipedia.org/wiki/List_of_women_composers_by_birth_date</p>
		<div>
			<Label for="scraperUrl" class="mb-2">scraperUrl</Label>
			<Input id="scraperUrl" placeholder="name@company.com" bind:value={scraperUrl} required />
		</div>
		<Button on:click={scrapeComposerList} color="primary">Composer List</Button>
		<Button
			on:click={() => {
				scrapeComposer(scraperUrl);
			}}
			color="primary">Composer</Button
		>
	</Card>
</div>
