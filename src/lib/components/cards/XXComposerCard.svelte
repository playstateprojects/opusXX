<script lang="ts">
	import type { Composer } from '$lib/types';
	import { composerDetail } from '$lib/stores/cardStore.js';
	import { mediumDescription } from '$lib/utils/stringUtils';
	import { AngleDownOutline } from 'flowbite-svelte-icons';

	let { composer } = $props<{
		composer: Composer;
	}>();

	const description = $derived(
		mediumDescription(composer.longDescription, composer.shortDescription)
	);
</script>

<div class="flex min-h-0 flex-1 flex-col">
	<div class="flex min-h-0 flex-grow flex-col overflow-y-auto">
		<h3 class="font-extrabold">{composer.name}</h3>
		<span class="text-xs"
			>{composer.birthDate} {composer.deathDate ? ' - ' : ''}{composer.deathDate}</span
		>
		<span class=" text-xs uppercase italic text-gray-400">{composer.nationality}</span>
		{#if composer.composerPeriod || composer.composerStyle}
			<span class="text-xs text-gray-300">
				{[composer.composerPeriod, composer.composerStyle].filter(Boolean).join(' · ')}
			</span>
		{/if}
		{#if composer.birthLocation}
			<span class="text-xs text-gray-300">Born: {composer.birthLocation}</span>
		{/if}
		{#if composer.deathLocation}
			<span class="text-xs text-gray-300">Died: {composer.deathLocation}</span>
		{/if}
		{#if composer.activeLocations}
			<span class="text-xs text-gray-300">Active: {composer.activeLocations}</span>
		{/if}
		{#if composer.tags?.length}
			<div class="my-2 text-xs italic">{composer.tags.join(' · ')}</div>
		{/if}
		{#if composer.representativeWorks}
			<section>
				<h4 class="mb-1 mt-2 text-xs font-bold">Representative Works</h4>
				<ul class="list-disc pl-3 text-xs">
					{#each composer.representativeWorks as work}
						<li>{work}</li>
					{/each}
				</ul>
			</section>
		{/if}
		{#if composer.themes}
			<section>
				<h4 class="mb-1 mt-4 text-xs font-bold">Themes</h4>
				<p class="text-xs">{composer.themes.join(' · ')}</p>
			</section>
		{/if}
		{#if description}
			<div class="mt-4 text-xs">{description}</div>
		{/if}
	</div>

	<button
		class="mt-auto flex w-full flex-col items-center justify-center pt-2 text-slate-400"
		onclick={() => {
			composerDetail.set(composer);
		}}
	>
		<div class="m-0 flex items-center gap-x-2 p-0 text-xs font-bold uppercase">
			More <AngleDownOutline class="h-4 w-4" />
		</div>
	</button>
</div>
