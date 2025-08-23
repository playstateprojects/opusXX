// this endpoint accepts a chat thread and returns a follow up question with optional quick response buttons.

import { jsonChat } from '$lib/server/openai';
import {
    AiMessage,
    AiRole,
    type QuestionMakerInfo,
    type QuestionMakerResponse
} from '$lib/types.js';
import { json, type RequestHandler } from '@sveltejs/kit';

const prompt = `Task: Based on the chat conversation, generate a thoughtful follow-up question to help the user discover more relevant musical works by female composers.

Rules:
- Ask ONE clear, engaging follow-up question that builds naturally on the conversation
- The question should help narrow down or expand their musical exploration
- Focus on musical aspects: instrumentation, mood, era, genre, composer style, performance context
- Keep questions conversational and helpful, not interrogative
- Optionally provide 2-4 short quick response options (each 1-4 words) that users can click
- Quick responses should be diverse and cover different musical dimensions

Output JSON only:
{
  "question": "<engaging follow-up question>",
  "quickResponses": ["<option1>", "<option2>", "<option3>", "<option4>"]
}

If no meaningful follow-up can be generated, return empty question and no quickResponses.`;

export const POST: RequestHandler = async ({ request }) => {
    const body: QuestionMakerInfo = await request.json();
    const messages: AiMessage[] = [{
        role: AiRole.User,
        content: prompt + '\n\nChat conversation:\n' + body.chatLog
    }]
    try {
        const data = await jsonChat(messages);
        // Handle error response from jsonChat
        if (!data || 'error' in data) {
            return new Response(JSON.stringify({ error: 'Failed to generate question from chat' }), {
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
        let parsedContent: QuestionMakerResponse;
        try {
            parsedContent = JSON.parse(data.content) as QuestionMakerResponse;
        } catch {
            return new Response(JSON.stringify({ error: 'Invalid JSON response from AI' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Basic validation of required fields - check if properties exist (allow empty strings)
        if (!('question' in parsedContent)) {
            return new Response(JSON.stringify({ error: 'Missing required question field in AI response' }), {
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