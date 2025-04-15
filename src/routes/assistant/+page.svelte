<script lang="ts">
	import { Kbd, Button, Textarea, Toolbar, ToolbarButton } from 'flowbite-svelte';
	import { PaperPlaneOutline } from 'flowbite-svelte-icons';
	import { AiRole, type AiMessage } from '$lib/types';
	import ChatLoading from '$lib/components/ChatLoading.svelte';
	import ChatBubble from '$lib/components/ChatBubble.svelte';
	let messages: AiMessage[] = [
		{
			role: AiRole.System,
			content:
				'You are a classical music expert. Your speciality is recommending works by female composers. Your primary audience are programme directors of major classical music companies.'
		}
	];
	let userMessage = '';
	let loading = false;
	let containerDiv: HTMLDivElement;
	const onSubmit = async () => {
		loading = true;
		messages = [...messages, { role: AiRole.User, content: userMessage }];
		setTimeout(() => {
			containerDiv.scrollTop = containerDiv.scrollHeight;
		}, 0);
		const response = await fetch('/api/chat', {
			method: 'POST',
			body: JSON.stringify({ messages: messages })
		});
		try {
			const newMessage = await response.json();
			messages = [...messages, newMessage];
			setTimeout(() => {
				containerDiv.scrollTop = containerDiv.scrollHeight;
			}, 0);
		} catch {
			console.log('an error occured');
			loading = false;
		}

		loading = false;
		userMessage = '';
	};
	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			if (!event.shiftKey) {
				// Regular enter - submit form
				event.preventDefault();
				onSubmit();
			}
			// Shift+Enter will create a new line by default, no need to handle it
		}
	};
</script>

<div class="flex h-full min-h-0 w-full flex-col items-center justify-between overflow-hidden px-4">
	<div
		class="flex w-full flex-col items-center space-y-4 overflow-scroll px-8 py-4"
		bind:this={containerDiv}
	>
		{#each messages.filter((message) => {
			return message.role != AiRole.System;
		}) as message}
			<div class="w-full max-w-screen-md px-4">
				<ChatBubble {message}></ChatBubble>
			</div>
		{/each}
		{#if loading}
			<div class="w-full max-w-screen-md px-4">
				<ChatLoading></ChatLoading>
			</div>
		{/if}
	</div>
	<div id="chat-form" class="flex w-full max-w-screen-md flex-col">
		<div class="h-5 bg-gradient-to-t from-[#FFFFFF] to-transparent"></div>
		<form on:submit={onSubmit}>
			<Textarea
				class="mb-4 w-full "
				placeholder="Write a comment"
				bind:value={userMessage}
				on:keydown={handleKeydown}
			>
				<div slot="footer" class="flex items-center justify-end">
					<Toolbar embedded>
						<ToolbarButton type="submit" name="Attach file" disabled={loading}
							><PaperPlaneOutline class="h-6 w-6 rotate-45" />
							<span class="sr-only">Send message</span></ToolbarButton
						>
					</Toolbar>
				</div>
			</Textarea>
		</form>
	</div>
</div>
