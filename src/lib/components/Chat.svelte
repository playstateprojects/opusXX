<script lang="ts">
	import {
		ButtonSizes,
		AiRole,
		AiOptionIcon,
		type AiMessage,
		type AiOption,
		type ChatAction
	} from '$lib/types.js';
	import { derived, get } from 'svelte/store';
	import ChatOption from './ChatOption.svelte';
	import XxButton from './XXButton.svelte';
	import { messages, actions } from '$lib/stores/chatStore.js';
	import ChatInput from './ChatInput.svelte';
	import { cardStore } from '$lib/stores/cardStore.js';
	import demo from '$lib/demo1.json';
	import demo2 from '$lib/demo2.json';
	import demo2b from '$lib/demo2b.json';
	import demo3 from '$lib/demo3.json';
	import type { WorkCard } from '$lib/zodDefinitions.js';
	import { randomDelay } from '$lib/utils.js';
	import { Spinner } from 'flowbite-svelte';
	import { ComposerSchema } from '$lib/zodAirtableTypes';
	const state = $state({
		loading: false
	});
	let { showInput, children } = $props<{
		showInput?: boolean;
	}>();

	let scrollContainer: HTMLDivElement;

	$effect(() => {
		// Track both stores that could affect content height
		$messages;
		$actions;

		if (!scrollContainer) return;

		// Use microtask timing to ensure DOM is updated
		queueMicrotask(() => {
			scrollContainer.scrollTo({
				top: scrollContainer.scrollHeight,
				behavior: 'smooth'
			});
		});
	});

	const lastMessageIndex = derived(messages, ($messages) => {
		return $messages.reduce((lastIndex, item, currentIndex) => {
			return !Array.isArray(item) ? currentIndex : lastIndex;
		}, -1);
	});
	const runDemo1 = async (newMessages: (AiMessage | AiOption[])[], content: string) => {
		const now = new Date();
		if (['A piece for a specific instrumentation'].includes(content)) {
			newMessages.push(
				{
					role: AiRole.System,
					content: 'Great! What instrumentation would fit your program?',
					time: now
				},
				[
					{ content: 'Chamber music' },
					{ content: 'Choral' },
					{ content: 'Opera' },
					{ content: 'Orchestral' },
					{ content: 'Solo' },
					{ content: 'Vocal' }
				]
			);
		}
		if (content.toLowerCase().indexOf('orchestral') > -1) {
			newMessages.push(
				{
					role: AiRole.System,
					content: 'Would you like to explore works from a specific period?',
					time: now
				},
				[
					{ content: 'Medieval' },
					{ content: 'Renaissance' },
					{ content: 'Baroque' },
					{ content: 'Romantic' },
					{ content: '20th Century' },
					{ content: 'Contemporary' }
				]
			);
		}
		if (['Romantic'].includes(content)) {
			newMessages.push({
				role: AiRole.System,
				content: `Here are three orchestral works from the Romantic period that embody its emotional richness and lyrical character.
Would you like to narrow the focus further — or maybe explore something slightly different?`,
				time: now
			});
			let workCards: WorkCard[] = [];
			try {
				workCards = [...demo] as WorkCard[];
			} catch (err) {
				console.error(err);
			}
			cardStore.set(workCards);
		}
	};
	const refineSearch = () => {
		actions.set([]);
	};
	const runDemo2 = (newMessages: (AiMessage | AiOption[])[], content: string) => {
		const now = new Date();
		if (['A piece that matches a program theme'].includes(content)) {
			newMessages.push(
				{
					role: AiRole.System,
					content: `What theme would you like to explore? 
						Here are a few suggestions to get you started.`,
					time: now
				},
				[
					{ content: 'Nature & Environment' },
					{ content: 'Identity & Human Stories' },
					{ content: 'Love & Loss' },
					{ content: 'Divine Inspiration' },
					{ content: 'Dreams & the Unconscious' }
				]
			);
		}
		if (content.toLowerCase() == 'movement and change') {
			newMessages.push(
				{
					role: AiRole.System,
					content: `“Movement & Change” is a strong, evocative theme—dynamic and wide open.
						To sharpen its emotional or narrative focus, consider variations like:`,
					time: now
				},
				[
					{ content: 'Transformation & Inner Journey' },
					{ content: 'Momentum & Physical Motion' },
					{ content: `Nature’s Cycles & Evolution` },
					{ content: 'Revolution & Social Change' }
				]
			);
		}
		if (content == 'Revolution & Social Change') {
			newMessages.push({
				role: AiRole.System,
				content: `I’ve found some works that could be a great fit for you! 
					Take a look and let me know what you think.`,
				time: now
			});

			let workCards: WorkCard[] = [];
			try {
				workCards = [...demo2] as WorkCard[];
			} catch (err) {
				console.error(err);
			}
			cardStore.set(workCards);
			actions.set([{ label: 'SHOW ME MORE' }, { label: 'REFINE SEARCH', action: refineSearch }]);
		}
		if (content.indexOf('vocal works with chamber') > -1) {
			newMessages.push({
				role: AiRole.System,
				content: `I’ve gathered a few vocal chamber works that I think match your vision—
				take a look and let me know what resonates.`,
				time: now
			});
			let workCardsB: WorkCard[] = [];
			try {
				workCardsB = [...demo2b] as WorkCard[];
			} catch (err) {
				console.error(err);
			}
			cardStore.set(workCardsB);
		}
	};
	const runDemo3 = (newMessages: (AiMessage | AiOption[])[], content: string) => {
		const now = new Date();
		if (['A piece that creates a particular atmosphere'].includes(content)) {
			newMessages.push(
				{
					role: AiRole.System,
					content: `Tell me about the atmosphere you'd like to evoke.`,
					time: now
				},
				[
					{ content: 'Calm & Meditative', icon: AiOptionIcon.theme },
					{ content: 'Dramatic & Intense', icon: AiOptionIcon.theme },
					{ content: 'Mystical & Ethereal', icon: AiOptionIcon.theme },
					{ content: 'Majestic & Triumphant', icon: AiOptionIcon.theme },
					{ content: 'Romantic & Lyrical', icon: AiOptionIcon.theme }
				]
			);
		}
		if (content.toLowerCase() == 'sensuousness') {
			newMessages.push({
				role: AiRole.System,
				content:
					'You’ve selected Sensuousness — music shaped by warmth, intimacy, and emotional nuance. These works invite deep listening and subtle reflection',
				time: now
			});
			let workCards: WorkCard[] = [];
			try {
				workCards = [...demo3] as WorkCard[];
			} catch (err) {
				console.error(err);
			}
			cardStore.set(workCards);
			actions.set([{ label: 'SHOW ME MORE' }, { label: 'REFINE SEARCH', action: refineSearch }]);
		}
	};
	const searchComposers = async (composerName: string): Promise<Composer[]> => {
		try {
			const response = await fetch(`/api/base/composers?name=${encodeURIComponent(composerName)}`);

			if (!response.ok) {
				throw new Error(`API error: ${response.status}`);
			}

			const data = await response.json();
			return z.array(ComposerSchema).parse(data); // Full validation
		} catch (err) {
			console.error('Error fetching composers:', err);
			return []; // Return empty array instead of {} to match return type
		}
	};
	const searchVectors = async (query: string) => {
		const response = await fetch('/api/vector/search', {
			method: 'POST',
			body: JSON.stringify({ query: query })
		});
		try {
			const files = (await response.json()).result.data;

			console.log('f', files);
			if (Array.isArray(files)) {
				files.forEach(async (file: any) => {
					const trimmedStr = file.filename
						.split('.')[0]
						.replace(/_(?:born|died|sometime)\d*.*$/i, '')
						.trim();
					file.composerName = trimmedStr.replace(/_/g, ' ');
				});
			}
			console.log(files);
			return files;
		} catch (err: any) {
			console.log('an error occured', err);
			return {};
		}
	};

	const optionSelected = async (content: string) => {
		const now = new Date();

		let newMessages: (AiMessage | AiOption[])[] = [
			{
				role: AiRole.User,
				content,
				time: now
			}
		];
		messages.update((msg) => [
			...msg.filter((opt) => {
				return !Array.isArray(opt);
			}),
			...newMessages
		]);
		state.loading = true;
		await randomDelay();
		state.loading = false;
		newMessages = [];

		runDemo1(newMessages, content);
		// runDemo2(newMessages, content);
		// runDemo3(newMessages, content);
		// //-----debug---------
		// let workCards: WorkCard[] = [];
		// try {
		// 	workCards = [...demo] as WorkCard[];
		// } catch (err) {
		// 	console.error(err);
		// }
		//cardStore.set(workCards);
		// //-----debug---------
		messages.update((msg) => [
			...msg.filter((opt) => {
				return !Array.isArray(opt);
			}),
			...newMessages
		]);
	};
	const processVectors = async (vectorResults: any): Promise<WorkCard[]> => {
		let newMessage: AiMessage = {
			role: AiRole.System,
			content: `You are a JSON data processing assistant. Your task is to:
        
        1. Receive vector search results
        2. Select the top 3 most relevant matches
        3. Return them in a SPECIFIC JSON structure

        Input Data:
        ${JSON.stringify(vectorResults, null, 2)}

        Required Output Format:
        {
            "works": [
                {
                    "work": {
                        "title": "String Quartet No. 14 in D minor",
                        "composer": {
                            "id": "beethoven-1770",
                            "name": "Ludwig van Beethoven",
                            "birthYear": 1770,
                            "deathYear": 1827
                        },
                        // ... (all other fields from your original example)
                    },
                    "insight": "a brief overview of why you chose to include the work"
                }
                // Exactly 3 items
            ]
        }

        Strict Rules:
        - Only return this exact JSON structure, nothing else
        - No additional text, explanations, or markdown
        - All property names must be double-quoted
        - Include no more than 3 items in the "works" array
        - If a field is missing in source data, omit it entirely
        - Never use single quotes or unquoted properties
        - The response must parse with JSON.parse() without errors

        Validation Checklist Before Responding:
        [ ] Top-level object has only "works" property
        [ ] No trailing commas
        [ ] No comments or non-JSON text
        [ ] All strings are double-quoted
        [ ] No undefined or null values - omit empty fields`
		};

		console.log('Sending to AI:', newMessage);
		let msgs = [...$messages, newMessage];

		try {
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ messages: msgs })
			});

			if (!response.ok) {
				throw new Error(`API request failed with status ${response.status}`);
			}

			let res = await response.json();
			console.log('AI Raw Response:', res.content);

			// Robust JSON extraction that handles:
			// 1. Raw JSON
			// 2. Markdown code blocks
			// 3. Accidental text before/after
			const extractJSON = (str: string) => {
				// Handle code blocks
				const codeBlockMatch = str.match(/```(?:json)?\n([\s\S]*?)\n```/);
				if (codeBlockMatch) return codeBlockMatch[1];

				// Handle potential wrapped JSON
				const jsonMatch = str.match(/\{[\s\S]*\}/);
				return jsonMatch ? jsonMatch[0] : str;
			};

			const jsonString = extractJSON(res.content);
			console.log('Extracted JSON:', jsonString);

			// Parse with reviver to ensure strict compliance
			const parsed = JSON.parse(jsonString, (key, value) => {
				if (typeof value === 'string') {
					return value.trim();
				}
				return value;
			});

			// Normalize to our expected structure
			let worksArray = [];
			if (Array.isArray(parsed)) {
				// If we got bare array, wrap it
				worksArray = parsed;
			} else if (parsed && parsed.works) {
				// If we got correct structure
				worksArray = parsed.works;
			} else if (parsed && parsed.work) {
				// If we got single work
				worksArray = [parsed];
			} else {
				throw new Error('Unexpected response structure');
			}

			// Validate we got proper WorkCard objects
			const validatedCards = worksArray.map((item: any) => {
				if (!item.work || !item.work.title) {
					throw new Error('Missing required work fields');
				}
				return item as WorkCard;
			});

			return validatedCards;
		} catch (err) {
			console.error('Vector processing error:', err);
			// Consider adding retry logic here if appropriate
			return [];
		}
	};
	const onSubmit = async (message: string) => {
		const newUserMessage: AiMessage = {
			role: AiRole.User,
			content: message,
			time: new Date()
		};
		messages.update((msg) => [...msg, newUserMessage]);
		let systemMessages: AiMessage[] | AiOption[] = [];
		state.loading = true;
		let vectors = await searchVectors(message);
		const cards = await processVectors(vectors);
		state.loading = false;
		cardStore.set(cards);
		console.log('set cards', cards);
		messages.update((msg: any) => [
			...msg.filter((opt: any) => {
				return !Array.isArray(opt);
			}),
			...systemMessages
		]);
	};
</script>

<div
	class="mb-8 flex h-full max-h-full w-full flex-col items-center justify-between overflow-y-hidden text-center"
>
	<div
		bind:this={scrollContainer}
		class="flex h-full w-full flex-col items-center justify-center overflow-y-auto"
	>
		{#each $messages as message, idx}
			{#if Array.isArray(message)}
				<!-- Handle AiOption[] case -->
				<div class="mt-2 flex flex-wrap justify-center gap-2 px-14">
					{#each message as option}
						<ChatOption content={option.content} {optionSelected}></ChatOption>
					{/each}
				</div>
			{:else}
				<!-- Handle AiMessage case -->
				{#if message.role == AiRole.User}
					<div class="flex w-full items-end justify-end">
						<div class="mb-4 rounded-lg bg-gray-300 px-4 py-3 text-right">
							{message.content}
						</div>
					</div>
				{:else}
					<span class="mb-2 whitespace-pre-line px-14 {idx == $lastMessageIndex ? 'font-bold' : ''}"
						>{message.content}</span
					>
				{/if}
			{/if}
		{/each}
		{#if $actions && $actions.length}
			<div class="flex w-full items-center justify-center space-x-4">
				{#each $actions as action}
					<XxButton
						excludeIcon={true}
						color="acid-500"
						label={action.label}
						action={action.action}
						size={'lg'}
					/>
				{/each}
			</div>
		{/if}

		{#if state.loading}
			<Spinner />
		{/if}
		{@render children?.()}
	</div>

	{#if showInput && !$actions.length}
		<div class="mt-4 w-full">
			<ChatInput prompt={'Something else?'} {onSubmit} />
		</div>
	{/if}
</div>
