<script lang="ts">
	import { AiRole, AiOptionIcon, type AiMessage, type AiOption, type ChatAction } from '$lib/types';
	import { derived } from 'svelte/store';
	import ChatOption from './ChatOption.svelte';
	import XxButton from './XXButton.svelte';
	import { messages, actions } from '$lib/stores/chatStore';
	import ChatInput from './ChatInput.svelte';

	let { showInput } = $props<{
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

	const optionSelected = (content: string) => {
		const now = new Date();

		const newMessages: (AiMessage | AiOption[])[] = [
			{
				role: AiRole.User,
				content,
				time: now
			}
		];

		if (['A piece for specific instrumentation', 'Symphonic Orchestra'].includes(content)) {
			newMessages.push(
				{
					role: AiRole.System,
					content: 'What instruments do you have available?',
					time: now
				},
				[
					{ content: 'symphonic orchestra', icon: AiOptionIcon.theme },
					{ content: 'Violin Solo', icon: AiOptionIcon.theme },
					{ content: 'Symphonic Orchestra', icon: AiOptionIcon.theme },
					{ content: 'SSTDA', icon: AiOptionIcon.theme }
				]
			);
		}

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
	bind:this={scrollContainer}
	class="my-24 flex h-full max-h-full w-full flex-col items-center justify-center overflow-y-auto text-center"
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
			<span class="mb-2 {idx == $lastMessageIndex ? 'font-bold' : ''}">{message.content}</span>
		{/if}
	{/each}
	{#each $actions as action}
		<XxButton
			excludeIcon={true}
			color="acid-500"
			label={action.label}
			class="mt-4"
			action={action.action}
		/>
	{/each}
	{#if showInput}
		<div class="mt-4">
			<ChatInput prompt={'Something else?'} {onSubmit} />
		</div>
	{/if}
</div>
