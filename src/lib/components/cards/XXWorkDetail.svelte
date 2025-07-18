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
		{#if $workDetail.composer.imageURL}
			<img
				src={$workDetail.composer.imageURL.replace(
					'public',
					'w=800,h=500,fit=cover,gravity=0.5x0.2'
				)}
				alt=""
				class=" aspect-[1.6] h-full max-h-32 w-1/2 object-cover"
			/>
		{/if}
		<div class="flex w-full flex-col items-start justify-center p-2">
			<span class="font-bold">{$workDetail.composer.name}</span>
			<span class="text-xs">{$workDetail.period}</span>
			<span class="text-xs">{$workDetail.composer.birthLocation}</span>
			<span class="text-xs font-extralight italic"
				>{$workDetail.composer.birthDate} ~ {$workDetail.composer.deathDate}</span
			>
		</div>
		<div class="flex flex-col items-center justify-start p-4">
			<CloseOutline class="solid h-5  w-5 border-[1px] border-black text-sm text-primary-900" />
		</div>
	</button>
	<div class="mx-auto space-y-4 bg-black p-6 text-xs text-white">
		<div class="flex flex-col items-start justify-between md:flex-row md:items-center">
			<div>
				<h1 class="text-xs font-semibold">{$workDetail.title}</h1>
				<p class=" italic text-gray-400">{$workDetail.publicationYear}</p>
			</div>
			<div class="flex gap-x-2">
				<XxButton excludeIcon size="sm"><BookmarkOutline class="h-5 w-5" /></XxButton>
				<XxButton excludeIcon size="sm"><ShareIcon /></XxButton>
				<XxButton
					excludeIcon
					size="sm"
					link="https://www.universaledition.com/Werke/Angelus/P0058207"
					>Publisher&nbsp;&nbsp;<ListMusicOutline class="h4 w-4"></ListMusicOutline></XxButton
				>
			</div>
		</div>

		<div class="flex w-full justify-between">
			<div class="text-xs uppercase tracking-wide text-gray-400">Orchestral</div>
			<div class=" text-xs text-gray-300 md:mt-0">~5 MINS</div>
		</div>

		<div class="grid gap-4 md:grid-cols-2">
			<div class="space-y-1">
				<div>
					<h2 class="text-xs font-semibold">Instrumentation</h2>
					<p class="text-gray-200">
						Flute, Oboe, Clarinet, Bassoon, Horn, Trumpet, Trombone, Tuba, Timpani, Percussion,
						Strings
					</p>
				</div>

				<div>
					<h2 class="text-xs font-semibold">Overview</h2>
					<p class="space-y-1 text-gray-200">
						Angelus is a radiant, slow-building orchestral work inspired by the traditional Catholic
						prayer ritual that marks moments of reflection throughout the day. In this piece,
						Borisova-Ollas creates a sonic icon: a musical space for listening, stillness, and
						contemplation.
					</p>
					<p class="mt-1">
						Rather than dramatic gesture, the power of Angelus lies in accumulated resonance — in
						the shimmer of strings and celesta, in the tolling of bells, and in the breath-like
						pacing of its structure. It unfolds like a prayer or a ritual, inviting the listener to
						pause and enter a shared space of spiritual or emotional depth.
					</p>
					<p class="mt-1">
						Premiered by the Royal Stockholm Philharmonic, Angelus has become one of
						Borisova-Ollas’s most frequently performed orchestral works — a testament to its quiet
						magnetism and universal resonance.
					</p>
				</div>
			</div>

			<div class="space-y-2">
				<div>
					<h2 class="text-xs font-semibold">Thematic Fit</h2>
					<p class="mt-0">
						Ideal for themes of Divine Inspiration, Timelessness, or Contemplative States
					</p>

					<p class="mt-0">Offers contrast in programs focused on ritual, memory, or sacred sound</p>

					<p class="mt-0">Beautifully bridges spiritual traditions and modern orchestral writing</p>
				</div>
				<div>
					<h2 class="text-xs font-semibold">Musical Style</h2>
					<p>Slowly evolving harmonic textures</p>

					<p>Bell-like motifs and suspended time</p>

					<p>Gentle, layered orchestration with moments of glowing intensity</p>

					<p>Echoes of Messiaen and Pärt, but with Borisova-Ollas’s distinct mystical clarity</p>
				</div>

				<div>
					<h2 class="text-xs font-semibold">Programming Suggestions</h2>
					<p>
						Pair with works by Saariaho, Takemitsu, or Arvo Pärt for a program on sacred stillness
					</p>
					<p>
						Use as a moment of reflection or emotional grounding within a larger, more dynamic
						program
					</p>
					<p>
						Ideal for orchestras seeking contemporary repertoire with spiritual weight and audience
						accessibility
					</p>
				</div>
			</div>
		</div>
	</div>
</Drawer>
