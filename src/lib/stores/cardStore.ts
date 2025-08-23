import type { WorkCardType, Work } from "$lib/types.js";
import { writable } from 'svelte/store';

export const maxCards = 15; // set your max limit here
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

export function updateCardInsight(workId: string | number | undefined, insight: string) {
    cardStore.update(cards => {
        return cards.map(card => {
            if (card.work.id === workId || card.work.name === workId?.toString()) {
                return { ...card, insight };
            }
            return card;
        });
    });
}
