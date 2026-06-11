import { AiMessage } from '$lib/types';

const extractJSON = (str: string) => {
	// Handle code blocks
	const codeBlockMatch = str.match(/```(?:json)?\n([\s\S]*?)\n```/);
	if (codeBlockMatch) return codeBlockMatch[1];

	// Handle potential wrapped JSON
	const jsonMatch = str.match(/\{[\s\S]*\}/);
	return jsonMatch ? jsonMatch[0] : str;
};

const flattenChat = (log: AiMessage[]): string => {
	return log
		.filter((m) => m.content.trim())
		.map((m) => {
			switch (m.role) {
				case 'user':
					return `User: ${m.content.trim()}`;
				case 'assistant':
					return `Assistant: ${m.content.trim()}`;
			}
		})
		.join('\n');
};

// Target length for card-sized descriptions: longer than the one-line
// short description, but small enough to fit on a card without scrolling far.
const MEDIUM_DESCRIPTION_LENGTH = 420;

// Build a medium-length description from the long description by taking whole
// sentences up to the target length, falling back to the short description.
const mediumDescription = (
	longText?: string | null,
	shortText?: string | null,
	maxLength: number = MEDIUM_DESCRIPTION_LENGTH
): string => {
	const source = longText?.trim();
	if (!source) return shortText?.trim() || '';
	if (source.length <= maxLength) return source;

	const sentences = source.match(/[^.!?]+[.!?]+["')\]]*\s*/g);
	if (sentences) {
		let result = '';
		for (const sentence of sentences) {
			if (result && result.length + sentence.length > maxLength) break;
			result += sentence;
		}
		if (result.trim()) return result.trim();
	}

	// No sentence boundaries found — cut at the last word and add an ellipsis
	const cut = source.slice(0, maxLength);
	return cut.slice(0, cut.lastIndexOf(' ')).trimEnd() + '…';
};

// Hard cap on clarifying questions per conversation — the flow should end
// after 3-6 questions; the user can always prompt for more themselves.
const MAX_CLARIFYING_QUESTIONS = 6;

// Count assistant turns containing a question in a flattened chat log.
// The model can't reliably count its own questions, so we do it in code.
const countAssistantQuestions = (chatLog: string): number =>
	chatLog
		.split(/\n(?=User:|Assistant:)/)
		.filter((turn) => turn.startsWith('Assistant:') && turn.includes('?')).length;

export {
	extractJSON,
	flattenChat,
	countAssistantQuestions,
	mediumDescription,
	MAX_CLARIFYING_QUESTIONS
};
