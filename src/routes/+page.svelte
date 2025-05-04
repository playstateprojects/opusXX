<script lang="ts">
	import Chat from '$lib/components/Chat.svelte';
	import { slide } from 'svelte/transition';
	import { actions, messages } from '$lib/stores/chatStore';
	import { get } from 'svelte/store';
	import { AiOptionIcon, AiRole } from '$lib/types';
	import XxButton from '$lib/components/XXButton.svelte';
	import { goto } from '$app/navigation';
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
			label: 'Join the waiting list',
			action: clearIntro
		}
	]);
	const showWaitlist = () => {
		console.log('w');
		goto('/waitlist');
	};
</script>

<div class="flex h-full w-full flex-col">
	{#if pageNumber == 1}
		<div class="flex w-full flex-col p-16" out:slide={{ duration: 500, axis: 'y' }}>
			<h1 class="text-center text-3xl font-extrabold">
				Inspire Audiences.<br />Lead The Way.<br />Unlock New Opportunities.
			</h1>
			<p class="mt-4 text-center">
				Discover repertoire by female composers that fits your ensemble, theme, and artistic
				goals—plus the resources to programme it with confidence.
			</p>
		</div>
	{/if}
	<div class="flex w-full items-center justify-center">
		<XxButton
			excludeIcon={true}
			color="acid-500"
			label="Join the waiting list"
			class="mt-4"
			link="/waitlist"
		></XxButton>
	</div>
</div>
