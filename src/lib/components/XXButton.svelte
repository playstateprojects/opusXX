<script lang="ts">
	import MoreIcon from '$lib/icons/ArrowSquareDownRight.svg?component';
	let { link } = $props<{ link?: string }>();
</script>

<a href={link} class="rounded-full bg-white"> more <MoreIcon /></a>
