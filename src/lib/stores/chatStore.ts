// src/lib/stores/chatStore.ts
import { writable } from 'svelte/store';
import type { AiMessage, AiOption, ChatAction } from '$lib/types.ts';

export const messages = writable<(AiMessage | AiOption[])[]>([]);

export const actions = writable<ChatAction[]>([]);

export function resetChat() {
	messages.set([]);
	actions.set([]);
}

