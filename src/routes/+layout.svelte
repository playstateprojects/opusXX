<script lang="ts">
	import { browser } from '$app/environment';
	import { invalidate } from '$app/navigation';
	import { onMount, setContext } from 'svelte';
	import type { LayoutData } from './$types';
	import '../app.css';
	import XXHeader from '$lib/components/XXHeader.svelte';
	import { writable } from 'svelte/store';
	const isWideScreen = writable(false);
	setContext('isWideScreen', isWideScreen);

	function updateMatch(e: MediaQueryListEvent | MediaQueryList) {
		isWideScreen.set(e.matches);
	}

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
	<div class="flex-grow overflow-auto">
		<slot />
	</div>
</div>
