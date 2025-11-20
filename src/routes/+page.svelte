<script lang="ts">
	import Chat from '$lib/components/Chat.svelte';
	import XXFooter from '$lib/components/XXFooter.svelte';
	import { slide } from 'svelte/transition';
	import { actions, messages } from '$lib/stores/chatStore';
	import { get } from 'svelte/store';
	import { AiOptionIcon, AiRole } from '$lib/types';
	import { cardStore } from '$lib/stores/cardStore.js';
	import { onMount } from 'svelte';
	import { getWorksByComposerId } from '$lib/utils/supabase';
	import type { SurpriseResponse } from './api/agents/surprise-ninja/+server';
	import type { WorkCardType, QuestionMakerResponse, QuestionMakerInfo } from '$lib/types';

	let pageNumber = 1;
	let isLoadingSurprise = false;
	let startMessages = [
		{
			content: "What are you programming? Let's find the perfect match.",
			role: AiRole.System,
			time: new Date()
		},
		[
			{
				content: 'A piece from a specific time period',
				icon: AiOptionIcon.period,
				predefined: {
					question: 'Which time period interests you?',
					quickResponses: [
						'Medieval',
						'Renaissance',
						'Baroque',
						'Classical',
						'Romantic',
						'20th Century',
						'Contemporary'
					]
				}
			},
			{
				content: 'A piece for a specific instrumentation',
				icon: AiOptionIcon.drama,
				predefined: {
					question: 'What type of ensemble or instrumentation?',
					quickResponses: ['Chamber music', 'Choral', 'Opera', 'Orchestral', 'Solo', 'Vocal']
				}
			},
			{
				content: 'A piece that creates a particular atmosphere',
				icon: AiOptionIcon.drama,
				predefined: {
					question: 'What mood or atmosphere are you looking for?',
					quickResponses: [
						'Meditative',
						'Upbeat',
						'Melancholic',
						'Virtuosic',
						'Relaxing',
						'Dramatic'
					]
				}
			},
			{
				content: 'A piece that matches a program theme',
				icon: AiOptionIcon.theme
				// This one will use the AI decision endpoint for more complex matching
			}
		]
	];
	const clearIntro = () => {
		pageNumber = 2;
		messages.set([...get(messages), ...startMessages]);
		actions.set([]);
	};
	actions.set([
		{
			label: 'Start Curating',
			action: clearIntro
		}
	]);
	const surpriseMe = async () => {
		isLoadingSurprise = true;
		pageNumber = 2;
		messages.set([{ content: 'Considering the options', role: AiRole.Assistant }]);
		actions.set([]);
		try {
			const response = await fetch('/api/agents/surprise-ninja');
			if (!response.ok) {
				throw new Error('Failed to fetch surprise work');
			}

			const data: SurpriseResponse = await response.json();

			// Transform the database work to the Work type expected by cardStore
			const work = {
				id: data.work.id,
				name: data.work.name || '',
				composer: {
					id: data.work.composer_details?.id,
					name: data.work.composer_details?.name || '',
					birthDate: data.work.composer_details?.birth_date || undefined,
					deathDate: data.work.composer_details?.death_date || undefined,
					nationality: data.work.composer_details?.nationality || undefined,
					composerPeriod: data.work.composer_details?.composer_period || undefined,
					shortDescription: data.work.composer_details?.short_description || undefined
				},
				period: data.work.period || undefined,
				instrumentation: data.work.instrumentation || undefined,
				duration: data.work.duration || undefined,
				publisher: data.work.publisher || undefined,
				shortDescription: data.work.short_description || undefined,
				longDescription: data.work.long_description || undefined,
				genre: data.work.genre_details
					? {
							id: data.work.genre_details.id,
							name: data.work.genre_details.name
						}
					: undefined
			};

			const card: WorkCardType = {
				work,
				insight: data.summary,
				relevance: 10 // Featured work, so max relevance
			};

			// Call question-maker to generate a follow-up question based on the surprise
			const chatLog = `System: Here's a featured work for you:\n\nWork: ${work.name} by ${work.composer.name}\n${data.summary}`;

			const questionMakerBody: QuestionMakerInfo = {
				chatLog: chatLog
			};

			const questionResponse = await fetch('/api/agents/question-maker', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(questionMakerBody)
			});

			let questionData: QuestionMakerResponse | null = null;
			if (questionResponse.ok) {
				questionData = await questionResponse.json();
			}

			// Update the UI
			pageNumber = 2;
			cardStore.set([card]);

			// Use the question from question-maker if available, otherwise fall back to the summary
			const displayMessage = questionData?.question || data.summary;

			messages.set([
				{
					content: displayMessage,
					role: AiRole.System,
					time: new Date()
				}
			]);

			// Add quick responses if provided by question-maker
			if (questionData?.quickResponses && questionData.quickResponses.length > 0) {
				messages.update((msgs) => [
					...msgs,
					questionData.quickResponses!.map((response) => ({
						content: response,
						icon: AiOptionIcon.theme
					}))
				]);
			}

			actions.set([]);
		} catch (error) {
			console.error('Error fetching surprise:', error);
			// Optionally show an error message to the user
		} finally {
			isLoadingSurprise = false;
		}
	};

	onMount(() => {
		cardStore.set([]);
		// getWorksByComposerId(410).then((res: any) => {
		// 	console.log('xxxxxx', res);
		// });
	});
</script>

<div class="flex h-full max-h-full w-full flex-grow-0 flex-col overflow-hidden">
	{#if pageNumber == 1}
		<div class="flex w-full flex-col px-16 pb-0 pt-16" out:slide={{ duration: 500, axis: 'y' }}>
			<span class="text-center font-zwocorr text-2xl font-light text-gray-500"
				>OpusXX Generator</span
			>
			<h1 class="text-center font-zwo text-5xl font-extrabold">
				Inspire Audiences.<br />Lead The Way.
			</h1>
			<p class="mt-4 text-center font-medium">
				I'll help you discover repertoire by female composers that fits your ensemble, theme, and
				artistic goals—plus the resources to programme it with confidence.
			</p>
		</div>
	{/if}
	<Chat showInput={pageNumber > 1}>
		{#if pageNumber == 1}
			<button
				class="mt-4 font-light uppercase underline"
				onclick={surpriseMe}
				disabled={isLoadingSurprise}
			>
				{isLoadingSurprise ? 'Loading...' : 'Surprise Me!'}
			</button>
		{/if}
	</Chat>
	{#if pageNumber == 1}
		<XXFooter></XXFooter>
	{/if}
</div>
