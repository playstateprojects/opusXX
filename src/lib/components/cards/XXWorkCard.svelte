<script lang="ts">
	import type { WorkCardType } from '$lib/types';
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
	import { showUnderDevelopmentModal } from '$lib/stores/modalStore.js';
	const state = $state({
		showBack: false
	});
	let { workCard } = $props<{
		workCard?: WorkCardType;
	}>();

	function formatInstrumentation(value: string | undefined): string {
		if (!value) return '';
		const trimmed = value.trim();
		if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
			try {
				const parsed = JSON.parse(trimmed);
				if (Array.isArray(parsed)) return parsed.join(', ');
			} catch {
				// not valid JSON, return as-is
			}
		}
		return value;
	}
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
					? workCard.work.period?.toLowerCase().trim().replace(' ', '_')
					: 'romantic'} font-zwocorr"
				onclick={() => (state.showBack = true)}
			>
				<img
					src={workCard.work.composer.profileImages?.[0]?.cloudflareImageUrl.replace(
						/wideprofile|public/,
						'h=800,w=400,fit=cover,gravity=0.2x0.35'
					) ||
						'https://imagedelivery.net/5mdpBKEVK9RVERfzVJ-NHg/b584cc33-cddb-4e8f-fcc3-129e4b25d000/h=800,w=400,fit=cover,gravity=0.2x0.35'}
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
					<div class=" min-h-16">
						<h3 class="text-lg font-extrabold leading-snug">{workCard.work.name}</h3>
						<span class="font-light italic">{workCard.work.publicationYear}</span>
					</div>

					<div class="mt-2 flex justify-between font-semibold uppercase">
						<span>{workCard.work.genre?.name || 'Unknown Genre'}</span>
						<span>{workCard.work.duration}</span>
					</div>

					{#if workCard.work.subgenre}
						<div>
							<p class="text-xs text-gray-300">
								{workCard.work.subgenre.name}
							</p>
						</div>
					{/if}

					{#if workCard.work.catalogNumber}
						<div class="mt-2">
							<span class="text-xs text-gray-400">Catalog: {workCard.work.catalogNumber}</span>
						</div>
					{/if}

					<!-- {#if workCard.work.shortDescription}
						<div class="mt-3">
							<p class="text-sm leading-relaxed">
								{workCard.work.shortDescription}
							</p>
						</div>
					{/if} -->

					<div class="mt-4">
						<h4 class="mb-1 font-semibold">Insight</h4>
						<p class="text text-gray-300">
							{workCard.insight}
						</p>
					</div>

					<!-- {#if workCard.work.firstPerformance}
						<div class="mt-2">
							<span class="text-xs text-gray-400">Premiered: {workCard.work.firstPerformance}</span>
						</div>
					{/if} -->
				</div>
			</div>
			<!-- <section>
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
			</section> -->
			<section class="my-4 flex items-center justify-center gap-x-4">
				<XxButton size="sm" excludeIcon action={showUnderDevelopmentModal}>
					<span class="flex items-center justify-center"
						>SAVE <BookmarkOutline class="h-3 w-3" /></span
					>
				</XxButton>
				<!-- <XxButton
					size="sm"
					excludeIcon
					link={'https://base.opusxx.com/dashboard/#/nc/plvv803l38mvhyh/mnq7biac92brabu?rowId=' +
						workCard.work.id}
				>
					<span class="flex items-center justify-center"
						>EDIT <ShareIcon width={14} height={14} /></span
					>
				</XxButton> -->
				<XxButton
					size="sm"
					excludeIcon
					onclick={() => {
						workDetail.set(workCard.work);
					}}
				>
					<span class="flex items-center justify-center">More </span>
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
				<img
					src={workCard.work.composer.profileImages?.[0]?.cloudflareImageUrl.replace(
						/wideprofile|public/,
						'h=400,w=800,fit=cover,gravity=0.1x0.2'
					) ||
						'https://imagedelivery.net/5mdpBKEVK9RVERfzVJ-NHg/b584cc33-cddb-4e8f-fcc3-129e4b25d000/h=120,w=300,fit=cover,gravity=05x0.35'}
					alt=""
					class="mb-2 aspect-[2.2] w-full object-cover"
				/>
			</button>
			<div class="flex h-full flex-col px-4 pb-0 pt-4">
				<XxComposerCard composer={workCard.work.composer} />
			</div>

			<section class="my-4 flex items-center justify-center gap-x-4">
				<XxButton size="sm" excludeIcon action={showUnderDevelopmentModal}>
					<span class="flex items-center justify-center"
						>SAVE <BookmarkOutline class="h-3 w-3" /></span
					>
				</XxButton>
				<XxButton size="sm" excludeIcon action={showUnderDevelopmentModal}>
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
