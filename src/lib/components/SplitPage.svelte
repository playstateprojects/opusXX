<script lang="ts">
	import XxWorkDetail from './cards/XXWorkDetail.svelte';

	export let isWideScreen = false;
</script>

<div class="relative flex h-full w-full flex-grow-0 flex-col overflow-hidden md:flex-row">
	<div class="relative h-full w-full flex-grow-0 p-4 md:w-1/2">
		<slot name="main" />
	</div>

	{#if isWideScreen}
		<div class="relative flex w-full items-center justify-center p-4 md:w-1/2">
			<slot name="side" />
		</div>
	{/if}
</div>
