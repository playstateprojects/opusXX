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

	let transitionParamsRight = {
		x: 320,
		duration: 200,
		easing: sineIn
	};
</script>

<Drawer
	class=" m-4 rounded-3xl bg-black p-0"
	width="w-1/2"
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
				<XxButton excludeIcon size="sm"><ShareAllOutline class="h-5 w-5" /></XxButton>
				<XxButton excludeIcon size="sm"
					>Publisher <ListMusicOutline class="h4 w-4"></ListMusicOutline></XxButton
				>
			</div>
		</div>

		<div class="flex w-full justify-between">
			<div class="text-xs uppercase tracking-wide text-gray-400">Orchestral</div>
			<div class=" text-xs text-gray-300 md:mt-0">~5 MINS</div>
		</div>

		<div class="grid gap-4 md:grid-cols-2">
			<div class="space-y-4">
				<div>
					<h2 class="text-xs font-semibold">Instrumentation Summary</h2>
					<p class="text-gray-200">
						Flute, Oboe, Clarinet, Bassoon, Horn, Trumpet, Trombone, Tuba, Timpani, Percussion,
						Strings
					</p>
				</div>

				<div>
					<h2 class="text-sm font-semibold">Mood and Style</h2>
					<p class="text-gray-200">Lush · Passionate · Dreamlike</p>
				</div>

				<div>
					<h2 class="text-xs font-semibold">Overview</h2>
					<p class="space-y-1 text-gray-200">
						The work opens with a hushed, dreamy atmosphere and gradually blossoms into a lush,
						romantic soundscape. Sweeping string lines and warm winds build emotional intensity,
						creating a flowing arc of desire and surrender. Holmès' orchestration is rich yet never
						overwhelming, showcasing her gift for balancing harmonic color with emotional pacing.
					</p>
					<p class="mt-1 text-gray-200">
						Despite its brevity, the piece creates a world unto itself — tender, expansive, and
						evocative of late-night introspection or longing. It’s perfect as a standalone
						interlude, a prelude to a larger Romantic work, or a moment of calm between more intense
						program segments.
					</p>
				</div>
			</div>

			<div class="space-y-2">
				<div>
					<h2 class="text-xs font-semibold">Why Program This Work?</h2>
					<ul class="list-inside list-disc space-y-1 text-gray-200">
						<li>
							<strong>Elegant and accessible:</strong> A short, lyrical piece that offers breathing space
							in a program — without sacrificing depth or craftsmanship.
						</li>
						<li>
							<strong>Female Romantic voice:</strong> Holmès was one of the few women of her time writing
							for large orchestra with this level of command.
						</li>
						<li>
							<strong>Emotional movement:</strong> The piece subtly reflects change — from stillness
							to emotional bloom — making it a gentle fit for themes like transformation, longing, or
							intimacy.
						</li>
					</ul>
				</div>

				<div>
					<h2 class="text-xs font-semibold">Programming Ideas</h2>
					<ul class="list-inside list-disc space-y-1 text-gray-200">
						<li>
							Pair with Wagner’s <em>Siegfried Idyll</em> or Debussy’s
							<em>Prélude à l'après-midi d'un faune</em> for a soft-focus Romantic/Impressionist arc
						</li>
						<li>
							Combine with a contemporary work exploring intimacy or stillness for historical
							contrast
						</li>
						<li>
							Use as a moment of still beauty in a more dramatic or politically charged program
						</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</Drawer>
