<script lang="ts">
	import { AiRole, type AiMessage } from '$lib/types';
	import { Card } from 'flowbite-svelte';
	export let message: AiMessage;
	$: htmlText = message.content.replace(/\n/g, '<br>');
</script>

<div class={`w-full ${message.role === AiRole.User ? 'text-right' : ''}`}>
	<Card horizontal size="md" class={`${message.role === AiRole.User ? 'ml-auto' : 'mr-auto'}`}>
		<p class="white-space: pre-line">{@html htmlText}</p>
	</Card>
</div>
