<script lang="ts">
	import {
		Navbar,
		NavBrand,
		NavLi,
		NavUl,
		Avatar,
		Dropdown,
		DropdownItem,
		DropdownHeader,
		DropdownDivider,
		Button
	} from 'flowbite-svelte';
	import { user } from '$lib/stores/userStore';
	import { get } from 'svelte/store';
	import { onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { supabaseStore } from '$lib/stores/supabaseStore';
	let unsubscribe: () => void;
	let supabaseUnsubscribe: () => void;

	unsubscribe = user.subscribe((currentUser) => {
		// console.log('Current user:', currentUser);
	});

	async function handleSignOut() {
		const $supabase = get(supabaseStore);
		if (!$supabase) return;
		const { error } = await $supabase.auth.signOut();
		if (error) alert(error.message);
		goto('/login');
	}

	onDestroy(() => {
		unsubscribe?.();
	});
</script>

<Navbar>
	<NavBrand href="/">
		<img src="/images/logo.png" class="me-3 w-[140px]" alt="Flowbite Logo" />
	</NavBrand>
	<div class="flex items-center md:order-2">
		{#if $user}
			<Avatar id="avatar-menu" size="xs" />
		{:else}
			<Button href="/login">LOGIN</Button>
		{/if}
	</div>

	{#if $user}
		<Dropdown placement="bottom" triggeredBy="#avatar-menu">
			<DropdownHeader>
				<span class="block text-sm">{$user?.email}</span>
			</DropdownHeader>
			<DropdownItem>Settings</DropdownItem>
			<DropdownDivider />
			<DropdownItem on:click={handleSignOut}>Sign out</DropdownItem>
		</Dropdown>
	{/if}
	<NavUl class="ml-auto">
		<NavLi href="/about" class="uppercase">About</NavLi>
		<NavLi href="/faq" class="uppercase">FAQ</NavLi>
		<NavLi href="/contact" class="uppercase">Contact</NavLi>
	</NavUl>
</Navbar>
