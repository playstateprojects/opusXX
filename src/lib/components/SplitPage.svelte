<script lang="ts">
	export let isWideScreen = false;
</script>

<div class="absolute inset-0 grid min-h-0 min-w-0 grid-cols-1 overflow-hidden md:grid-cols-2">
	<div class="relative min-h-0 min-w-0 overflow-hidden p-4">
		<div class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
			<slot name="main" />
		</div>
	</div>

	{#if isWideScreen}
		<div class="relative min-h-0 min-w-0 overflow-hidden p-4">
			<div class="flex h-full min-h-0 min-w-0 w-full overflow-hidden">
				<slot name="side" />
			</div>
		</div>
	{/if}
</div>
