<script lang="ts">
	import { Input, Label, Button } from 'flowbite-svelte';
	import {
		sendSignInLinkToEmail,
		signInWithEmailAndPassword,
		signInWithPopup,
		GoogleAuthProvider,
		FacebookAuthProvider
	} from 'firebase/auth';
	import { auth } from '$lib/stores/authStore';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';
	import EmailLinkSent from './email-link-sent.svelte';
	import { setError } from '$lib/stores/errorStore';
	import { goto } from '$app/navigation';

	let email = '';
	let password = '';
	let emailSent = false;
	let showPassword = false;

	async function handleEmailPasswordLogin() {
		try {
			const userCredential = await signInWithEmailAndPassword(auth, email, password);
			console.log('User logged in:', userCredential.user);
			goto('/beehomes');
		} catch (error) {
			console.error('Error logging in:', error);
			setError('Failed to log in. Please check your email and password.');
		}
	}

	async function handleMagicLinkLogin() {
		try {
			const currentUrl = get(page).url;
			const continueUrl = `${currentUrl.origin}/loginverify`;
			const actionCodeSettings = {
				url: continueUrl,
				handleCodeInApp: true
			};

			await sendSignInLinkToEmail(auth, email, actionCodeSettings);

			localStorage.setItem('emailForSignIn', email);
			emailSent = true;
		} catch (error) {
			console.error('Error sending magic link:', error);
			setError('Error sending magic link');
		}
	}

	async function handleGoogleLogin() {
		try {
			const provider = new GoogleAuthProvider();
			const result = await signInWithPopup(auth, provider);
			console.log('User logged in with Google:', result.user);
			goto('/beehomes');
		} catch (error) {
			console.error('Error logging in with Google:', error);
			setError('Failed to log in with Google. Please try again.');
		}
	}
	function togglePasswordVisibility() {
		showPassword = !showPassword;
	}

	async function handleFacebookLogin() {
		try {
			const provider = new FacebookAuthProvider();
			const result = await signInWithPopup(auth, provider);
			console.log('User logged in with Facebook:', result.user);
			goto('/beehomes');
		} catch (error) {
			console.error('Error logging in with Facebook:', error);
			setError('Failed to log in with Facebook. Please try again.');
		}
	}
</script>

{#if !emailSent}
	<div>
		<h2 class="mb-6 text-center text-2xl font-bold">Login</h2>
		<p>
			Login or <a href="/waitlist" class="text-blue-600">signup</a> to join the waitlist.
		</p>
		<form on:submit|preventDefault={handleEmailPasswordLogin} class="mt-4 space-y-4">
			<Label for="large-input" class="mb-2 block">Email</Label>
			<Input
				id="large-input"
				size="lg"
				type="email"
				placeholder="Email"
				bind:value={email}
				required
			/>
			<Label for="large-input" class="mb-2 block">Password</Label>
			<Input
				id="large-input"
				size="lg"
				type="password"
				placeholder="Password"
				bind:value={password}
				required
			/>

			<!-- <IconButton
					class="absolute right-2 top-1/2 -translate-y-1/2 transform"
					on:click={togglePasswordVisibility}
					title={showPassword ? 'Hide password' : 'Show password'}
				>
					{#if showPassword}
						<Icon tag="svg" viewBox="0 0 24 24" class="text-gray-700">
							<path fill="currentColor" d={mdiEyeClosed} />
						</Icon>
					{:else}
						<Icon tag="svg" viewBox="0 0 24 24" class="text-gray-700">
							<path fill="currentColor" d={mdiEyeOutline} />
						</Icon>
					{/if}
				</IconButton> -->

			<a href="/passwordreset" class="mt-2 block text-sm text-blue-600 hover:underline"
				>Reset or change your password</a
			>
			<Button type="submit" variant="raised" color="primary" class="w-full rounded-full"
				>Login</Button
			>
		</form>

		<!-- <div class="my-4">
			<Button on:click={handleMagicLinkLogin} variant="raised" color="secondary" class="w-full">
				Send Magic Link
			</Button>
		</div> -->
		<!-- <Divider>OR</Divider> -->

		<!-- <div class="item-center flex justify-center">
			<IconButton on:click={handleGoogleLogin}>
				<Icon tag="svg" viewBox="0 0 24 24" class="text-black">
					<path fill="currentColor" d={mdiGoogle} />
				</Icon>
			</IconButton>
			<IconButton on:click={handleFacebookLogin}>
				<Icon tag="svg" viewBox="0 0 24 24" class="text-black">
					<path fill="currentColor" d={mdiFacebook} />
				</Icon>
			</IconButton>
		</div> -->
	</div>
{:else}
	<EmailLinkSent {email} />
{/if}

<style lang="postcss">
	:global(.mdc-tab__text-label) {
		@apply text-sm;
	}
</style>
