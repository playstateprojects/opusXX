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

	const lastMessageIndex = derived(messages, ($messages) => {
		return $messages.reduce((lastIndex, item, currentIndex) => {
			return !Array.isArray(item) ? currentIndex : lastIndex;
		}, -1);
	});
	const optionSelected = (content: string) => {
		alert(content);
	};
</script>

<div class="flex w-full flex-col items-center justify-center text-center">
	{#each $messages as message, idx}
		{#if Array.isArray(message)}
			<!-- Handle AiOption[] case -->
			{#each message as option}
				<ChatOption content={option.content} icon={option.icon} {optionSelected}></ChatOption>
			{/each}
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
			<ChatInput prompt={'Something else?'} userMessage="" />
		</div>
	{/if}
</div>
