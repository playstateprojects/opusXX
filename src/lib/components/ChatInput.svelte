<script lang="ts">
	import { Textarea } from 'flowbite-svelte';
	let userMessage = '';
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

<div id="chat-form" class="flex w-full max-w-screen-md flex-col">
	<div class="h-5 bg-gradient-to-t from-[#FFFFFF] to-transparent"></div>
	<form on:submit={onSubmit}>
		<Textarea
			class="mb-4 w-full "
			placeholder="Write a comment"
			bind:value={userMessage}
			on:keydown={handleKeydown}
		></Textarea>
	</form>
</div>
