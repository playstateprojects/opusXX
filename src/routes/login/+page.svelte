<script lang="ts">
	import { Button, Label, Input, Card } from 'flowbite-svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let email = '';
	let password = '';
	let loading = false;
	const supabase = $page.data.supabase;

	async function handleSignIn() {
		if (!supabase) return;
		try {
			loading = true;
			const {
				data: { user },
				error
			} = await supabase.auth.signInWithPassword({
				email,
				password
			});
			if (error) throw error;
			goto('/demo');
		} catch (error) {
			if (error instanceof Error) {
				alert(error.message);
			}
		} finally {
			loading = false;
		}
	}

	async function handleSignUp() {
		if (!supabase) return;
		try {
			loading = true;
			const { error } = await supabase.auth.signUp({
				email,
				password
			});
			if (error) throw error;
			alert('Check your email for the confirmation link!');
		} catch (error: any) {
			alert(error.message ?? 'an error occured');
		} finally {
			loading = false;
		}
	}

	async function handleGoogleSignIn() {
		if (!supabase) return;
		const { error } = await supabase.auth.signInWithOAuth({
			provider: 'google'
		});
		if (error) alert(error.message);
	}
</script>

<div class="flex min-h-screen items-center justify-center">
	<Card class="w-full max-w-md space-y-6 p-6">
		<h3 class="text-center text-xl font-medium text-gray-900 dark:text-white">
			Sign in to your account
		</h3>

		<form on:submit|preventDefault={handleSignIn} class="space-y-4">
			<div>
				<Label for="email" class="mb-2">Email</Label>
				<Input type="email" id="email" placeholder="name@company.com" bind:value={email} required />
			</div>

			<div>
				<Label for="password" class="mb-2">Password</Label>
				<Input
					type="password"
					id="password"
					placeholder="••••••••"
					bind:value={password}
					required
				/>
			</div>

			<Button type="submit" class="w-full" disabled={loading}>
				{loading ? 'Loading...' : 'Sign in to your account'}
			</Button>
		</form>

		<div class="space-y-3">
			<Button color="alternative" class="w-full" on:click={handleGoogleSignIn}>
				<svg
					class="mr-2 h-4 w-4"
					viewBox="0 0 21 20"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<g clip-path="url(#clip0_13183_10121)"
						><path
							d="M20.3081 10.2303C20.3081 9.55056 20.253 8.86711 20.1354 8.19836H10.7031V12.0492H16.1046C15.8804 13.2911 15.1602 14.3898 14.1057 15.0879V17.5866H17.3282C19.2205 15.8449 20.3081 13.2728 20.3081 10.2303Z"
							fill="#3F83F8"
						/><path
							d="M10.7019 20.0006C13.3989 20.0006 15.6734 19.1151 17.3306 17.5865L14.1081 15.0879C13.2115 15.6979 12.0541 16.0433 10.7056 16.0433C8.09669 16.0433 5.88468 14.2832 5.091 11.9169H1.76562V14.4927C3.46322 17.8695 6.92087 20.0006 10.7019 20.0006V20.0006Z"
							fill="#34A853"
						/><path
							d="M5.08857 11.9169C4.66969 10.6749 4.66969 9.33008 5.08857 8.08811V5.51233H1.76688C0.348541 8.33798 0.348541 11.667 1.76688 14.4927L5.08857 11.9169V11.9169Z"
							fill="#FBBC04"
						/><path
							d="M10.7019 3.95805C12.1276 3.936 13.5055 4.47247 14.538 5.45722L17.393 2.60218C15.5852 0.904587 13.1858 -0.0287217 10.7019 0.000673888C6.92087 0.000673888 3.46322 2.13185 1.76562 5.51234L5.08732 8.08813C5.87733 5.71811 8.09302 3.95805 10.7019 3.95805V3.95805Z"
							fill="#EA4335"
						/></g
					><defs
						><clipPath id="clip0_13183_10121"
							><rect width="20" height="20" fill="white" transform="translate(0.5)" /></clipPath
						></defs
					>
				</svg>
				Sign in with Google
			</Button>

			<Button color="alternative" class="w-full" on:click={handleSignUp}>Create an account</Button>
		</div>
	</Card>
</div>
