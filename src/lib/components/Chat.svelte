<script lang="ts">
	import {
		ButtonSizes,
		AiRole,
		AiOptionIcon,
		type AiMessage,
		type AiOption,
		type ChatAction
	} from '$lib/types';
	import { derived } from 'svelte/store';
	import ChatOption from './ChatOption.svelte';
	import XxButton from './XXButton.svelte';
	import { messages, actions } from '$lib/stores/chatStore';
	import ChatInput from './ChatInput.svelte';
	import { cardStore } from '$lib/stores/cardStore';
	import demo from '$lib/demo1.json';
	import type { WorkCard } from '$lib/zodDefinitions';
	import { randomDelay } from '$lib/utils';
	import { IconOutline } from 'flowbite-svelte-icons';
	import { Spinner } from 'flowbite-svelte';
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
		if (['A piece for specific instrumentation'].includes(content)) {
			newMessages.push(
				{
					role: AiRole.System,
					content: 'What instruments do you have available?',
					time: now
				},
				[
					{ content: 'Violin Solo', icon: AiOptionIcon.theme },
					{ content: 'Symphonic Orchestra', icon: AiOptionIcon.theme },
					{ content: 'Quartet', icon: AiOptionIcon.theme }
				]
			);
		}
		if (['Symphonic Orchestra'].includes(content)) {
			newMessages.push(
				{
					role: AiRole.System,
					content: 'Would you prefer works from a specific period?',
					time: now
				},
				[
					{ content: 'Classical' },
					{ content: 'Romantic', icon: AiOptionIcon.theme },
					{ content: '20th Century', icon: AiOptionIcon.theme },
					{ content: 'Contemporary', icon: AiOptionIcon.theme }
				]
			);
		}
		if (['Romantic'].includes(content)) {
			newMessages.push({
				role: AiRole.System,
				content: "I've suggested three works",
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
		//debug
		let workCards: WorkCard[] = [];
		try {
			workCards = [...demo] as WorkCard[];
		} catch (err) {
			console.error(err);
		}
		cardStore.set(workCards);
		messages.update((msg) => [
			...msg.filter((opt) => {
				return !Array.isArray(opt);
			}),
			...newMessages
		]);
	};
	const onSubmit = (message: string) => {
		console.log('ffff');
		const newUserMessage: AiMessage = {
			role: AiRole.User,
			content: message,
			time: new Date()
		};

		messages.update((msg) => [...msg, newUserMessage]);
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
				<div class="mt-2 flex flex-wrap justify-center gap-2">
					{#each message as option}
						<ChatOption content={option.content} icon={option.icon} {optionSelected}></ChatOption>
					{/each}
				</div>
			{:else}
				<!-- Handle AiMessage case -->
				{#if message.role == AiRole.User}
					<div class="flex w-full items-end justify-end">
						<div class="mb-4 rounded-lg bg-gray-300 px-4 pb-1 text-right">
							{message.content}
						</div>
					</div>
				{:else}
					<span class="mb-2 {idx == $lastMessageIndex ? 'font-bold' : ''}">{message.content}</span>
				{/if}
			{/if}
		{/each}
		{#each $actions as action}
			<XxButton
				excludeIcon={true}
				color="acid-500"
				label={action.label}
				class=" my-4"
				action={action.action}
				size={ButtonSizes.lg}
			/>
		{/each}

		{#if state.loading}
			<Spinner />
		{/if}
		{@render children?.()}
	</div>

	{#if showInput}
		<div class="mt-4 w-full">
			<ChatInput prompt={'Something else?'} {onSubmit} />
		</div>
	{/if}
</div>
