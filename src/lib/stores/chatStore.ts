// src/lib/stores/chatStore.ts
import { writable } from 'svelte/store';
import type { AiMessage, AiOption, ChatAction } from '$lib/types';
import { AiRole, AiOptionIcon } from '$lib/types';

export const messages = writable<(AiMessage | AiOption[])[]>([
	{
		content: 'I’ll help you shape bold, audience-ready programmes that leave a lasting impression',
		role: AiRole.System,
		time: new Date()
	}
]);

export const actions = writable<ChatAction[]>([]);

