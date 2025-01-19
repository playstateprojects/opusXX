<script lang="ts">
	import { Button, Card, Input, Label } from 'flowbite-svelte';
	import TurndownService from 'turndown';
	import { gfm } from 'turndown-plugin-gfm';
	let scraperUrl = 'https://en.wikipedia.org/wiki/Alba_Trissina';
	import { load } from 'cheerio';
	import type { Composer, ComposerList } from '$lib/zodDefinitions';
	let composerInfo: Composer;
	let composerList: ComposerList;
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

	const getOnlyLinks = async (url: string): Promise<string> => {
		console.log('get obly links');
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
		const rawData = await getOnlyLinks(scraperUrl);
		console.log(rawData);
		const response = await fetch('/api/scrape/composerList', {
			method: 'POST',
			body: JSON.stringify({ text: rawData })
		});
		const composerRaw = await response.json();

		try {
			composerList = composerRaw.data;
			console.log(composerList.links.length);
			console.log(composerList);
		} catch {
			console.log('not a list');
		}
	};
	const getMarkdown = async (url: string): Promise<string> => {
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
	const scrapeComposer = async (url: string) => {
		const rawData = await getMarkdown(url);
		const response = await fetch('/api/scrape/composer', {
			method: 'POST',
			body: JSON.stringify({ text: rawData })
		});
		const composerRaw = await response.json();
		try {
			composerInfo = composerRaw.data;
			console.log('ci', composerInfo);
		} catch {
			console.log('not a composer');
		}
	};
</script>

<div class="flex min-h-screen items-center justify-center">
	<Card class="mb-4 max-h-full w-full max-w-md space-y-6 overflow-scroll p-6">
		{#if composerList}
			-------cl------
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
			<p>{composerInfo.shortDescription}</p>
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
