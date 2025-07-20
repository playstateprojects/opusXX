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
		console.log('vects', vectors);
		vectors?.matches?.forEach((file: any) => {
			if (file.composer_name) {
				console.log('composer fould');
				getComposerByName(file.composer_name).then((composer: Composer) => {
					console.log('comp found', composer);
				});
			}
		});
		// vectors.forEach((element) => {});
		const { cards, overview } = await processVectors(vectors?.matches, filteredMessages);
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
