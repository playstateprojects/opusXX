<script lang="ts">
	import type { WorkCard } from '$lib/zodDefinitions';
	import { ArrowUpRightFromSquareOutline, ThumbsUpSolid } from 'flowbite-svelte-icons';
	const state = $state({
		showBack: false
	});
	let { workCard } = $props<{
		workCard?: WorkCard;
	}>();
</script>

<div class="flip-container relative aspect-[calc(9/16)] h-full w-full max-w-md">
	<div
		class="flip-inner relative h-full w-full"
		style="transform: rotateY({state.showBack ? 180 : 0}deg);"
	>
		<!-- Front -->
		<div
			id="card_front"
			class="flip-front absolute inset-0 flex aspect-[calc(9/16)] flex-col overflow-hidden rounded-3xl bg-black text-white shadow-lg"
		>
			<div class="flex w-full bg-[#F47C7C]">
				{#if workCard.work.composer.imageURL}
					<img
						src={workCard.work.composer.imageURL}
						alt=""
						class="aspect-[calc(5/7)] h-full w-24 object-cover"
					/>
				{/if}
				<div class="flex w-full flex-col items-start justify-center p-2">
					<span class="font-bold">{workCard.work.composer.name}</span>
					<span class="text-xs">{workCard.work.period}</span>
					<span class="text-xs">{workCard.work.composer.birthLocation}</span>
					<span class="text-xs"
						>{workCard.work.composer.birthDate} ~ {workCard.work.composer.deathDate}</span
					>
				</div>
				<div class="flex flex-col items-center justify-center p-4">
					<ArrowUpRightFromSquareOutline
						class="h-7 w-7 cursor-pointer text-primary-700"
						onclick={() => (state.showBack = true)}
					/>
				</div>
			</div>
			<div class="flex flex-col p-4">
				<h3 class="font-extrabold">{workCard.work.title}</h3>
				<span class="text-sm italic">{workCard.work.publicationYear}</span>
				<span class="mt-2 text-xs uppercase">{workCard.work.genre} {workCard.work.duration}</span>
				<div class="text-xs">
					{workCard.work.instrumentation.toString()}
				</div>
			</div>
		</div>

		<!-- Back -->
		<div
			id="card_back"
			class="flip-back absolute inset-0 flex aspect-[calc(9/16)] flex-col overflow-hidden rounded-3xl bg-black text-white shadow-lg"
		>
			<div class="flex w-full bg-[#F47C7C]">
				{#if workCard.work.composer.imageURL}
					<img
						src={workCard.work.composer.imageURL}
						alt=""
						class="aspect-[calc(16/7)] w-24 w-full object-cover"
					/>
				{/if}
			</div>
			<div class="flex flex-col p-4">
				<h3 class="font-extrabold">{workCard.work.title}</h3>
				<span class="text-sm italic">{workCard.work.publicationYear}</span>
				<span class="mt-2 text-xs uppercase">{workCard.work.genre} {workCard.work.duration}</span>
				<div class="text-xs">
					{workCard.work.instrumentation.toString()}
				</div>
				<button
					class="mt-4 text-xs text-primary-400 underline"
					on:click={() => (state.showBack = false)}
				>
					Back
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	.flip-container {
		perspective: 1000px;
	}
	.flip-inner {
		transition: transform 0.6s;
		transform-style: preserve-3d;
	}
	.flip-front,
	.flip-back {
		backface-visibility: hidden;
	}
	.flip-back {
		transform: rotateY(180deg);
	}
</style>
