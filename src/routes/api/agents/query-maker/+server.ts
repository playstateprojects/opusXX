// this endpoint accepts a chat thread and returns a string of vector search terms.

import { jsonChat } from '$lib/server/openai';
import {
    AiMessage,
    AiRole,
    type QueryMakerInfo,
    type QueryMakerResponse
} from '$lib/types.js';
import { getPrompt } from '$lib/server/prompts';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, locals }) => {
    const body: QueryMakerInfo = await request.json();
    const prompt = await getPrompt(locals.supabase, 'query-maker');
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
