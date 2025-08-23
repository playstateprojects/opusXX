<script lang="ts">
	import {
		AiRole,
		type AiMessage,
		type AiOption,
		type FormattedVectorResponse,
		type InsightMakerRequest,
		type InsightMakerResponse,
		type QueryMakerResponse
	} from '$lib/types.js';
	import { derived, get } from 'svelte/store';
	import ChatOption from './ChatOption.svelte';
	import XxButton from './XXButton.svelte';
	import { messages, actions } from '$lib/stores/chatStore.js';
	import ChatInput from './ChatInput.svelte';
	import { addCard, cardStore, updateCardInsight } from '$lib/stores/cardStore.js';
	import { randomDelay } from '$lib/utils.js';
	import { Spinner } from 'flowbite-svelte';
	import { getWorkById } from '$lib/utils/supabase';
	import { flattenChat } from '$lib/utils/stringUtils';
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
		console.log('matches', matches);
		return Array.isArray(matches) ? matches : [];
	}

	const updateCardInsights = async (intent: string) => {
		const currentCards = get(cardStore);
		const works = currentCards.map((card) => card.work);

		if (works.length === 0) {
			console.log('No works to generate insights for');
			return;
		}

		try {
			const request: InsightMakerRequest = {
				works: works,
				intention: intent
			};

			const response = await fetch('/api/agents/insight-maker', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(request)
			});

			if (!response.ok) {
				console.error('Failed to get insights:', response.statusText);
				return;
			}

			const data: InsightMakerResponse = await response.json();

			// Update cards with insights using the store function
			data.works.forEach((workInsight) => {
				updateCardInsight(workInsight.workId, workInsight.insight);
			});

			console.log('Updated cards with insights', data.works);
		} catch (error) {
			console.error('Error updating card insights:', error);
		}
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

		const response = await fetch('/api/agents/query-maker', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ chatLog: flattenChat(filteredMessages) })
		});
		let data = await response.json();
		console.log(data);
		const { vectorQueryTerm, intent } = data as QueryMakerResponse;
		console.log('terms', vectorQueryTerm);
		console.log('terms', intent);
		let vectorQuery = await semanticSearch(vectorQueryTerm);
		await Promise.all(
			vectorQuery.map(async (queryResult: any) => {
				let work = await getWorkById(queryResult.metadata?.work_id);
				if (work) {
					addCard({ work: work, insight: '' });
				}

				console.log('added card', work);
			})
		);

		// Update cards with insights after adding all cards
		await updateCardInsights(intent);

		state.loading = false;
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
