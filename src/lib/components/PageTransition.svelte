<script lang="ts">
	import { browser } from '$app/environment';
	import { invalidate } from '$app/navigation';
	import { onMount, setContext } from 'svelte';
	import type { LayoutData } from './$types';
	import '../app.css';
	import XXHeader from '$lib/components/XXHeader.svelte';
	import { writable } from 'svelte/store';
	import SpotlightCard from '$lib/components/SpotlightCard.svelte';
	import SplitPage from '$lib/components/SplitPage.svelte';
	import { page } from '$app/stores';
	import { fade } from 'svelte/transition';

	const isWideScreen = writable(false);
	setContext('isWideScreen', isWideScreen);

	export let data: LayoutData;
	$: ({ supabase, session } = data);

	onMount(() => {
		if (!supabase) return;
		if (!browser) return;

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

<div class="flex h-screen w-screen flex-col overflow-hidden">
	<XXHeader />
	<div class="flex-grow overflow-hidden">
		<SplitPage isWideScreen={$isWideScreen}>
			<svelte:fragment slot="main">
				{#key $page.url.pathname}
					<div in:fade={{ duration: 150, delay: 150 }} out:fade={{ duration: 150 }}>
						<slot />
					</div>
				{/key}
			</svelte:fragment>
			<svelte:fragment slot="side">
				<div class="flex h-full w-full flex-grow justify-center p-10">
					<SpotlightCard
						title="Barbara Strozzi"
						image="/images/barbara.jpeg"
						subtitle="1619-1677, Venice"
						cta={{ link: '/capture', label: 'more' }}
					>
						<div class="mx-2 p-4 text-center font-semibold">
							"marked by expressive intensity, daring harmonic choices, and a bold command of text
							and drama"
						</div>
					</SpotlightCard>
				</div>
			</svelte:fragment>
		</SplitPage>
	</div>
</div>
