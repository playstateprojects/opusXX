<script lang="ts">
  export let image: string;
  export let title: string;
  export let subtitle: string;
  export let duration?: string;
  export let description?: string;
  export let tags?: string[] = [];
  export let publisherLink?: string;
</script>

<div class="flex w-full max-w-md overflow-hidden rounded-xl bg-black p-4 text-white shadow-lg">
	<img src={image} alt={title} class="mr-4 h-24 w-20 rounded-md object-cover" />
	<div class="flex-1">
		<div class="text-xs uppercase tracking-widest text-gray-300">{subtitle}</div>
		<div class="text-xl font-semibold">{title}</div>
		{#if duration}
			<div class="mt-1 text-sm text-gray-400">~{duration}</div>
		{/if}
		{#if description}
			<div class="mt-2 text-sm">{description}</div>
		{/if}

		{#if tags?.length}
			<div class="mt-2 flex flex-wrap gap-1 text-xs text-gray-400">
				{#each tags as tag}
					<span class="rounded bg-gray-800 px-2 py-0.5">{tag}</span>
				{/each}
			</div>
		{/if}

		<div class="mt-4 flex gap-2">
			<button class="rounded bg-gray-700 px-3 py-1 text-xs hover:bg-gray-600">Save</button>
			{#if publisherLink}
				<a
					href={publisherLink}
					target="_blank"
					class="rounded bg-white px-3 py-1 text-xs text-black hover:bg-gray-200">Publisher 🎵</a
				>
			{/if}
		</div>
	</div>
</div>
