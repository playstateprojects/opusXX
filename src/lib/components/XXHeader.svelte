<script lang="ts">
	import {
		Navbar,
		NavBrand,
		NavLi,
		NavUl,
		NavHamburger,
		Avatar,
		Dropdown,
		DropdownItem,
		DropdownHeader,
		DropdownDivider
	} from 'flowbite-svelte';
	import { user } from '$lib/stores/userStore';
	import { get } from 'svelte/store';
	import { onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { supabaseStore } from '$lib/stores/supabaseStore';
	let unsubscribe: () => void;
	let supabaseUnsubscribe: () => void;

	unsubscribe = user.subscribe((currentUser) => {
		console.log('Current user:', currentUser);
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
		supabaseUnsubscribe?.();
	});
</script>

<Navbar>
	<NavBrand href="/">
		<img src="/images/xxgenerator.webp" class="me-3 h-6 sm:h-9" alt="Flowbite Logo" />
		<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">OpusXX</span>
	</NavBrand>
	<div class="flex items-center md:order-2">
		<Avatar id="avatar-menu" src="/images/xxgenerator.webp" />
		<NavHamburger class="w-full md:order-1 md:flex md:w-auto" />
	</div>
	<Dropdown placement="bottom" triggeredBy="#avatar-menu">
		{#if $user}
			<DropdownHeader>
				<span class="block text-sm">{$user?.email}</span>
			</DropdownHeader>
			<DropdownItem>Settings</DropdownItem>
			<DropdownDivider />
			<DropdownItem on:click={handleSignOut}>Sign out</DropdownItem>
		{:else}
			<DropdownItem href="login">Sign in</DropdownItem>
		{/if}
	</Dropdown>
	<NavUl>
		<NavLi href="/about">About</NavLi>
		<NavLi href="/contact">Contact</NavLi>
	</NavUl>
</Navbar>
