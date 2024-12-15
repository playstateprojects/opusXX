<script lang="ts">
	import { handleSignup } from '$lib/stores/authStore';
	import { Button, Input, Label } from 'flowbite-svelte';

	let email = '';
	let password = '';
	let emailSent = false;
	let error = '';

	// const handleSignup = async () => {
	// 	try {
	// 		const currentUrl = get(page).url;
	// 		const continueUrl = `${currentUrl.origin}/loginverify`;
	// 		const actionCodeSettings = {
	// 			url: continueUrl,
	// 			handleCodeInApp: true
	// 		};

	// 		await sendSignInLinkToEmail(auth, email, actionCodeSettings);

	// 		localStorage.setItem('emailForSignIn', email);
	// 		emailSent = true;
	// 	} catch (error) {
	// 		console.error('Error sending magic link:', error);
	// 		setError('Error sending magic link');
	// 	}
	// };

	async function onSubmit(e: Event) {
		e.preventDefault();
		try {
			await handleSignup(email);
			emailSent = true;
		} catch (err: any) {
			error = err.message || 'An error occurred';
		}
	}
</script>

{#if emailSent}
	<p>Check your email for a magic link to verify your account!</p>
{:else}
	<form on:submit={onSubmit} class="mt-4 flex flex-col space-y-4">
		<Label for="email" class="mb-2 block">Email</Label>
		<Input type="email" size="lg" bind:value={email} placeholder="Enter your email" required />

		<Button type="submit">Sign up</Button>
	</form>
{/if}

{#if error}
	<p class="error">{error}</p>
{/if}
