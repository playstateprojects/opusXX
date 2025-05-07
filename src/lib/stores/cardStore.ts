import type { WorkCard, Work } from '$lib/zodDefinitions.js';
import { writable } from 'svelte/store';

export const maxCards = 5; // set your max limit here
export const cardStore = writable<WorkCard[]>([]);
export const workDetail = writable<Work | null>(null);

export function addCard(card: WorkCard) {
    cardStore.update(cards => {
        const newCards = [...cards, card];
        return newCards.length > maxCards ? newCards.slice(1) : newCards;
    });
}

export function clearError() {
    cardStore.set([]);
}
