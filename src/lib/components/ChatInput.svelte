<script lang="ts">
	import { Textarea, Toolbar, ToolbarButton } from 'flowbite-svelte';
	import { PaperPlaneOutline, RefreshOutline } from 'flowbite-svelte-icons';

	// Use $props() for reactive props
	const props = $props<{
		prompt: string;
		onSubmit?: (message: string) => void;
		active?: boolean;
		onReset?: () => void;
		showReset?: boolean;
	}>();

	// Local reactive state
	let userMessage = $state('');

	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			props.onSubmit?.(userMessage); // Optional chaining for safety
			userMessage = ''; // Reset input (reactivity handled by $state)
		}
	};
	const submitMessage = (event: SubmitEvent) => {
		event.preventDefault();
		props.onSubmit?.(userMessage); // Optional chaining for safety
		userMessage = '';
	};
</script>

<div id="chat-form" class="flex w-full flex-col">
	<form onsubmit={submitMessage}>
		<Textarea
			class="mb-4 w-full "
			placeholder="Something else?"
			bind:value={userMessage}
			on:keydown={handleKeydown}
		>
			<div slot="footer" class="flex items-center justify-between">
				{#if props.showReset}
					<button
						type="button"
						onclick={props.onReset}
						class="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-900"
					>
						<RefreshOutline class="h-4 w-4" />
						<span>Start New Search</span>
					</button>
				{:else}
					<div></div>
				{/if}
				<Toolbar embedded>
					<ToolbarButton type="submit" disabled={!props.active}
						><PaperPlaneOutline class="h-6 w-6 rotate-45" />
						<span class="sr-only">Send message</span></ToolbarButton
					>
				</Toolbar>
			</div>
		</Textarea>
	</form>
</div>
