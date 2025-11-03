<script lang="ts">
	import { browser } from '$app/environment';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount, setContext } from 'svelte';
	import type { LayoutData } from './$type';
	import '../app.css';
	import XXHeader from '$lib/components/XXHeader.svelte';
	import SpotlightCard from '$lib/components/cards/SpotlightCard.svelte';
	import SplitPage from '$lib/components/SplitPage.svelte';
	import { writable } from 'svelte/store';
	import { cardStore } from '$lib/stores/cardStore'; // adjust path if needed
	import XxWorkCard from '$lib/components/cards/XXWorkCard.svelte';
	import XxWorkDetail from '$lib/components/cards/XXWorkDetail.svelte';
	import XxComposerDetail from '$lib/components/cards/XXComposerDetail.svelte';
	import ColourLoader from '$lib/components/ColourLoader.svelte';
	import XxSpotlightCards from '$lib/components/XXSpotlightCards.svelte';
	import XXModal from '$lib/components/XXModal.svelte';

	$: isAboutPage = $page.url.pathname === '/about';

	const isWideScreen = writable(false);
	setContext('isWideScreen', isWideScreen);

	export let data: LayoutData;
	$: ({ supabase, session } = data);

	onMount(() => {
		if (!supabase || !browser) return;

		const mediaQuery = window.matchMedia('(min-width: 768px)');

		function updateMatch(e: MediaQueryListEvent | MediaQueryList) {
			isWideScreen.set(e.matches);
		}

		updateMatch(mediaQuery);
		mediaQuery.addEventListener('change', updateMatch);

		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => {
			subscription.unsubscribe();
			mediaQuery.removeEventListener('change', updateMatch);
		};
	});
</script>

<div
	class="bg-gradient flex h-screen w-screen flex-col overflow-hidden bg-gradient-to-b from-white via-white via-15% to-gray-300"
>
	<XXHeader />
	<div class="flex-grow overflow-auto">
		<SplitPage isWideScreen={true}>
			<svelte:fragment slot="main">
				<slot />
			</svelte:fragment>

			<svelte:fragment slot="side">
				{#if isAboutPage}
					<div class="h-full w-full overflow-hidden">
						<img
							src="https://imagedelivery.net/5mdpBKEVK9RVERfzVJ-NHg/ddd98447-594d-45b0-a074-883f30d97c00/public"
							alt="Opus XX"
							class="h-full w-full object-cover"
						/>
					</div>
				{:else if $cardStore.length > 0}
					<div class="flex h-full w-full flex-col justify-center overflow-hidden p-2">
						<div class="flex gap-4 overflow-x-auto">
							{#each $cardStore as card}
								<div class="w-80 flex-shrink-0 snap-center">
									<XxWorkCard workCard={card}>
										<div class="mx-2 p-4 text-center font-semibold"></div>
									</XxWorkCard>
								</div>
							{/each}
						</div>
					</div>
				{:else}
					<div class="flex h-full w-full flex-grow justify-center px-10">
						<XxSpotlightCards />
					</div>
				{/if}
				<XxWorkDetail />
				<XxComposerDetail />
			</svelte:fragment>
		</SplitPage>
		<div
			class="bg-acid-500 bg-period-baroque bg-period-early_romantic bg-period-late_romantic"
		></div>
	</div>
</div>
<ColourLoader />
<XXModal />
