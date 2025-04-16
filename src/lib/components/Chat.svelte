<script lang="ts">
	import { AiRole, AiOptionIcon, type AiMessage, type AiOption } from '$lib/types';
	import ChatOption from './ChatOption.svelte';

	let messages: (AiMessage | AiOption[])[] = [
		{
			content:
				'I’ll help you shape bold, audience-ready programmes that leave a lasting impression',
			role: AiRole.System,
			time: new Date()
		},
		{
			content: 'What are you programming? Let’s find the perfect match.',
			role: AiRole.System,
			time: new Date()
		},
		[
			{
				content: 'A piece from a specific time period',
				icon: AiOptionIcon.period
			},
			{
				content: 'A piece for specific instrumentation',
				icon: AiOptionIcon.drama
			},
			{
				content: 'A piece that creates a particular atmosphere',
				icon: AiOptionIcon.drama
			},
			{
				content: 'A piece that matches a program theme',
				icon: AiOptionIcon.theme
			}
		]
	];
	$: lastMessageIndex = messages.reduce((lastIndex, item, currentIndex) => {
		return !Array.isArray(item) ? currentIndex : lastIndex;
	}, -1);
	const optionSelected = (content: string) => {
		alert(content);
	};
</script>

<div class="flex h-full w-full flex-col items-center justify-center text-center">
	{#each messages as message, idx}
		{#if Array.isArray(message)}
			<!-- Handle AiOption[] case -->
			{#each message as option}
				<ChatOption content={option.content} icon={option.icon} {optionSelected}></ChatOption>
			{/each}
		{:else}
			<!-- Handle AiMessage case -->
			<span class="mb-2 {idx == lastMessageIndex ? 'font-bold' : ''}">{message.content}</span>
		{/if}
	{/each}
</div>
