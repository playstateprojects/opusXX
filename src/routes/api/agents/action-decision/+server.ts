// this endpoint accepts a chat thread and determines if the user's response should trigger a work search or continue conversation.

import { jsonChat } from '$lib/server/openai';
import {
    AiMessage,
    AiRole,
    type ActionDecisionInfo,
    type ActionDecisionResponse
} from '$lib/types.js';
import { json, type RequestHandler } from '@sveltejs/kit';

const prompt = `🎼 MUSICAL CHAT CLASSIFIER PROMPT
--------------------------------

Task:
Analyze the latest user message in the context of the conversation to decide whether to:
- initiate a vector search for musical works, or
- continue the conversation (ask/answer/follow-up).

If a search is triggered, optionally extract structured filters from the message (if they exist).


Decision Rules
--------------

1. "search"
Return "search" if the user’s message expresses intent to find or discover musical works and includes enough musical or descriptive information to generate relevant results.

Search indicators:
- Mentions of instruments, ensembles, or instrumentation
- References to genre, subgenre, style, or period
- Mentions of specific composers in the context of finding their works
- Descriptive musical mood or character ("sad", "joyful", "minimalist", "heroic")
- Comparative or directive language ("show me", "something like", "I want", "maybe more gentle")

Examples:
- “I’d like a calm string quartet.” → search
- “Something late Romantic for piano.” → search
- “A piece for flute and harp.” → search


2. "continue"
Return "continue" if the user is not expressing search intent — e.g., they are:
- Asking for clarification, background, or context
- Giving a non-directive reaction (“That’s nice”, “Tell me more”)
- Discussing composers or works without implying a search
- Making meta or conversational comments

Examples:
- “Who was she?” → continue
- “What defines the Romantic period?” → continue
- “Thanks, that’s helpful.” → continue
- “That’s too dramatic.” → continue


Optional Filters
----------------
If action = "search", extract filter fields when possible:
- composer – e.g. “by Clara Schumann”
- period – e.g. “Baroque”, “Romantic”, “20th century”
- genre – e.g. “opera”, “symphony”
- subgenre – e.g. “string quartet”, “chamber song”
- instrument – e.g. “piano”, “violin”, “flute ensemble”

If no filter applies, omit that key.

Example:
User: “Show me something for violin and piano from the Romantic period.”
→
{
  "action": "search",
  "reason": "User specifies instruments and period, clear search intent.",
  "filters": {
    "period": "Romantic",
    "instrument": ["violin", "piano"]
  }
}


Context Awareness
-----------------
- If the user just received search results, treat follow-up refinements (e.g. “only by Mendelssohn”, “maybe something slower”) as continuations with search intent — output "search" and include relevant filters.
- If the message doesn’t include actionable search terms or filters, return "continue".


Output Format
-------------
Return JSON only:

{
  "action": "search" | "continue",
  "reason": "<brief explanation>",
  "filters": {
    "composer"?: string,
    "period"?: string,
    "genre"?: string,
    "subgenre"?: string,
    "instrument"?: string | string[]
  }
}
`;

export const POST: RequestHandler = async ({ request }) => {
    const body: ActionDecisionInfo = await request.json();
    const messages: AiMessage[] = [{
        role: AiRole.User,
        content: prompt + '\n\nChat conversation:\n' + body.chatLog
    }]
    try {
        const data = await jsonChat(messages);
        // Handle error response from jsonChat
        if (!data || 'error' in data) {
            return new Response(JSON.stringify({ error: 'Failed to determine action from chat' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Handle missing content
        if (!data.content) {
            return new Response(JSON.stringify({ error: 'No content received from AI' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Parse and validate the JSON response
        let parsedContent: ActionDecisionResponse;
        try {
            parsedContent = JSON.parse(data.content) as ActionDecisionResponse;
        } catch {
            return new Response(JSON.stringify({ error: 'Invalid JSON response from AI' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Basic validation of required fields
        if (!('action' in parsedContent) || !['search', 'continue'].includes(parsedContent.action)) {
            return new Response(JSON.stringify({ error: 'Invalid action in AI response' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return json(parsedContent);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}