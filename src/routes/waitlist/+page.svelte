<script>
	import { onMount } from 'svelte';

	onMount(() => {
		// Load the script after the component is mounted
		const script = document.createElement('script');
		script.src = '/getwaitlist.min.js';
		document.body.appendChild(script);
	});
</script>

<svelte:head>
	<link rel="stylesheet" type="text/css" href="/getwaitlist.min.css" />
</svelte:head>

<div class="flex h-full w-full flex-col items-center justify-center">
	<div id="getWaitlistContainer" data-waitlist_id="26126" data-widget_type="WIDGET_1"></div>
</div>
