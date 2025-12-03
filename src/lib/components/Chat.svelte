<script lang="ts">
	import {
		AiRole,
		type AiMessage,
		type AiOption,
		type InsightMakerRequest,
		type InsightMakerResponse,
		type QueryMakerResponse,
		type QuestionMakerResponse,
		type ActionDecisionResponse
	} from '$lib/types.js';
	import { derived, get } from 'svelte/store';
	import ChatOption from './ChatOption.svelte';
	import XxButton from './XXButton.svelte';
	import { messages, actions, resetChat } from '$lib/stores/chatStore.js';
	import ChatInput from './ChatInput.svelte';
	import {
		addCard,
		cardStore,
		filterRelevantCards,
		updateCardInsight,
		clearCards
	} from '$lib/stores/cardStore.js';
	import { Spinner } from 'flowbite-svelte';
	import { getWorkById, parseSqlSearchWork } from '$lib/utils/supabase';
	import { flattenChat } from '$lib/utils/stringUtils';
	const state = $state({
		loading: false,
		loadingMessage: ''
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

	// Helper function to generate intent from recent chat messages
	const generateIntentFromChat = (chatMessages: AiMessage[]): string => {
		// Get the last 3-5 user messages to capture the conversation intent
		const userMessages = chatMessages
			.filter(msg => msg.role === AiRole.User)
			.slice(-5)
			.map(msg => msg.content)
			.join('. ');

		return userMessages || 'Relevant works based on your search';
	};

	const performSqlSearch = async (filters: any, intent?: string, currentMessages?: AiMessage[]) => {
		state.loadingMessage = 'Searching database with filters...';

		try {
			const response = await fetch('/api/search/sql', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ filters, limit: 10 })
			});

			if (!response.ok) {
				console.error('SQL search failed:', response.statusText);
				return;
			}

			const { works, total } = await response.json();
			console.log(`Found ${total} works using SQL search`);

			state.loadingMessage = 'Loading work details...';
			// Parse and add works to cards
			works.forEach((work: any) => {
				const parsedWork = parseSqlSearchWork(work);
				addCard({ work: parsedWork, insight: '' });
			});

			if (works.length > 0) {
				state.loadingMessage = 'Generating insights...';
				// Generate insights for the found works using chat-derived intent
				const derivedIntent = intent || (currentMessages ? generateIntentFromChat(currentMessages) : 'Relevant works based on your filters');
				await updateCardInsights(derivedIntent);
				filterRelevantCards();
			}

			state.loadingMessage = 'Preparing follow-up questions...';
			await askNextQuestion(currentMessages);
		} catch (error) {
			console.error('Error in SQL search:', error);
		}
	};

	const performVectorSearch = async (intent?: string, filters?: any, currentMessages?: AiMessage[]) => {
		let filteredMessages = currentMessages || get(messages).filter(
			(ms): ms is AiMessage => !Array.isArray(ms) && 'role' in ms
		);

		state.loadingMessage = 'Analyzing your request...';
		const response = await fetch('/api/agents/query-maker', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ chatLog: flattenChat(filteredMessages) })
		});
		let data = await response.json();
		const { vectorQueryTerm, intent: queryIntent } = data as QueryMakerResponse;

		state.loadingMessage = 'Searching for relevant works...';
		let vectorQuery = await semanticSearch(vectorQueryTerm, filters);

		state.loadingMessage = 'Retrieving work details...';
		await Promise.all(
			vectorQuery.map(async (queryResult: any) => {
				let work = await getWorkById(queryResult.metadata?.work_id);
				if (work) {
					addCard({ work: work, insight: '' });
				}
				console.log('added card', work);
			})
		);

		state.loadingMessage = 'Generating insights...';
		// Update cards with insights after adding all cards using chat-derived intent
		const derivedIntent = intent || queryIntent || (filteredMessages ? generateIntentFromChat(filteredMessages) : 'Relevant works based on your search');
		await updateCardInsights(derivedIntent);

		filterRelevantCards();

		state.loadingMessage = 'Preparing follow-up questions...';
		// Ask a follow-up question after processing the results
		await askNextQuestion(currentMessages);
	};

	const optionSelected = async (option: AiOption) => {
		const now = new Date();

		// Add the user's selected option as a message
		const newUserMessage: AiMessage = {
			role: AiRole.User,
			content: option.content,
			time: now
		};

		// Remove existing options and add the user message
		messages.update((msg) => [...msg.filter((opt) => !Array.isArray(opt)), newUserMessage]);

		// Get updated messages array including the new message
		const currentMessages = get(messages).filter(
			(ms): ms is AiMessage => !Array.isArray(ms) && 'role' in ms
		);

		state.loading = true;
		state.loadingMessage = 'Processing your selection...';

		try {
			// Check if this option has a predefined response
			if (option.predefined) {
				// Use predefined response instead of calling the API
				const questionMessage: AiMessage = {
					role: AiRole.Assistant,
					content: option.predefined.question,
					time: new Date()
				};

				messages.update((msg) => [...msg, questionMessage]);

				// Add quick response options if they exist
				if (option.predefined.quickResponses && option.predefined.quickResponses.length > 0) {
					const options: AiOption[] = option.predefined.quickResponses.map((response) => ({
						content: response
					}));

					messages.update((msg) => [...msg, options]);
				}
			} else {
				// Original flow - call the action-decision API
				state.loadingMessage = 'Deciding next action...';

				// Get current displayed works from card store
				const currentCards = get(cardStore);
				const displayedWorks = currentCards.map(card => ({
					workName: card.work.name,
					composerName: card.work.composer.name || 'Unknown',
					period: card.work.period,
					genre: card.work.genre?.name,
					relevance: card.relevance,
					insight: card.insight,
					shortDescription: card.work.shortDescription
				}));

				// Determine what action to take based on the conversation
				const actionResponse = await fetch('/api/agents/action-decision', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						chatLog: flattenChat(currentMessages),
						displayedWorks: displayedWorks.length > 0 ? displayedWorks : undefined
					})
				});

				if (!actionResponse.ok) {
					console.error('Failed to get action decision:', actionResponse.statusText);
					state.loading = false;
					state.loadingMessage = '';
					return;
				}

				const actionData: ActionDecisionResponse = await actionResponse.json();
				console.log('Action decision:', actionData);

				// Check if there was an error in the response
				if ('error' in actionData) {
					console.error('Action decision returned error:', actionData.error);
					// Fall back to asking a question if decision-maker fails
					if (actionData.action === 'continue') {
						state.loadingMessage = 'Preparing follow-up questions...';
						await askNextQuestion(currentMessages);
						state.loading = false;
						state.loadingMessage = '';
						return;
					}
				}

				if (actionData.action === 'sql_search') {
					// Perform SQL search with filters
					await performSqlSearch(actionData.filters, undefined, currentMessages);
				} else if (actionData.action === 'vector_search') {
					// Perform vector search workflow with filters from action-decision
					await performVectorSearch(undefined, actionData.filters, currentMessages);
				} else {
					state.loadingMessage = 'Preparing follow-up questions...';
					// Continue conversation - just ask a follow-up question
					await askNextQuestion(currentMessages);
				}
			}
		} catch (error) {
			console.error('Error in option selected:', error);
		}

		state.loading = false;
		state.loadingMessage = '';
	};

	async function semanticSearch(text: string, filters?: any): Promise<any[]> {
		const res = await fetch('/api/vector/search/pinecone', {
			method: 'POST',
			body: JSON.stringify({ query: text, topK: 5, filters })
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

		// Process works in batches of 5 to avoid payload size issues
		const BATCH_SIZE = 5;
		const batches = [];
		for (let i = 0; i < works.length; i += BATCH_SIZE) {
			batches.push(works.slice(i, i + BATCH_SIZE));
		}

		console.log(`Processing ${works.length} works in ${batches.length} batches`);

		try {
			// Process batches sequentially to avoid overwhelming the API
			for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
				const batch = batches[batchIndex];
				console.log(`Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} works)`);

				const request: InsightMakerRequest = {
					works: batch,
					intention: intent
				};

				// Retry logic with exponential backoff
				let retries = 3;
				let delay = 1000;
				let success = false;

				while (retries > 0 && !success) {
					try {
						const controller = new AbortController();
						const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

						const response = await fetch('/api/agents/insight-maker', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(request),
							signal: controller.signal
						});

						clearTimeout(timeoutId);

						if (!response.ok) {
							throw new Error(`HTTP ${response.status}: ${response.statusText}`);
						}

						const data: InsightMakerResponse = await response.json();

						// Update cards with insights using the store function
						data.works.forEach((workInsight) => {
							updateCardInsight(workInsight.workId, workInsight.insight, workInsight.relevanceScore);
						});

						console.log(`Batch ${batchIndex + 1} completed: ${data.works.length} insights generated`);
						success = true;

					} catch (error) {
						retries--;
						if (retries > 0) {
							console.warn(`Batch ${batchIndex + 1} failed, retrying in ${delay}ms... (${retries} retries left)`, error);
							await new Promise(resolve => setTimeout(resolve, delay));
							delay *= 2; // Exponential backoff
						} else {
							console.error(`Batch ${batchIndex + 1} failed after all retries:`, error);
							// Set default insights for failed batch
							batch.forEach((work) => {
								updateCardInsight(work.id || work.name, 'Unable to generate insight', 5);
							});
						}
					}
				}

				// Small delay between batches to avoid rate limiting
				if (batchIndex < batches.length - 1) {
					await new Promise(resolve => setTimeout(resolve, 500));
				}
			}

			console.log('All insight batches completed');
		} catch (error) {
			console.error('Error updating card insights:', error);
		}
	};
	const askNextQuestion = async (currentMessages?: AiMessage[]) => {
		let filteredMessages = currentMessages || get(messages).filter(
			(ms): ms is AiMessage => !Array.isArray(ms) && 'role' in ms
		);

		// Get current displayed works from card store
		const currentCards = get(cardStore);
		const displayedWorks = currentCards.map(card => ({
			workName: card.work.name,
			composerName: card.work.composer.name || 'Unknown',
			period: card.work.period,
			genre: card.work.genre?.name,
			relevance: card.relevance,
			insight: card.insight,
			shortDescription: card.work.shortDescription
		}));

		try {
			const response = await fetch('/api/agents/question-maker', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					chatLog: flattenChat(filteredMessages),
					displayedWorks: displayedWorks.length > 0 ? displayedWorks : undefined
				})
			});

			if (!response.ok) {
				console.error('Failed to get follow-up question:', response.statusText);
				return;
			}

			const data: QuestionMakerResponse = await response.json();

			// Handle summary response (when conversation is extensive)
			if (data.summary && data.summary.trim()) {
				const summaryMessage: AiMessage = {
					role: AiRole.Assistant,
					content: data.summary,
					time: new Date()
				};

				messages.update((msg) => [...msg, summaryMessage]);
			}
			// Handle question response
			else if (data.question && data.question.trim()) {
				// Add the follow-up question as an AI message
				const questionMessage: AiMessage = {
					role: AiRole.Assistant,
					content: data.question,
					time: new Date()
				};

				messages.update((msg) => [...msg, questionMessage]);

				// Add quick response options if they exist
				if (data.quickResponses && data.quickResponses.length > 0) {
					const options: AiOption[] = data.quickResponses.map((response) => ({
						content: response
					}));

					messages.update((msg) => [...msg, options]);
				}
			}
		} catch (error) {
			console.error('Error getting follow-up question:', error);
		}
	};
	const onSubmit = async (message: string) => {
		const newUserMessage: AiMessage = {
			role: AiRole.User,
			content: message,
			time: new Date()
		};
		messages.update((msg) => [...msg, newUserMessage]);

		// Get updated messages array including the new message
		const currentMessages = get(messages).filter(
			(ms): ms is AiMessage => !Array.isArray(ms) && 'role' in ms
		);

		state.loading = true;

		try {
			state.loadingMessage = 'Deciding next action...';
			// Determine what action to take based on the conversation
			const actionResponse = await fetch('/api/agents/action-decision', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ chatLog: flattenChat(currentMessages) })
			});

			if (!actionResponse.ok) {
				console.error('Failed to get action decision:', actionResponse.statusText);
				state.loading = false;
				state.loadingMessage = '';
				return;
			}

			const actionData: ActionDecisionResponse = await actionResponse.json();
			console.log('Action decision:', actionData);

			// Check if there was an error in the response
			if ('error' in actionData) {
				console.error('Action decision returned error:', actionData.error);
				// Fall back to asking a question if decision-maker fails
				if (actionData.action === 'continue') {
					state.loadingMessage = 'Preparing follow-up questions...';
					await askNextQuestion(currentMessages);
					state.loading = false;
					state.loadingMessage = '';
					return;
				}
			}

			if (actionData.action === 'sql_search') {
				// Perform SQL search with filters
				await performSqlSearch(actionData.filters, undefined, currentMessages);
			} else if (actionData.action === 'vector_search') {
				// Perform vector search workflow with filters from action-decision
				await performVectorSearch(undefined, actionData.filters, currentMessages);
			} else {
				state.loadingMessage = 'Preparing follow-up questions...';
				// Continue conversation - just ask a follow-up question
				await askNextQuestion(currentMessages);
			}
		} catch (error) {
			console.error('Error in onSubmit:', error);
		}

		state.loading = false;
		state.loadingMessage = '';
	};

	const handleStartNewSearch = () => {
		resetChat();
		clearCards();
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
						<ChatOption {option} {optionSelected} disabled={state.loading}></ChatOption>
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
			<div class="flex flex-col items-center justify-center gap-3">
				<Spinner />
				{#if state.loadingMessage}
					<p class="text-sm text-gray-600">{state.loadingMessage}</p>
				{/if}
			</div>
		{/if}
		{@render children?.()}
	</div>

	{#if showInput && !$actions.length}
		<div class="mt-4 w-full">
			<ChatInput
				prompt={'Something else?'}
				{onSubmit}
				active={!state.loading}
				onReset={handleStartNewSearch}
				showReset={$messages.length > 0}
			/>
		</div>
	{/if}
</div>
