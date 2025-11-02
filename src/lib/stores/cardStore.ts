import type { WorkCardType, Work, Composer } from "$lib/types.js";
import { writable } from 'svelte/store';

export const maxCards = 30; // Increased to support incremental searches (multiple periods/composers)
export const cardStore = writable<WorkCardType[]>([]);
export const workDetail = writable<Work | null>(null);
export const composerDetail = writable<Composer | null>(null);

export function addCard(card: WorkCardType) {
    cardStore.update(cards => {
        // Check if card with this work.id already exists
        const isDuplicate = cards.some(existingCard => existingCard.work.id === card.work.id);
        if (isDuplicate) {
            return cards;
        }

        const newCards = [card, ...cards];
        // Keep the newest cards (at the beginning) if we exceed maxCards
        return newCards.length > maxCards ? newCards.slice(0, maxCards) : newCards;
    });
}

export function clearError() {
    cardStore.set([]);
}

export function filterRelevantCards() {
    cardStore.update(cards => {
        const newCards = [...cards.filter(card => { return card.relevance && card.relevance > 3 })];
        // Keep the newest/highest relevance cards if we exceed maxCards
        return newCards.length > maxCards ? newCards.slice(0, maxCards) : newCards;
    });
}
export function updateCardInsight(workId: string | number | undefined, insight: string, relevance: number) {
    cardStore.update(cards => {
        const updatedCards = cards.map(card => {

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
