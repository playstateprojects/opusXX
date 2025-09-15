<script lang="ts">
	import { composerDetail } from '$lib/stores/cardStore.js';
	import { Drawer } from 'flowbite-svelte';
	import {
		BookmarkOutline,
		CloseOutline,
		ArrowUpRightFromSquareOutline,
		EditOutline
	} from 'flowbite-svelte-icons';
	import { sineIn } from 'svelte/easing';
	import XxButton from '../XXButton.svelte';
	import ShareIcon from '$lib/ShareIcon.svelte';
	import { showUnderDevelopmentModal } from '$lib/stores/modalStore';

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
						{#if $composerDetail.deathDate}
							- {$composerDetail.deathDate}{/if}
					</p>
					{#if $composerDetail.nationality}
						<p class="text-xs text-gray-500">{$composerDetail.nationality}</p>
					{/if}
				</div>
				<div class="flex gap-x-2">
					<XxButton excludeIcon size="sm" action={showUnderDevelopmentModal}
						><BookmarkOutline class="h-5 w-5" /></XxButton
					>
					<XxButton
						excludeIcon
						size="sm"
						link={'https://base.opusxx.com/dashboard/#/nc/plvv803l38mvhyh/mp92lyoffyo7anj?rowId=' +
							$composerDetail.id}><EditOutline /></XxButton
					>
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
							<h2 class="mb-2 text-sm font-semibold">Biography</h2>
							<p class="leading-relaxed text-gray-200">
								{$composerDetail.longDescription}
							</p>
						</div>
					{:else if $composerDetail.shortDescription}
						<div>
							<h2 class="mb-2 text-sm font-semibold">Biography</h2>
							<p class="leading-relaxed text-gray-200">
								{$composerDetail.shortDescription}
							</p>
						</div>
					{/if}

					{#if $composerDetail.birthLocation || $composerDetail.deathLocation}
						<div>
							<h2 class="mb-2 text-sm font-semibold">Locations</h2>
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
							<h2 class="mb-2 text-sm font-semibold">Active Locations</h2>
							<p class="text-gray-200">{$composerDetail.activeLocations}</p>
						</div>
					{/if}

					{#if $composerDetail.works && $composerDetail.works.length > 0}
						<div>
							<h2 class="mb-2 text-sm font-semibold">Works ({$composerDetail.works.length})</h2>
							<div class="max-h-32 overflow-y-auto">
								{#each $composerDetail.works.slice(0, 10) as work}
									<p class="py-1 text-xs text-gray-300">{work.name}</p>
								{/each}
								{#if $composerDetail.works.length > 10}
									<p class="text-xs italic text-gray-400">
										...and {$composerDetail.works.length - 10} more
									</p>
								{/if}
							</div>
						</div>
					{/if}
				</div>

				<div class="space-y-4">
					{#if $composerDetail.gender}
						<div>
							<h2 class="mb-2 text-sm font-semibold">Gender</h2>
							<p class="text-gray-200">{$composerDetail.gender}</p>
						</div>
					{/if}

					{#if $composerDetail.tags && Array.isArray($composerDetail.tags)}
						<div>
							<h2 class="mb-2 text-sm font-semibold">Tags</h2>
							<div class="flex flex-wrap gap-1">
								{#each $composerDetail.tags as tag}
									<span class="rounded bg-gray-700 px-2 py-1 text-xs">{tag}</span>
								{/each}
							</div>
						</div>
					{/if}

					{#if $composerDetail.notes}
						<div>
							<h2 class="mb-2 text-sm font-semibold">Notes</h2>
							<p class="leading-relaxed text-gray-200">{$composerDetail.notes}</p>
						</div>
					{/if}

					{#if $composerDetail.sources && Array.isArray($composerDetail.sources) && $composerDetail.sources.length > 0}
						<div>
							<h2 class="mb-2 text-sm font-semibold">Sources</h2>
							<div class="max-h-24 space-y-1 overflow-y-auto">
								{#each $composerDetail.sources as source}
									<p class="text-xs text-gray-300">{source}</p>
								{/each}
							</div>
						</div>
					{/if}

					{#if $composerDetail.references && Array.isArray($composerDetail.references) && $composerDetail.references.length > 0}
						<div>
							<h2 class="mb-2 text-sm font-semibold">References</h2>
							<div class="max-h-32 space-y-2 overflow-y-auto">
								{#each $composerDetail.references as reference}
									<div class="text-xs">
										<p class="text-gray-300">{reference.content}</p>
										<p class="italic text-gray-400">{reference.source}</p>
										{#if reference.tags && reference.tags.length > 0}
											<p class="text-xs text-gray-500">{reference.tags.join(', ')}</p>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					{/if}

					{#if $composerDetail.links && Array.isArray($composerDetail.links) && $composerDetail.links.length > 0}
						<div>
							<h2 class="mb-2 text-sm font-semibold">Links</h2>
							<div class="max-h-24 space-y-1 overflow-y-auto">
								{#each $composerDetail.links as link}
									<a
										href={link}
										target="_blank"
										class="block break-all text-xs text-blue-400 hover:text-blue-300"
									>
										{link}
									</a>
								{/each}
							</div>
						</div>
					{/if}

					{#if $composerDetail.media && Array.isArray($composerDetail.media) && $composerDetail.media.length > 0}
						<div>
							<h2 class="mb-2 text-sm font-semibold">Media</h2>
							<div class="max-h-32 space-y-2 overflow-y-auto">
								{#each $composerDetail.media as mediaItem}
									<div class="text-xs">
										<p class="text-gray-300">{mediaItem.type}: {mediaItem.info}</p>
										{#if mediaItem.url}
											<a
												href={mediaItem.url}
												target="_blank"
												class="break-all text-blue-400 hover:text-blue-300"
											>
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
				<div class="py-8 text-center">
					<p class="italic text-gray-400">
						Limited information available for this composer. More details may be added in future
						updates.
					</p>
				</div>
			{/if}
		</div>
	{/if}
</Drawer>
