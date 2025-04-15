<script lang="ts">
	let { image, title, subtitle, description, actionLink } = $props<{
		image: string;
		title: string;
		subtitle: string;
		description?: string;
		actionLink?: string;
	}>();
</script>

<div class="relative aspect-[calc(9/16)] h-full max-w-md overflow-hidden rounded-3xl shadow-lg">
	<img src={image} alt={title} class="absolute inset-0 h-full w-full object-cover" />

	<div
		class="absolute flex w-full flex-col items-center justify-center bg-gradient-to-t from-black/80 to-transparent p-4 text-white"
	>
		<div class="mb-1 flex rounded-full bg-yellow-500 px-2 py-1 text-xs uppercase text-black">
			Publisher Spotlight
		</div>
		<h2 class="text-2xl font-bold leading-tight text-yellow-400">{title}</h2>
		<div class="text-md mt-1">{subtitle}</div>
		{#if description}
			<div class="mt-2 text-sm italic">“{description}”</div>
		{/if}
		{#if actionLink}
			<div class="mt-4">
				<a
					href={listenLink}
					target="_blank"
					class="rounded bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-100"
				>
					Listen ↘
				</a>
			</div>
		{/if}
	</div>
</div>
