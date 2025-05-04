<script lang="ts">
	import { Textarea } from 'flowbite-svelte';
	let { prompt, userMessage } = $props<{ prompt: string; userMessage: string }>();
	const onSubmit = () => {
		console.log('hello');
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

<div id="chat-form" class="flex-co mt-4 flex w-full max-w-sm">
	<form on:submit={onSubmit}>
		<div
			class="mb-4 w-full rounded-lg rounded-b-none border-0 border-b-2 border-b-black bg-white text-left"
		>
			<span class="mx-2 mt-4">{prompt}</span>
			<Textarea
				placeholder="Write a comment"
				bind:value={userMessage}
				class="mb-0 w-full  border-0  bg-white"
				on:keydown={handleKeydown}
			></Textarea>
		</div>
	</form>
</div>
