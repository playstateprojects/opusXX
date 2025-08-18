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
	import type { WorkCard } from '$lib/zodDefinitions.js';
	import { randomDelay } from '$lib/utils.js';
	import { Spinner } from 'flowbite-svelte';
	import { ComposerDatabaseSchema } from '$lib/databaseTypes';
	import type { Composer } from '$lib/types';
	import { getVectorQuery, processVectors } from '$lib/utils/vectors';
	import { z } from 'zod';
	import { getComposerById, getComposerByName, getWorkById } from '$lib/utils/supabase';
	import { formatComposerProfile } from '$lib/utils/composerParser';
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

	const searchVectors = async (query: string): Promise<FormattedVectorResponse | null> => {
		const response = await fetch('/api/vector/search', {
			method: 'POST',
			body: JSON.stringify({ query: query })
		});
		try {
			const result = await response.json();
			const files = result?.result?.data || [];

			if (Array.isArray(files)) {
				files.forEach(async (file: any) => {
					const trimmedStr = file.filename
						.split('.')[0]
						.replace(/_(?:born|died|sometime)\d*.*$/i, '')
						.trim();
					file.composerName = trimmedStr.replace(/_/g, ' ');
				});
			}

			return { summary: '', matches: files };
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

		messages.update((msg) => [
			...msg.filter((opt) => {
				return !Array.isArray(opt);
			}),
			...newMessages
		]);
	};

	async function semanticSearch(text: string): Promise<any[]> {
		const res = await fetch('/api/vector/search/pinecone', {
			method: 'POST',
			body: JSON.stringify({ query: text, topK: 5 })
		});
		const matches = await res.json();
		console.table(matches); // { id, score, metadata }
		return Array.isArray(matches) ? matches : [];
	}

	const getResponseFormatter = async (vectors: any[], userQuery: string): Promise<string> => {
		if (!vectors || !Array.isArray(vectors) || vectors.length === 0) {
			console.warn('No vectors found for the query:', userQuery);
			return `No relevant documents found for your query: "${userQuery}". Please try a different search term.`;
		}

		const docs = await Promise.all(
			vectors.map(async (v: any) => {
				try {
					const work = await getWorkById(v.metadata?.work_id);
					const composer = await getComposerById(v.metadata?.composer_id);
					
					if (!work || !composer) {
						console.warn('Missing work or composer in metadata:', v.metadata);
						return null;
					}

					const profile = formatComposerProfile(composer);
					
					return {
						file_id: v.metadata?.file_id || '',
						composer_name: composer.Name || '',
						work_title: work.title || v.metadata?.title || '',
						content: work.content || '',
						composer_profile: profile,
						score: v.score || 0,
						...v.metadata
					};
				} catch (error) {
					console.error('Error processing vector:', error);
					return null;
				}
			})
		);

		const matches = docs.filter((doc) => doc !== null);
		console.log('Processed matches:', matches.length);

		const prompt = `You are a classical music programming assistant specialized in female composers.
Your task is to analyze my query and the matched documents below, then respond directly to the user with a structured JSON object that includes a concise explanation of why each document was selected.

My query: ${userQuery}

Matched documents:
${JSON.stringify(matches, null, 2)}

Your output must strictly follow this JSON structure:

{
  "overview": "A brief overview of the selection of works to be shared with the user",
  "matches": [
    {
      "document_name": "exact filename of the input document, including .md extension",
      "file_id": "exact file_id from the supplied information",
      "composer_name": "name of the composer",
      "work_title": "title of the work",
      "justification": "short reason why this document was selected (e.g., similar instrumentation, electronic elements, thematic overlap)",
      "score": "relevance score from vector search"
    }
  ]
}

Guidelines:
- Focus on relevance to the user's query
- Highlight unique aspects of each work
- Consider instrumentation, style, and thematic elements
- Keep justifications concise but informative`;

		return prompt;
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
		// const vectorQuery = await getVectorQuery(filteredMessages);
		const vectorQuery = await semanticSearch(message);
		console.log('vq', vectorQuery);
		const prompt = await getResponseFormatter(vectorQuery, message);
		const promptMessage: AiMessage = {
			role: AiRole.User,
			content: prompt,
			time: new Date()
		};
		const response = await fetch('/api/chat/json', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ messages: [promptMessage] })
		});

		if (!response.ok) {
			throw new Error(`API request failed with status ${response.status}`);
		}

		let res = await response.json();
		console.log(res);
		return;
		// let systemMessages: AiMessage[] | AiOption[] = [];

		// let vectors = await searchVectors(vectorQuery);
		// console.log('vects', vectors);
		// const vectorResults = vectors?.matches || [];
		// vectorResults?.forEach((file: any) => {
		// 	if (file.composer_name) {
		// 		console.log('composer fould');
		// 		getComposerByName(file.composer_name).then((composer: Composer) => {
		// 			console.log('comp found', composer);
		// 		});
		// 	}
		// });
		// const { cards, overview } = await processVectors(vectorResults, filteredMessages);
		// console.log('cards', cards);
		// systemMessages.push({ role: AiRole.Assistant, content: overview });
		// state.loading = false;
		// cardStore.set(cards);
		// console.log('set cards', cards);
		// messages.update((msg: any) => [
		// 	...msg.filter((opt: any) => {
		// 		return !Array.isArray(opt);
		// 	}),
		// 	...systemMessages
		// ]);
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
