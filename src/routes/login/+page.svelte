<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { goto } from '$app/navigation';

	let email = '';
	let password = '';
	export let data;
	let loading = false;
	const { supabase } = data;

	async function handleSignIn() {
		try {
			loading = true;
			const { error } = await supabase?.auth.signInWithPassword({
				email,
				password
			});
			if (error) throw error;
			goto('/dashboard');
		} catch (error) {
			alert(error.message);
		} finally {
			loading = false;
		}
	}

	async function handleSignUp() {
		try {
			loading = true;
			const { error } = await data.supabase.auth.signUp({
				email,
				password
			});
			if (error) throw error;
			alert('Check your email for the confirmation link!');
		} catch (error) {
			alert(error.message);
		} finally {
			loading = false;
		}
	}

	async function handleGoogleSignIn() {
		const { error } = await data.supabase.auth.signInWithOAuth({
			provider: 'google'
		});
		if (error) alert(error.message);
	}
</script>

<div class="auth-container">
	<form on:submit|preventDefault={handleSignIn}>
		<input type="email" placeholder="Email" bind:value={email} />
		<input type="password" placeholder="Password" bind:value={password} />
		<button type="submit" disabled={loading}>
			{loading ? 'Loading...' : 'Sign In'}
		</button>
	</form>

	<button on:click={handleGoogleSignIn}> Sign In with Google </button>

	<button on:click={handleSignUp}> Sign Up </button>
</div>
