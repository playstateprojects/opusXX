<script lang="ts">
	import { Textarea } from 'flowbite-svelte';

	// Use $props() for reactive props
	const props = $props<{
		prompt: string;
		onSubmit?: (message: string) => void;
	}>();

	// Local reactive state
	let userMessage = $state('');

	const handleKeydown = (event: KeyboardEvent) => {
		console.log('go');
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			console.log('here', props.onSubmit);
			props.onSubmit?.(userMessage); // Optional chaining for safety
			userMessage = ''; // Reset input (reactivity handled by $state)
		}
	};
</script>

<div id="chat-form" class="flex-co mt-4 flex w-full max-w-sm">
	<div
		class="mb-4 w-full rounded-lg rounded-b-none border-0 border-b-2 border-b-black bg-white text-left"
	>
		<span class="mx-2 mt-4">{props.prompt}</span>
		<Textarea
			placeholder="Write a comment"
			bind:value={userMessage}
			class="mb-0 w-full border-0 bg-white focus:border-0 focus:outline-none focus:ring-0"
			on:keydown={handleKeydown}
			aria-label="Chat input"
		/>
	</div>
</div>
