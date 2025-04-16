<script lang="ts">
	export let isWideScreen = false;
</script>

<div class="flex h-full w-full flex-col overflow-hidden md:flex-row">
	<div class="relative h-full w-full p-4 md:w-1/2">
		<slot name="main" />
	</div>

	{#if isWideScreen}
		<div
			class="flex w-full items-center justify-center border-t border-gray-200 bg-gray-50 p-4 md:w-1/2 md:border-l md:border-t-0"
		>
			<slot name="side" />
		</div>
	{/if}
</div>
