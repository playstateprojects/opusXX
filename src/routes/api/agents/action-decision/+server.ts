// this endpoint accepts a chat thread and determines if the user's response should trigger a work search or continue conversation.

import { jsonChat } from '$lib/server/openai';
import {
    AiMessage,
    AiRole,
    type ActionDecisionInfo,
    type ActionDecisionResponse
} from '$lib/types.js';
import { json, type RequestHandler } from '@sveltejs/kit';

const prompt = `Task: Analyze the chat conversation to determine if the user's latest message indicates they want to search for musical works or continue the conversation.

Rules:
- Return "search" if the user expresses a specific musical request, preference, or intent that could be used to find works and there is enough useful information to find relevant works.
- Return "continue" if the user is asking questions, seeking clarification, or providing general responses that don't indicate a search intent
- Consider context: if they just received search results, they might be refining their search or asking follow-up questions
- Musical search indicators: mentions of instruments, genres, moods, composers, time periods, specific musical characteristics
- Conversation indicators: "tell me more", "what does that mean", "how about", general questions, acknowledgments

Examples:
- "I want something for piano" → "search"
- "Something uplifting and modern" → "search" 
- "What does that mean?" → "continue"
- "Tell me more about her" → "continue"
- "Maybe something quieter" → "search"
- "Thanks, that's helpful" → "continue"
- "A piece for a specific instrumentation" → "continue"
- "A piece that matches a program theme" → "continue"

Output JSON only:
{
  "action": "search" | "continue",
  "reason": "<brief explanation of the decision>"
}`;

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