<script lang="ts">
	import XxButton from '$lib/components/XXButton.svelte';
	import lib from '$lib/library.json';
	import { onMount } from 'svelte';
	import lib1 from '$lib/lib1.json';
	import { cardStore } from '$lib/stores/cardStore.js';
	import { WorkCard } from '$lib/zodDefinitions.js';
	import ShareIcon from '$lib/ShareIcon.svelte';

	onMount(() => {
		let libCards: WorkCard[] = [];
		try {
			libCards = [...lib1] as WorkCard[];
		} catch (err) {
			console.error(err);
		}
		cardStore.set(libCards);
	});
</script>

<div class="flex w-full flex-col items-center justify-center space-y-4 px-16 pb-0 pt-16">
	<h1 class="text-2xl">My Library</h1>
	{#each lib as item, idx}
		<div
			class="{idx === 0
				? 'bg-gray-300'
				: ''} flex h-28 items-center justify-between rounded-lg border-2 border-black shadow-[0_2px_0_0_rgba(156,163,175)] transition hover:shadow"
		>
			<!-- Image Placeholder -->
			<div class="h-28 flex-shrink-0 overflow-hidden rounded bg-gray-200 p-0">
				<img src={item.image} alt="Thumbnail" class="aspect-[1.2] h-full border-0 object-cover" />
			</div>

			<!-- Text Content -->
			<div class="max-h-28 flex-1 overflow-clip px-4 py-4">
				<h3 class="text-sm font-semibold text-gray-900">{item.title}</h3>
				<p class="text-sm text-gray-600">
					Emotionally potent works that speak to societal rupture, protest, and transformation.
				</p>
			</div>

			<!-- Arrow Icon -->
			<div class="flex h-full w-16 flex-shrink-0 flex-col items-start justify-start pt-4">
				<XxButton excludeIcon><ShareIcon /></XxButton>
			</div>
		</div>
	{/each}
</div>
