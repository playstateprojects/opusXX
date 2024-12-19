<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { LayoutData } from './$types';
	import '../app.css';
	import XXHeader from '$lib/components/XXHeader.svelte';

	export let data: LayoutData;

	$: ({ supabase, session } = data);

	onMount(() => {
		if (!supabase) return;
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => subscription.unsubscribe();
	});
</script>

<div class="flex h-full w-full flex-col items-center justify-center overflow-hidden">
	<XXHeader></XXHeader>
	<div class="h-full w-full overflow-hidden">
		<slot></slot>
	</div>
</div>
