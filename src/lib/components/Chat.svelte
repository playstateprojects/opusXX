<script lang="ts">
	import {
		AiRole,
		AiOptionIcon,
		type AiMessage,
		type AiOption,
		type FormattedVectorResponse
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
	import { ComposerSchema, type Composer } from '$lib/zodAirtableTypes';
	import { getVectorQuery, processVectors } from '$lib/utils/vectors';
	import { z } from 'zod';
	import { getComposerByName } from '$lib/utils/supabase';
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
	const searchVectors = async (query: string): Promise<FormattedVectorResponse | null> => {
		const response = await fetch('/api/vector/search', {
			method: 'POST',
			body: JSON.stringify({ query: query })
		});
		try {
			const files = (await response.json()).result.data;

			if (Array.isArray(files)) {
				files.forEach(async (file: any) => {
					const trimmedStr = file.filename
						.split('.')[0]
						.replace(/_(?:born|died|sometime)\d*.*$/i, '')
						.trim();
					file.composerName = trimmedStr.replace(/_/g, ' ');
				});
			}
			console.log('ffffffiles', files);
			return files;
		} catch (err: any) {
			console.log('an error occured', err);
			return null;
		}
	};

	const optionSelected = async (content: string) => {
		console.log('debug');

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

	const onSubmit = async (message: string) => {
		const newUserMessage: AiMessage = {
			role: AiRole.User,
			content: message,
			time: new Date()
		};
		messages.update((msg) => [...msg, newUserMessage]);
		state.loading = true;
		let filteredMessages = get(messages).filter(
			(ms): ms is AiMessage => !Array.isArray(ms) && 'role' in ms
		);
		const vectorQuery = await getVectorQuery(filteredMessages);
		console.log('vq', vectorQuery);

		let systemMessages: AiMessage[] | AiOption[] = [];

		let vectors = await searchVectors(vectorQuery);
		console.log(vectors);
		// vectors.forEach((element) => {});
		const { cards, overview } = await processVectors(vectors, filteredMessages);
		console.log('cards', cards);
		systemMessages.push({ role: AiRole.Assistant, content: overview });
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
