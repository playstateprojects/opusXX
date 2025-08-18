<script lang="ts">
	import type { CTA } from "$lib/types.js";
	import XxButton from '$lib/components/XXButton.svelte';

	let { image, title, subtitle, colour, type, cta, date, logo, content, children } = $props<{
		image: string;
		title: string;
		subtitle: string;
		colour: string;
		type: string | undefined;
		cta?: CTA;
		date?: string;
		logo?: string;
		content?: string;
	}>();
</script>

<div class="relative aspect-[0.52] h-full max-w-md overflow-hidden rounded-3xl shadow-lg">
	<img src={image} alt={title} class="absolute inset-0 h-full w-full object-cover" />

	<div class="absolute flex h-full w-full flex-col justify-between p-4 text-white">
		<!-- Top Section -->
		<div class="flex flex-col items-center">
			<div
				class="mb-1 mt-6 rounded-full bg-{colour} px-8 py-1 font-zwo text-xs font-light uppercase text-black"
			>
				{type}
			</div>
			<h2
				class="mt-4 whitespace-pre-line px-6 text-center text-3xl font-bold leading-tight text-white"
			>
				{title}
			</h2>
		</div>

		<!-- Bottom Section -->
		<div class="mb-4 mt-auto w-full text-center">
			<div
				class="mt-1 whitespace-pre-line text-center font-zwo text-2xl font-bold text-{colour} mb-2 px-6"
			>
				{subtitle}
			</div>
			{#if children}
				{@render children()}
			{/if}
			<div class="mb-4 flex flex-col items-center justify-center px-8 font-zwo text-sm font-light">
				<div class="mb-4 text-white">
					{content}
				</div>
				{#if date}
					<h2
						class="mb-4 mt-4 whitespace-pre-line px-6 text-center text-xl font-bold leading-tight text-{colour}"
					>
						{date}
					</h2>
				{/if}
				{#if logo}
					<img src={logo} alt="Staats opper hamburg" class="w-20" />
				{/if}
			</div>

			{#if cta}
				<div class="mt-4 flex items-center justify-center">
					<XxButton link={cta.link} label={cta.label} size="sm"></XxButton>
				</div>
			{/if}
		</div>
	</div>
</div>
