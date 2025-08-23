import type { WorkCardType, Work } from "$lib/types.js";
import { writable } from 'svelte/store';

export const maxCards = 15; // set your max limit here
export const cardStore = writable<WorkCardType[]>([]);
export const workDetail = writable<Work | null>(null);

export function addCard(card: WorkCardType) {
    cardStore.update(cards => {
        const newCards = [card, ...cards];
        return newCards.length > maxCards ? newCards.slice(1) : newCards;
    });
}

export function clearError() {
    cardStore.set([]);
}

export function updateCardInsight(workId: string | number | undefined, insight: string, relevance: number) {
    cardStore.update(cards => {
        const updatedCards = cards.map(card => {
            console.log(card)
            if (card.work.id == workId || card.work.name == workId?.toString()) {
                return { ...card, insight, relevance };
            }
            return card;
        });

        // Sort cards by relevance score in descending order (highest relevance first)
        return updatedCards.sort((a, b) => {
            const aRelevance = a.relevance || 0;
            const bRelevance = b.relevance || 0;
            return bRelevance - aRelevance;
        });
    });
}
