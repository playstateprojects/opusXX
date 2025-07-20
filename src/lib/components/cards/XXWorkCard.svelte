<script lang="ts">
	import type { WorkCard } from '$lib/zodDefinitions';
	import XxButton from '$lib/components/XXButton.svelte';
	import XxComposerCard from '$lib/components/cards/XXComposerCard.svelte';
	import {
		ArrowUpRightFromSquareOutline,
		AngleDownOutline,
		BookmarkOutline,
		ShareAllOutline
	} from 'flowbite-svelte-icons';
	import { workDetail } from '$lib/stores/cardStore.js';
	import ShareIcon from '$lib/ShareIcon.svelte';
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
				class="flex w-full text-black bg-period-{workCard.work.period
					? workCard.work.period.toLowerCase().trim().replace(' ', '_')
					: 'romantic'} font-zwocorr"
				onclick={() => (state.showBack = true)}
			>
				<img
					src={workCard.work.composer.imageURL.replace(
						/public|wideprofile/,
						'h=800,w=400,fit=cover,gravity=0.2x0.35'
					)}
					alt=""
					class="mb-5 aspect-[0.9] h-full w-24 object-cover"
				/>
				<div class="flex w-full flex-col items-start justify-center p-2">
					<span class="text-left font-bold">{workCard.work.composer.name}</span>
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
			<div class="flex flex-1 flex-col overflow-y-auto text-xs">
				<div class="flex flex-col p-4">
					<h3 class="font-extrabold">{workCard.work.title}</h3>
					<span class="text-xs italic">{workCard.work.publicationYear}</span>
					<div class="mt-2 flex justify-between text-xs uppercase">
						<span>{workCard.work.genre}</span><span>{workCard.work.duration}</span>
					</div>
					<h4 class="mt-4 font-bold">Instrumentation Summary</h4>
					<p class="text-xs">
						{workCard.work.instrumentation && Array.isArray(workCard.work.instrumentation)
							? workCard.work.instrumentation.join(', ')
							: ''}
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
				<button
					class="flex w-full flex-col items-center justify-center text-slate-400"
					onclick={() => {
						workDetail.set(workCard.work);
					}}
				>
					<div class="m-0 flex items-center gap-x-2 p-0 text-xs font-bold uppercase">
						More <AngleDownOutline class="h-4 w-4" />
					</div>
				</button>
			</section>
			<section class="my-4 flex items-center justify-center gap-x-4">
				<XxButton size="sm" excludeIcon link="/library">
					<span class="flex items-center justify-center"
						>SAVE <BookmarkOutline class="h-3 w-3" /></span
					>
				</XxButton>
				<XxButton
					size="sm"
					excludeIcon
					link="mailto:?subject=Meet your next standout composer&from=hello@opusxx.com"
				>
					<span class="flex items-center justify-center"
						>SHARE <ShareIcon width={14} height={14} /></span
					>
				</XxButton>
			</section>
		</div>

		<!-- Back -->
		<div
			id="card_back"
			class="flip-back absolute inset-0 flex aspect-[calc(9/16)] flex-col overflow-hidden rounded-3xl bg-black text-white shadow-lg"
		>
			<button
				class="flex w-full cursor-pointer bg-period-{workCard.work.period
					? workCard.work.period.toLowerCase().trim().replace(' ', '_')
					: ''}"
				onclick={() => (state.showBack = false)}
			>
				{#if workCard.work.composer.imageURL}
					<img
						src={workCard.work.composer.imageURL.replace(
							/public|wideprofile/,
							'h=120,w=300,fit=cover,gravity=05x0.35'
						)}
						alt=""
						class="mb-2 aspect-[2.2] w-24 w-full object-cover"
					/>
				{/if}
			</button>
			<div class="flex h-full flex-col p-4">
				<XxComposerCard composer={workCard.work.composer} />
			</div>
			<section>
				<button class="flex w-full flex-col items-center justify-center text-slate-400">
					<div class="m-0 flex items-center gap-x-2 p-0 text-xs font-bold uppercase">
						More <AngleDownOutline class="h-4 w-4" />
					</div>
				</button>
			</section>
			<section class="my-4 flex items-center justify-center gap-x-4">
				<XxButton size="sm" excludeIcon link="/library">
					<span class="flex items-center justify-center"
						>SAVE <BookmarkOutline class="h-3 w-3" /></span
					>
				</XxButton>
				<XxButton size="sm" excludeIcon link="mailto:hello@opusxx.com">
					<span class="flex items-center justify-center">SHARE <ShareIcon /></span>
				</XxButton>
			</section>
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
