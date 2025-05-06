// src/lib/stores/chatStore.ts
import { writable } from 'svelte/store';
import type { AiMessage, AiOption, ChatAction } from '$lib/types';
import { AiRole, AiOptionIcon } from '$lib/types';

export const messages = writable<(AiMessage | AiOption[])[]>([]);

export const actions = writable<ChatAction[]>([]);

