// this endpoint accepts a chat thread and returns a string of vector search terms.

import { jsonChat } from '$lib/server/openai';
import {
    AiMessage,
    AiRole,
    type QueryMakerInfo,
    type QueryMakerResponse
} from '$lib/types.js';
import { json, type RequestHandler } from '@sveltejs/kit';
const prompt = `Task: From the user's message, produce (1) a clean, reusable MUSICAL INTENT and (2) a concise VECTOR QUERY.

                Rules:
                - The database ALREADY contains only works by female composers. NEVER include "female", "woman", "underrepresented", or any metadata about identity or the collection.
                - Use ONLY what the user explicitly states: ensemble/instrumentation, mood or theme, genre/form, era if explicitly stated, length/duration if explicitly stated.
                - Do not invent details, synonyms, or composer names. No explanations.
                - Normalize:
                - lowercase
                - remove hashtags and filler words
                - replace punctuation with single spaces
                - Keep "vectorQueryTerm" short (3-12 words). If nothing usable, return empty strings.

                Output JSON only:
                {
                "intent": "<plain text summary of the user's musical intent>",
                "vectorQueryTerm": "<concise search string derived from the intent>"
                }`

export const POST: RequestHandler = async ({ request }) => {
    const body: QueryMakerInfo = await request.json();
    const messages: AiMessage[] = [{
        role: AiRole.User,
        content: prompt + body.chatLog
    }]
    try {
        const data = await jsonChat(messages);
        // Handle error response from jsonChat
        if (!data || 'error' in data) {
            return new Response(JSON.stringify({ error: 'Failed to generate query from chat' }), {
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
        let parsedContent: QueryMakerResponse;
        try {
            parsedContent = JSON.parse(data.content) as QueryMakerResponse;
        } catch {
            return new Response(JSON.stringify({ error: 'Invalid JSON response from AI' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Basic validation of required fields - check if properties exist (allow empty strings)
        if (!('intent' in parsedContent) || !('vectorQueryTerm' in parsedContent)) {
            return new Response(JSON.stringify({ error: 'Missing required fields in AI response' }), {
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
