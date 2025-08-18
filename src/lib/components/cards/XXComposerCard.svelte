<script lang="ts">
	import type { Composer } from "$lib/types";
	let { composer } = $props<{
		composer: Composer;
	}>();
</script>

<h3 class="font-extrabold">{composer.name}</h3>
<span class="text-xs"
	>{composer.birthDate} {composer.deathDate ? ' - ' : ''}{composer.deathDate}</span
>
<span class=" text-xs uppercase italic text-gray-400">{composer.nationality}</span>
{#if composer.tags}
	<span class="my-1 text-xs italic">{composer.tags.join(' · ')}</span>ss
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
