<script lang="ts">
	import Chat from '$lib/components/Chat.svelte';
	import XXFooter from '$lib/components/XXFooter.svelte';
	import { slide } from 'svelte/transition';
	import { actions, messages } from '$lib/stores/chatStore';
	import { get } from 'svelte/store';
	import { AiOptionIcon, AiRole } from '$lib/types';
	import { cardStore } from '$lib/stores/cardStore.js';
	import demo4 from '$lib/demo4.json';
	let pageNumber = 1;
	let startMessages = [
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
	const clearIntro = () => {
		pageNumber = 2;
		messages.set([...get(messages), ...startMessages]);
		actions.set([]);
	};
	actions.set([
		{
			label: 'Start Curating',
			action: clearIntro
		}
	]);
</script>

<div class="flex h-full max-h-full w-full flex-grow-0 flex-col overflow-hidden">
	{#if pageNumber == 1}
		<div class="flex w-full flex-col px-16 pb-0 pt-16" out:slide={{ duration: 500, axis: 'y' }}>
			<span class="text-center font-zwocorr text-2xl font-light text-gray-500"
				>OpusXX Generator</span
			>
			<h1 class="text-center font-zwo text-5xl font-extrabold">
				Inspire Audiences.<br />Lead The Way.
			</h1>
			<p class="mt-4 text-center font-medium">
				I’ll help you discover repertoire by female composers that fits your ensemble, theme, and
				artistic goals—plus the resources to programme it with confidence.
			</p>
		</div>
	{/if}
	<Chat showInput={pageNumber > 1}>
		{#if pageNumber == 1}
			<button
				class="mt-4 font-light uppercase underline"
				onclick={() => {
					pageNumber = 2;
					cardStore.set(demo4);
					messages.set([
						{
							content: `Three trailblazing women:
🎻 Maddalena Laura Sirmen – 18th c. virtuoso violinist & composer, rivaled Tartini.
🌊 Grace Williams – Wales’ symphonic voice, deeply lyrical, richly orchestrated.
🌌 Victoria Borisova-Ollas – Modern mystic, blending texture, drama & imagination.
A programme with power, poetry & legacy.`,
							role: AiRole.System,
							time: new Date()
						}
					]);
					actions.set([]);
				}}
			>
				Surprise Me!
			</button>
		{/if}
	</Chat>
	{#if pageNumber == 1}
		<XXFooter></XXFooter>
	{/if}
</div>
