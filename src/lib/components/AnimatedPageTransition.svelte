<script lang="ts">
	import { page } from '$app/stores';
	import { slide } from 'svelte/transition';

	let currentPath = '';
</script>

{#key $page.url.pathname}
	<div
		class="absolute inset-0 h-full w-full"
		in:slide={{ duration: 600 }}
		out:slide={{ duration: 600 }}
	>
		<slot />
	</div>
{/key}
