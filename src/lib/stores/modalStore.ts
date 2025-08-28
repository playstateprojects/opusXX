import { writable } from 'svelte/store';

interface ModalState {
	isOpen: boolean;
	title?: string;
	message?: string;
}

export const modalStore = writable<ModalState>({
	isOpen: false,
	title: undefined,
	message: undefined
});

export function showUnderDevelopmentModal() {
	modalStore.set({
		isOpen: true,
		title: 'Feature Under Development',
		message: 'This feature is under development. Please check back soon!'
	});
}

export function showModal(title: string, message: string) {
	modalStore.set({
		isOpen: true,
		title,
		message
	});
}

export function closeModal() {
	modalStore.set({
		isOpen: false,
		title: undefined,
		message: undefined
	});
}