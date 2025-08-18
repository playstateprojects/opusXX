import type { WorkCardType, Work } from "$lib/types.js";
import { writable } from 'svelte/store';

export const maxCards = 5; // set your max limit here
export const cardStore = writable<WorkCardType[]>([]);
export const workDetail = writable<Work | null>(null);

export function addCard(card: WorkCardType) {
    cardStore.update(cards => {
        const newCards = [...cards, card];
        return newCards.length > maxCards ? newCards.slice(1) : newCards;
    });
}

export function clearError() {
    cardStore.set([]);
}
