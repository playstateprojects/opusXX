<script lang="ts">
	import SplitPage from '$lib/components/SplitPage.svelte';
	import SpotlightCard from '$lib/components/SpotlightCard.svelte';
	import XxButton from '$lib/components/XXButton.svelte';
</script>

<div class="flex h-full w-full flex-col items-center justify-center p-16">
	<h1 class="text-center text-3xl font-extrabold">
		Inspire Audiences.<br />Lead The Way.<br />Unlock New Opportunities.
	</h1>
	<p class="mt-4 text-center">
		Discover repertoire by female composers that fits your ensemble, theme, and artistic goals—plus
		the resources to programme it with confidence.
	</p>
	<p class="mt-4 text-center font-bold">
		I’ll help you shape bold, audience-ready programmes that leave a lasting impression.
	</p>
	<XxButton
		excludeIcon={true}
		color="acid-500"
		label="Start Curating"
		class="mt-4"
		link="/capture"
	/>
</div>
