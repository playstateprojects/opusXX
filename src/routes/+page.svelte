<script lang="ts">
	import SplitPage from '$lib/components/SplitPage.svelte';
	import SpotlightCard from '$lib/components/SpotlightCard.svelte';
</script>

<SplitPage isWideScreen={true}>
	<svelte:fragment slot="main">here's stuff</svelte:fragment>
	<svelte:fragment slot="side">
		<div class="flex h-full w-full flex-grow justify-center p-10">
			<SpotlightCard
				title="Barbara Strozzi"
				image="/images/barbara.jpeg"
				subtitle="1619-1677, Venice"
				description="marked by expressive intensity, daring harmonic choices, and a bold command of text and drama"
			></SpotlightCard>
		</div>
	</svelte:fragment>
</SplitPage>
