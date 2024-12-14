import { writable } from 'svelte/store';

export const errorStore = writable<string | null>(null);

export function setError(message: string) {
    errorStore.set(message);
}

export function clearError() {
    errorStore.set(null);
}