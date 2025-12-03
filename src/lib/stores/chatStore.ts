// src/lib/stores/chatStore.ts
import { writable } from 'svelte/store';
import type { AiMessage, AiOption, ChatAction } from '$lib/types';
import { AiRole, AiOptionIcon } from '$lib/types';

export const startMessages: (AiMessage | AiOption[])[] = [
	{
		content: 'Let me help you find the perfect piece to program.',
		role: AiRole.System,
		time: new Date()
	},
	[
		{
			content: 'From a specific time period',
			icon: AiOptionIcon.period,
			predefined: {
				question: 'Which period are you interested in?',
				quickResponses: [
					'Medieval',
					'Renaissance',
					'Baroque',
					'Classical',
					'Romantic',
					'20th Century',
					'Contemporary'
				]
			}
		},
		{
			content: 'For a specific instrumentation',
			icon: AiOptionIcon.drama,
			predefined: {
				question: 'What type of ensemble or instrumentation?',
				quickResponses: ['Chamber music', 'Choral', 'Opera', 'Orchestral', 'Solo', 'Vocal']
			}
		},
		{
			content: 'With a particular atmosphere',
			icon: AiOptionIcon.drama,
			predefined: {
				question: 'What kind of atmosphere are you looking for?',
				quickResponses: [
					'Calm & Meditative',
					'Intense & Driving',
					'Dark & Mysterious',
					'Bright & Uplifting'
				]
			}
		},
		{
			content: 'That matches a programme theme',
			icon: AiOptionIcon.theme,
			predefined: {
				question: "Would any of these themes be interesting to you?",
				quickResponses: [
					'Love',
					'Transcendence',
					'Innocence',
					'Social unrest',
					'World peace',
					'Spiritual awakening',
					'Climate change',
					'Connection'
				]
			}
		}
	]
];

export const messages = writable<(AiMessage | AiOption[])[]>([]);

export const actions = writable<ChatAction[]>([]);

export function resetChat() {
	messages.set([...startMessages]);
	actions.set([]);
}

