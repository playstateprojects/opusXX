<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	const { user, supabase } = data;

	async function handleSignOut() {
		if (!supabase) return;
		const { error } = await supabase.auth.signOut();
		if (error) alert(error.message);
	}
</script>

<div>
	<h1>Welcome {user.email}</h1>
	<button on:click={handleSignOut}>Sign Out</button>
</div>
