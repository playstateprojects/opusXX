<script lang="ts">
	import { modalStore, closeModal } from '$lib/stores/modalStore.js';

	$: modal = $modalStore;

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			closeModal();
		}
	}
</script>

{#if modal.isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
		on:click={handleBackdropClick}
		on:keydown={(e) => e.key === 'Escape' && closeModal()}
	>
		<div
			class="mx-4 max-w-md rounded-lg border-2 border-black bg-white p-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
		>
			{#if modal.title}
				<h2 id="modal-title" class="mb-4 text-lg font-bold uppercase text-black">
					{modal.title}
				</h2>
			{/if}
			
			{#if modal.message}
				<p class="mb-6 text-black">
					{modal.message}
				</p>
			{/if}

			<div class="flex justify-center">
				<button
					on:click={closeModal}
					class="flex items-center justify-center gap-1 rounded-full border-[1px] border-solid border-black bg-white px-6 py-2 text-xs font-light uppercase text-black shadow-[0_2px_0_0_rgba(156,163,175)]"
				>
					Close
				</button>
			</div>
		</div>
	</div>
{/if}