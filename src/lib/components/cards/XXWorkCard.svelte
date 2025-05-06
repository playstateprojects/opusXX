<script lang="ts">
	import type { WorkCard } from '$lib/zodDefinitions';
	import XxButton from '$lib/components/XXButton.svelte';
	import { ArrowUpRightFromSquareOutline, AngleDownOutline } from 'flowbite-svelte-icons';
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
			<button
				class="flex w-full bg-[#F47C7C]"
				cursor-pointer
				onclick={() => (state.showBack = true)}
			>
				{#if workCard.work.composer.imageURL}
					<img
						src={workCard.work.composer.imageURL.replace(
							'public',
							'h=800,w=400,fit=cover,gravity=0.5x0.25'
						)}
						alt=""
						class="mb-5 aspect-[calc(5/7)] h-full w-24 object-cover"
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
					<ArrowUpRightFromSquareOutline class="h-5 w-5  text-sm text-primary-600" />
				</div>
			</button>
			<div class="flex h-full max-h-full flex-col overflow-y-scroll">
				<div class="flex flex-col p-4">
					<h3 class="font-extrabold">{workCard.work.title}</h3>
					<span class="text-sm italic">{workCard.work.publicationYear}</span>
					<div class="mt-2 flex justify-between text-xs uppercase">
						<span>{workCard.work.genre}</span><span>{workCard.work.duration}</span>
					</div>
					<h4 class="mt-4 font-bold">Instrumentation Summary</h4>
					<p class="text-xs">
						{workCard.work.instrumentation.toString()}
					</p>
					{#each workCard.work.sections as section}
						<section>
							<h4 class="mt-4 font-bold">{section.title}</h4>
							<p class="text-xs">
								{section.content}
							</p>
						</section>
					{/each}
					<section>
						<h4 class="mt-4 font-bold">Insight</h4>
						<p class="text-xs">
							{workCard.insight}
						</p>
					</section>
				</div>
			</div>
			<section>
				<button class="flex w-full flex-col items-center justify-center text-slate-400">
					<div class="m-0 flex items-center gap-x-2 p-0 text-xs font-bold uppercase">
						More <AngleDownOutline class="h-4 w-4" />
					</div>
				</button>
			</section>
			<section class="my-4 flex items-center justify-center gap-x-4">
				<XxButton label="SAVE" size="sm" excludeIcon />
				<XxButton label="SHARE" size="sm" excludeIcon />
			</section>
		</div>

		<!-- Back -->
		<div
			id="card_back"
			class="flip-back absolute inset-0 flex aspect-[calc(9/16)] flex-col overflow-hidden rounded-3xl bg-black text-white shadow-lg"
		>
			<button
				class="flex w-full cursor-pointer bg-[#F47C7C]"
				onclick={() => (state.showBack = false)}
			>
				{#if workCard.work.composer.imageURL}
					<img
						src={workCard.work.composer.imageURL.replace(
							'public',
							'w=800,h=300,fit=cover,gravity=0.5x0.25'
						)}
						alt=""
						class="aspect-[calc(16/7)] w-24 w-full object-cover"
					/>
				{/if}
				<div class="flex flex-col items-center justify-center p-4">
					<ArrowUpRightFromSquareOutline class="h-5 w-5  text-sm text-primary-600" />
				</div>
			</button>
			<div class="flex flex-col p-4">
				<h3 class="font-extrabold">{workCard.work.title}</h3>
				<span class="text-sm italic">{workCard.work.publicationYear}</span>
				<span class="mt-2 text-xs uppercase">{workCard.work.genre} {workCard.work.duration}</span>
				<div class="text-xs">
					{workCard.work.instrumentation.toString()}
				</div>
				<button
					class="mt-4 text-xs text-primary-400 underline"
					onClick={() => (state.showBack = false)}
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
