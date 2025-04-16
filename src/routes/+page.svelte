<script lang="ts">
	import Chat from '$lib/components/Chat.svelte';
	import XxButton from '$lib/components/XXButton.svelte';
	import { slide } from 'svelte/transition';
	let pageNumber = 1;
	const showChat = () => {
		pageNumber = 2;
	};
</script>

{#if pageNumber == 1}
	<div
		class="flex h-full w-full flex-col items-center justify-center p-16"
		out:slide={{ duration: 500, axis: 'y' }}
	>
		<h1 class="text-center text-3xl font-extrabold">
			Inspire Audiences.<br />Lead The Way.<br />Unlock New Opportunities.
		</h1>
		<p class="mt-4 text-center">
			Discover repertoire by female composers that fits your ensemble, theme, and artistic
			goals—plus the resources to programme it with confidence.
		</p>
		<p class="mt-4 text-center font-bold">
			I’ll help you shape bold, audience-ready programmes that leave a lasting impression.
		</p>
		<XxButton
			excludeIcon={true}
			color="acid-500"
			label="Start Curating"
			class="mt-4"
			action={showChat}
		/>
	</div>
{/if}
<div class="w-full">stuff</div>
{#if pageNumber == 2}
	<div class="h-full w-full" in:slide={{ duration: 500, axis: 'y' }}>
		<Chat />
	</div>
{/if}
