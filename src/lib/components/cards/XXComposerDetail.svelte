<script lang="ts">
	import { composerDetail } from '$lib/stores/cardStore.js';
	import { Drawer } from 'flowbite-svelte';
	import {
		BookmarkOutline,
		CloseOutline,
		ArrowUpRightFromSquareOutline
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
	hidden={$composerDetail === null}
>
	<button
		class="flex w-full bg-[#F47C7C]"
		onclick={() => {
			composerDetail.set(null);
		}}
	>
		{#if $composerDetail?.profileImages?.[0]?.cloudflareImageUrl}
			<img
				src={$composerDetail.profileImages[0].cloudflareImageUrl}
				alt=""
				class="aspect-[1.6] h-full max-h-32 w-1/2 object-cover"
			/>
		{/if}
		<div class="flex w-full flex-col items-start justify-center p-2">
			<span class="font-bold">{$composerDetail?.name || 'Unknown Composer'}</span>
			<span class="text-xs">{$composerDetail?.composerPeriod || ''}</span>
			<span class="text-xs">{$composerDetail?.birthLocation || ''}</span>
			<span class="text-xs font-extralight italic">
				{$composerDetail?.birthDate || ''} 
				{#if $composerDetail?.deathDate}~ {$composerDetail.deathDate}{/if}
			</span>
		</div>
		<div class="flex flex-col items-center justify-start p-4">
			<CloseOutline class="solid h-5 w-5 border-[1px] border-black text-sm text-primary-900" />
		</div>
	</button>
	
	{#if $composerDetail}
	<div class="mx-auto space-y-4 bg-black p-6 text-xs text-white">
		<div class="flex flex-col items-start justify-between md:flex-row md:items-center">
			<div class="flex-1">
				<h1 class="text-lg font-bold">{$composerDetail.name}</h1>
				<p class="italic text-gray-400">
					{$composerDetail.birthDate}
					{#if $composerDetail.deathDate} - {$composerDetail.deathDate}{/if}
				</p>
				{#if $composerDetail.nationality}
					<p class="text-xs text-gray-500">{$composerDetail.nationality}</p>
				{/if}
			</div>
			<div class="flex gap-x-2">
				<XxButton excludeIcon size="sm"><BookmarkOutline class="h-5 w-5" /></XxButton>
				<XxButton excludeIcon size="sm"><ShareIcon /></XxButton>
				{#if $composerDetail.links && Array.isArray($composerDetail.links) && $composerDetail.links.length > 0}
					<XxButton excludeIcon size="sm" link={$composerDetail.links[0]}>
						External&nbsp;&nbsp;<ArrowUpRightFromSquareOutline class="h4 w-4" />
					</XxButton>
				{/if}
			</div>
		</div>

		<div class="flex w-full justify-between">
			<div class="text-xs uppercase tracking-wide text-gray-400">
				{$composerDetail.composerPeriod || 'Unknown Period'}
			</div>
			<div class="text-xs text-gray-300 md:mt-0">
				{$composerDetail.composerStyle || ''}
			</div>
		</div>

		<div class="grid gap-4 md:grid-cols-2">
			<div class="space-y-4">
				{#if $composerDetail.longDescription}
					<div>
						<h2 class="text-sm font-semibold mb-2">Biography</h2>
						<p class="text-gray-200 leading-relaxed">
							{$composerDetail.longDescription}
						</p>
					</div>
				{:else if $composerDetail.shortDescription}
					<div>
						<h2 class="text-sm font-semibold mb-2">Biography</h2>
						<p class="text-gray-200 leading-relaxed">
							{$composerDetail.shortDescription}
						</p>
					</div>
				{/if}

				{#if $composerDetail.birthLocation || $composerDetail.deathLocation}
					<div>
						<h2 class="text-sm font-semibold mb-2">Locations</h2>
						<div class="space-y-1">
							{#if $composerDetail.birthLocation}
								<p class="text-gray-200">Born: {$composerDetail.birthLocation}</p>
							{/if}
							{#if $composerDetail.deathLocation}
								<p class="text-gray-200">Died: {$composerDetail.deathLocation}</p>
							{/if}
						</div>
					</div>
				{/if}

				{#if $composerDetail.activeLocations}
					<div>
						<h2 class="text-sm font-semibold mb-2">Active Locations</h2>
						<p class="text-gray-200">{$composerDetail.activeLocations}</p>
					</div>
				{/if}

				{#if $composerDetail.works && $composerDetail.works.length > 0}
					<div>
						<h2 class="text-sm font-semibold mb-2">Works ({$composerDetail.works.length})</h2>
						<div class="max-h-32 overflow-y-auto">
							{#each $composerDetail.works.slice(0, 10) as work}
								<p class="text-xs text-gray-300 py-1">{work.name}</p>
							{/each}
							{#if $composerDetail.works.length > 10}
								<p class="text-xs text-gray-400 italic">...and {$composerDetail.works.length - 10} more</p>
							{/if}
						</div>
					</div>
				{/if}
			</div>

			<div class="space-y-4">
				{#if $composerDetail.gender}
					<div>
						<h2 class="text-sm font-semibold mb-2">Gender</h2>
						<p class="text-gray-200">{$composerDetail.gender}</p>
					</div>
				{/if}

				{#if $composerDetail.tags && Array.isArray($composerDetail.tags)}
					<div>
						<h2 class="text-sm font-semibold mb-2">Tags</h2>
						<div class="flex flex-wrap gap-1">
							{#each $composerDetail.tags as tag}
								<span class="bg-gray-700 text-xs px-2 py-1 rounded">{tag}</span>
							{/each}
						</div>
					</div>
				{/if}

				{#if $composerDetail.notes}
					<div>
						<h2 class="text-sm font-semibold mb-2">Notes</h2>
						<p class="text-gray-200 leading-relaxed">{$composerDetail.notes}</p>
					</div>
				{/if}

				{#if $composerDetail.sources && Array.isArray($composerDetail.sources) && $composerDetail.sources.length > 0}
					<div>
						<h2 class="text-sm font-semibold mb-2">Sources</h2>
						<div class="space-y-1 max-h-24 overflow-y-auto">
							{#each $composerDetail.sources as source}
								<p class="text-xs text-gray-300">{source}</p>
							{/each}
						</div>
					</div>
				{/if}

				{#if $composerDetail.references && Array.isArray($composerDetail.references) && $composerDetail.references.length > 0}
					<div>
						<h2 class="text-sm font-semibold mb-2">References</h2>
						<div class="space-y-2 max-h-32 overflow-y-auto">
							{#each $composerDetail.references as reference}
								<div class="text-xs">
									<p class="text-gray-300">{reference.content}</p>
									<p class="text-gray-400 italic">{reference.source}</p>
									{#if reference.tags && reference.tags.length > 0}
										<p class="text-gray-500 text-xs">{reference.tags.join(', ')}</p>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/if}

				{#if $composerDetail.links && Array.isArray($composerDetail.links) && $composerDetail.links.length > 0}
					<div>
						<h2 class="text-sm font-semibold mb-2">Links</h2>
						<div class="space-y-1 max-h-24 overflow-y-auto">
							{#each $composerDetail.links as link}
								<a href={link} target="_blank" class="text-blue-400 hover:text-blue-300 text-xs block break-all">
									{link}
								</a>
							{/each}
						</div>
					</div>
				{/if}

				{#if $composerDetail.media && Array.isArray($composerDetail.media) && $composerDetail.media.length > 0}
					<div>
						<h2 class="text-sm font-semibold mb-2">Media</h2>
						<div class="space-y-2 max-h-32 overflow-y-auto">
							{#each $composerDetail.media as mediaItem}
								<div class="text-xs">
									<p class="text-gray-300">{mediaItem.type}: {mediaItem.info}</p>
									{#if mediaItem.url}
										<a href={mediaItem.url} target="_blank" class="text-blue-400 hover:text-blue-300 break-all">
											{mediaItem.url}
										</a>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>

		{#if !$composerDetail.longDescription && !$composerDetail.shortDescription && !$composerDetail.works?.length}
			<div class="text-center py-8">
				<p class="text-gray-400 italic">
					Limited information available for this composer. More details may be added in future updates.
				</p>
			</div>
		{/if}
	</div>
	{/if}
</Drawer>