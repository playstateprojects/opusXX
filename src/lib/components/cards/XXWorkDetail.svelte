<script lang="ts">
	import { workDetail } from '$lib/stores/cardStore.js';
	import { Drawer } from 'flowbite-svelte';
	import {
		BookmarkOutline,
		CloseOutline,
		ListMusicOutline,
		ShareAllOutline
	} from 'flowbite-svelte-icons';
	import { sineIn } from 'svelte/easing';
	import XxButton from '../XXButton.svelte';
	import ShareIcon from '$lib/ShareIcon.svelte';

	let transitionParamsRight = {
		x: 320,
		duration: 200,
		easing: sineIn
	};
</script>

<Drawer
	class="m-4 mr-8 rounded-3xl bg-black p-0"
	width="w-1/2 w-[calc(100vw/2-3rem)]"
	backdrop={false}
	position="fixed"
	placement="right"
	transitionParams={transitionParamsRight}
	hidden={$workDetail === null}
>
	<button
		class="flex w-full bg-[#F47C7C]"
		onclick={() => {
			workDetail.set(null);
		}}
	>
		{#if $workDetail?.composer?.profileImages?.[0]?.cloudflareImageUrl}
			<img
				src={$workDetail.composer.profileImages[0].cloudflareImageUrl}
				alt=""
				class=" aspect-[1.6] h-full max-h-32 w-1/2 object-cover"
			/>
		{/if}
		<div class="flex w-full flex-col items-start justify-center p-2">
			<span class="font-bold">{$workDetail?.composer?.name || 'Unknown Composer'}</span>
			<span class="text-xs">{$workDetail?.period || ''}</span>
			<span class="text-xs">{$workDetail?.composer?.birthLocation || ''}</span>
			<span class="text-xs font-extralight italic">
				{$workDetail?.composer?.birthDate || ''} 
				{#if $workDetail?.composer?.deathDate}~ {$workDetail.composer.deathDate}{/if}
			</span>
		</div>
		<div class="flex flex-col items-center justify-start p-4">
			<CloseOutline class="solid h-5  w-5 border-[1px] border-black text-sm text-primary-900" />
		</div>
	</button>
	{#if $workDetail}
	<div class="mx-auto space-y-4 bg-black p-6 text-xs text-white">
		<div class="flex flex-col items-start justify-between md:flex-row md:items-center">
			<div class="flex-1">
				<h1 class="text-lg font-bold">{$workDetail.name}</h1>
				<p class="italic text-gray-400">{$workDetail.publicationYear}</p>
				{#if $workDetail.catalogNumber}
					<p class="text-xs text-gray-500">Catalog: {$workDetail.catalogNumber}</p>
				{/if}
			</div>
			<div class="flex gap-x-2">
				<XxButton excludeIcon size="sm"><BookmarkOutline class="h-5 w-5" /></XxButton>
				<XxButton excludeIcon size="sm"><ShareIcon /></XxButton>
				{#if $workDetail.linkToScore}
					<XxButton excludeIcon size="sm" link={$workDetail.linkToScore}>
						Score&nbsp;&nbsp;<ListMusicOutline class="h4 w-4"></ListMusicOutline>
					</XxButton>
				{:else if $workDetail.publisher}
					<XxButton excludeIcon size="sm">
						{$workDetail.publisher}&nbsp;&nbsp;<ListMusicOutline class="h4 w-4"></ListMusicOutline>
					</XxButton>
				{/if}
			</div>
		</div>

		<div class="flex w-full justify-between">
			<div class="text-xs uppercase tracking-wide text-gray-400">
				{$workDetail.genre || 'Unknown Genre'}
			</div>
			<div class="text-xs text-gray-300 md:mt-0">
				{$workDetail.duration || 'Duration unknown'}
			</div>
		</div>

		<div class="grid gap-4 md:grid-cols-2">
			<div class="space-y-4">
				{#if $workDetail.instrumentation || $workDetail.scoring}
					<div>
						<h2 class="text-sm font-semibold mb-2">Instrumentation</h2>
						<p class="text-gray-200">
							{$workDetail.instrumentation || $workDetail.scoring}
						</p>
					</div>
				{/if}

				{#if $workDetail.shortDescription || $workDetail.longDescription}
					<div>
						<h2 class="text-sm font-semibold mb-2">Overview</h2>
						{#if $workDetail.longDescription}
							<p class="text-gray-200 leading-relaxed">
								{$workDetail.longDescription}
							</p>
						{:else if $workDetail.shortDescription}
							<p class="text-gray-200 leading-relaxed">
								{$workDetail.shortDescription}
							</p>
						{/if}
					</div>
				{/if}

				{#if $workDetail.firstPerformance}
					<div>
						<h2 class="text-sm font-semibold mb-2">Premiere</h2>
						<p class="text-gray-200">{$workDetail.firstPerformance}</p>
					</div>
				{/if}

				{#if $workDetail.relatedWorks}
					<div>
						<h2 class="text-sm font-semibold mb-2">Related Works</h2>
						<p class="text-gray-200">{$workDetail.relatedWorks}</p>
					</div>
				{/if}
			</div>

			<div class="space-y-4">
				{#if $workDetail.availability}
					<div>
						<h2 class="text-sm font-semibold mb-2">Availability</h2>
						<p class="text-gray-200">{$workDetail.availability}</p>
					</div>
				{/if}

				{#if $workDetail.tags}
					<div>
						<h2 class="text-sm font-semibold mb-2">Tags</h2>
						<p class="text-gray-200">{$workDetail.tags}</p>
					</div>
				{/if}

				{#if $workDetail.notes}
					<div>
						<h2 class="text-sm font-semibold mb-2">Notes</h2>
						<p class="text-gray-200 leading-relaxed">{$workDetail.notes}</p>
					</div>
				{/if}

				{#if $workDetail.source}
					<div>
						<h2 class="text-sm font-semibold mb-2">Source</h2>
						<p class="text-gray-200">{$workDetail.source}</p>
					</div>
				{/if}

				{#if $workDetail.ismn || $workDetail.iswc || $workDetail.oclc}
					<div>
						<h2 class="text-sm font-semibold mb-2">Identifiers</h2>
						<div class="space-y-1 text-xs">
							{#if $workDetail.ismn}
								<p class="text-gray-300">ISMN: {$workDetail.ismn}</p>
							{/if}
							{#if $workDetail.iswc}
								<p class="text-gray-300">ISWC: {$workDetail.iswc}</p>
							{/if}
							{#if $workDetail.oclc}
								<p class="text-gray-300">OCLC: {$workDetail.oclc}</p>
							{/if}
						</div>
					</div>
				{/if}

				{#if $workDetail.links}
					<div>
						<h2 class="text-sm font-semibold mb-2">Links</h2>
						<div class="text-gray-200 text-xs break-all">
							{$workDetail.links}
						</div>
					</div>
				{/if}
			</div>
		</div>

		{#if !$workDetail.longDescription && !$workDetail.shortDescription && !$workDetail.instrumentation && !$workDetail.notes}
			<div class="text-center py-8">
				<p class="text-gray-400 italic">
					Limited information available for this work. More details may be added in future updates.
				</p>
			</div>
		{/if}
	</div>
	{/if}
</Drawer>
