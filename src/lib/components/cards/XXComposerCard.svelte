<script lang="ts">
	import type { Composer } from '$lib/types';
	import { composerDetail } from '$lib/stores/cardStore.js';
	import { AngleDownOutline } from 'flowbite-svelte-icons';

	let { composer } = $props<{
		composer: Composer;
	}>();
</script>

<div class="flex h-full flex-col">
	<div class="flex-grow">
		<h3 class="font-extrabold">{composer.name}</h3>
		<span class="text-xs"
			>{composer.birthDate} {composer.deathDate ? ' - ' : ''}{composer.deathDate}</span
		>
		<span class=" text-xs uppercase italic text-gray-400">{composer.nationality}</span>
		{#if composer.tags}
			<span class="my-1 text-xs italic">{composer.tags.join(' · ')}</span>
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
		<div class="mt-4 text-xs">{composer.shortDescription}</div>
	</div>

	<button
		class="mt-auto flex w-full flex-col items-center justify-center text-slate-400"
		onclick={() => {
			composerDetail.set(composer);
		}}
	>
		<div class="m-0 flex items-center gap-x-2 p-0 text-xs font-bold uppercase">
			More <AngleDownOutline class="h-4 w-4" />
		</div>
	</button>
</div>
