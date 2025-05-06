<script lang="ts">
	import Chat from '$lib/components/Chat.svelte';
	import { slide } from 'svelte/transition';
	import { actions, messages } from '$lib/stores/chatStore';
	import { get } from 'svelte/store';
	import { AiOptionIcon, AiRole } from '$lib/types';
	import XxButton from '$lib/components/XXButton.svelte';
	import { goto } from '$app/navigation';
	import XxFooter from '$lib/components/XXFooter.svelte';
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

<div class="flex h-full w-full flex-col justify-between">
	{#if pageNumber == 1}
		<div class="flex w-full flex-col px-16 pb-0 pt-16" out:slide={{ duration: 500, axis: 'y' }}>
			<span class="font-zwocorr text-center text-2xl font-light">OpusXX Generator</span>
			<h1 class="font-zwo text-center text-5xl font-extrabold">
				Inspire Audiences.<br />Lead The Way.
			</h1>
			<p class="mt-4 text-center">
				I’ll help you discover repertoire by female composers that fits your ensemble, theme, and
				artistic goals—plus the resources to programme it with confidence.
			</p>
		</div>
	{/if}
	<div class="mb-4 flex w-full items-center justify-center">
		<XxButton
			excludeIcon={true}
			color="acid-500"
			label="Join the waiting list"
			class="mt-4"
			link="/waitlist"
		></XxButton>
	</div>
	<XxFooter></XxFooter>
</div>
