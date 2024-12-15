<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { isSignInWithEmailLink, signInWithEmailLink, updatePassword } from 'firebase/auth';
	import { auth } from '$lib/stores/authStore';
	import { get } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { Button, Card, Input, Label } from 'flowbite-svelte';

	async function completeSignIn() {
		if (browser && isSignInWithEmailLink(auth, get(page).url.href)) {
			let email = window.localStorage.getItem('emailForSignIn');
			console.log('here');
			if (!email) {
				// If missing email, prompt user for it
				email = window.prompt('Please provide your email for confirmation');
			}
			try {
				const result = await signInWithEmailLink(auth, email as string, get(page).url.href);
				window.localStorage.removeItem('emailForSignIn');
				console.log('Successfully signed in with email link!', result.user);
				// goto('/beehomes');
				// Redirect or update UI as needed
			} catch (error) {
				console.error('Error signing in with email link', error);
				// Handle error, maybe show an error message to the user
			}
		}
	}

	onMount(() => {
		completeSignIn();
	});
</script>

<Card>
	<h3>Welcome back.</h3>
	<Label for="password">Password</Label>
	<Input id="password" type="password" placeholder="password" />
	<Button type="submit">Submit</Button>
</Card>
