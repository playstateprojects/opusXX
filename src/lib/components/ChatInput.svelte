<script lang="ts">
	import { Textarea, Toolbar, ToolbarButton } from 'flowbite-svelte';
	import { PaperPlaneOutline } from 'flowbite-svelte-icons';

	// Use $props() for reactive props
	const props = $props<{
		prompt: string;
		onSubmit?: (message: string) => void;
		active?: boolean;
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
	const submitMessage = (msg: string) => {
		console.log(msg);
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
			<div slot="footer" class="flex items-center justify-end">
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
