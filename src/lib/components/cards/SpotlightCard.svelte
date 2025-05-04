<script lang="ts">
	import type { CTA } from '$lib/types';
	import XxButton from '$lib/components/XXButton.svelte';

	let { image, title, subtitle, description, children, cta } = $props<{
		image: string;
		title: string;
		subtitle: string;
		cta?: CTA;
	}>();
</script>

<div class="relative aspect-[calc(9/16)] h-full max-w-md overflow-hidden rounded-3xl shadow-lg">
	<img src={image} alt={title} class="absolute inset-0 h-full w-full object-cover" />

	<div
		class="absolute flex h-full w-full flex-col justify-between bg-gradient-to-t from-black/80 to-transparent p-4 text-white"
	>
		<!-- Top Section -->
		<div class="flex flex-col items-center">
			<div class="mb-1 rounded-full bg-yellow-500 px-2 py-1 text-xs uppercase text-black">
				Publisher Spotlight
			</div>
			<h2 class="mt-4 text-2xl font-bold leading-tight text-yellow-400">{title}</h2>
			<div class="text-md mt-1">{subtitle}</div>
		</div>

		<!-- Bottom Section -->
		<div class="mb-4 mt-auto w-full text-center">
			{@render children()}

			{#if cta}
				<div class="mt-4">
					<XxButton link={cta.link} label={cta.label} />
				</div>
			{/if}
		</div>
	</div>
</div>
