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
	import { cardStore } from '$lib/stores/cardStore.js';
	import demo from '$lib/demo1.json';
	import demo2 from '$lib/demo2.json';
	import demo2b from '$lib/demo2b.json';
	import type { WorkCard } from '$lib/zodDefinitions.js';
	import { randomDelay } from '$lib/utils.js';
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
	const runDemo1 = (newMessages: (AiMessage | AiOption[])[], content: string) => {
		const now = new Date();
		if (['A piece for specific instrumentation'].includes(content)) {
			newMessages.push(
				{
					role: AiRole.System,
					content: 'What instruments do you have available?',
					time: now
				},
				[
					{ content: 'Chamber music', icon: AiOptionIcon.theme },
					{ content: 'Choral', icon: AiOptionIcon.theme },
					{ content: 'Opera', icon: AiOptionIcon.theme },
					{ content: 'Orchestral', icon: AiOptionIcon.theme },
					{ content: 'Solo', icon: AiOptionIcon.theme },
					{ content: 'Vocal', icon: AiOptionIcon.theme }
				]
			);
		}
		if (content.toLowerCase().indexOf('orchestral') > -1) {
			newMessages.push(
				{
					role: AiRole.System,
					content: 'Would you prefer works from a specific period?',
					time: now
				},
				[
					{ content: 'Medieval' },
					{ content: 'Renaissance' },
					{ content: 'Baroque' },
					{ content: 'Romantic' },
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
					content: 'What theme would you like to explore?',
					time: now
				},
				[
					{ content: 'Sacred Tension', icon: AiOptionIcon.theme },
					{ content: 'Elemental Pulse', icon: AiOptionIcon.theme },
					{ content: 'Forgotten Futures', icon: AiOptionIcon.theme }
				]
			);
		}
		if (content.toLowerCase() == 'movement and change') {
			newMessages.push(
				{
					role: AiRole.System,
					content:
						'“Movement & Change” is a strong, evocative theme—dynamic and wide open. Great instinct. To sharpen its emotional or narrative focus, consider variations like:',
					time: now
				},
				[
					{ content: 'Transformation & Inner Journey', icon: AiOptionIcon.theme },
					{ content: 'Momentum & Physical Motion', icon: AiOptionIcon.theme },
					{ content: `Nature’s Cycles & Evolution`, icon: AiOptionIcon.theme },
					{ content: 'Revolution & Social Change', icon: AiOptionIcon.theme }
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
				content: `I’ve gathered a few vocal chamber works that I think match your vision—take a look and let me know what resonates.`,
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
		runDemo2(newMessages, content);
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
		let systemMessages: AiMessage[] | AiOption[] = [];
		await randomDelay();
		runDemo2(systemMessages, message);

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
				<div class="mt-2 flex flex-wrap justify-center gap-2 px-10">
					{#each message as option}
						<ChatOption content={option.content} icon={option.icon} {optionSelected}></ChatOption>
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
					<span class="mb-2 whitespace-pre-line {idx == $lastMessageIndex ? 'font-bold' : ''}"
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
						size={ButtonSizes.lg}
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
