<script lang="ts">
	import { goto } from '$app/navigation';
	import { ButtonSizes } from '$lib/types.js';
	let {
		link = '#',
		label = '',
		action = () => {},
		color = 'white',
		excludeIcon = false,
		size = ButtonSizes.md,
		children = null
	} = $props();

	// All rest props
</script>

<div>
	<button
		onclick={() => {
			console.log('li', link);
			if (link && link != '#') {
				goto(link);
			}
			action();
		}}
		class="flex items-center justify-center gap-1 rounded-full border-[1px] border-solid border-black font-light uppercase {size ===
		ButtonSizes.sm
			? ''
			: 'shadow-[0_2px_0_0_rgba(156,163,175)]'} bg-{color ?? 'white'} {size === ButtonSizes.sm
			? 'px-2 py-2 text-xs'
			: size === ButtonSizes.md
				? 'px-4 py-2 text-xs'
				: size === ButtonSizes.lg
					? 'text-md px-6 py-3'
					: 'px-8 py-4'} align-middle text-black"
	>
		{#if label}
			{label}
		{/if}
		{#if children}
			{@render children?.()}
		{/if}
		{#if !excludeIcon}
			<svg
				width="16"
				height="16"
				viewBox="0 0 19 19"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				class="-mt-1 inline-block"
			>
				<path
					d="M17.1025 0.601074H2.10254C1.70471 0.601074 1.32318 0.759109 1.04188 1.04041C0.760574 1.32172 0.602539 1.70325 0.602539 2.10107V17.1011C0.602539 17.4989 0.760574 17.8804 1.04188 18.1617C1.32318 18.443 1.70471 18.6011 2.10254 18.6011H17.1025C17.5004 18.6011 17.8819 18.443 18.1632 18.1617C18.4445 17.8804 18.6025 17.4989 18.6025 17.1011V2.10107C18.6025 1.70325 18.4445 1.32172 18.1632 1.04041C17.8819 0.759109 17.5004 0.601074 17.1025 0.601074ZM17.1025 17.1011H2.10254V2.10107H17.1025V17.1011ZM6.07191 7.1317C5.93118 6.99097 5.85212 6.8001 5.85212 6.60107C5.85212 6.40205 5.93118 6.21118 6.07191 6.07045C6.21264 5.92972 6.40352 5.85066 6.60254 5.85066C6.80156 5.85066 6.99243 5.92972 7.13316 6.07045L11.8525 10.7908V8.10107C11.8525 7.90216 11.9316 7.7114 12.0722 7.57074C12.2129 7.43009 12.4036 7.35107 12.6025 7.35107C12.8015 7.35107 12.9922 7.43009 13.1329 7.57074C13.2735 7.7114 13.3525 7.90216 13.3525 8.10107V12.6011C13.3525 12.8 13.2735 12.9908 13.1329 13.1314C12.9922 13.2721 12.8015 13.3511 12.6025 13.3511H8.10254C7.90363 13.3511 7.71286 13.2721 7.57221 13.1314C7.43156 12.9908 7.35254 12.8 7.35254 12.6011C7.35254 12.4022 7.43156 12.2114 7.57221 12.0707C7.71286 11.9301 7.90363 11.8511 8.10254 11.8511H10.7922L6.07191 7.1317Z"
					fill="black"
				/>
			</svg>
		{/if}
	</button>
</div>
