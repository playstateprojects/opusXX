// this endpoint accepts a chat thread and returns a follow up question with optional quick response buttons.

import { jsonChat } from '$lib/server/openai';
import {
    AiMessage,
    AiRole,
    type QuestionMakerInfo,
    type QuestionMakerResponse
} from '$lib/types.js';
import { json, type RequestHandler } from '@sveltejs/kit';

const prompt = `You are a musical scholar helping the user select works by female composers for a classical music programme. Task: Based on the chat conversation and currently displayed works (if any), generate a direct follow-up question to gather specific information about the user's musical preferences.

There is no need to emphasise that the works are from female composers, this is already understood. Responses should be conversational. Your goal is to establish basic search requirements and explore thematic and atmospheric potential.
Questions can be open ended and quick responses response can be and empty array only include Quick responses if relevant or inspiring. You should cover the basics Genre, Period and them before drilling into detail.

Rules:
- Ask ONE specific question to clarify their search criteria
- Focus on concrete musical attributes: instrumentation, time period, genre, duration, performance setting or ask direct follow up questions.
- Be direct and factual - avoid creative or poetic language
- Only ask for information that would meaningfully filter search results
- Optionally provide 2-4 short quick response options (each 1-4 words) that users can click
- Quick responses should be specific and actionable

CONTEXT AWARENESS:
- If works are currently displayed, consider their characteristics (period, genre, instrumentation, relevance scores)
- Use displayed works to inform more targeted follow-up questions
- If many works have been displayed and the conversation is extensive (8+ exchanges), you may optionally provide a brief summary of the displayed works instead of another question
- When providing a summary, set "question" to empty string and populate "summary" field instead

Output JSON only:
{
  "question": "<direct follow-up question or empty string if providing summary>",
  "quickResponses": ["<option1>", "<option2>", "<option3>", "<option4>"],
  "summary": "<optional brief summary of displayed works when conversation is extensive>"
}

If no meaningful follow-up can be generated, return empty question and no quickResponses.`;

export const POST: RequestHandler = async ({ request }) => {
    const body: QuestionMakerInfo = await request.json();

    // Build context string including displayed works if available
    let contextString = '\n\nChat conversation:\n' + body.chatLog;

    if (body.displayedWorks && body.displayedWorks.length > 0) {
        contextString += '\n\nCurrently displayed works:\n';
        body.displayedWorks.forEach((work, index) => {
            contextString += `${index + 1}. "${work.workName}" by ${work.composerName}`;
            if (work.period) contextString += ` (${work.period})`;
            if (work.genre) contextString += ` - ${work.genre}`;
            if (work.relevance !== undefined) contextString += ` [Relevance: ${work.relevance}/10]`;
            if (work.shortDescription) contextString += `\n   Description: ${work.shortDescription}`;
            if (work.insight) contextString += `\n   Insight: ${work.insight}`;
            contextString += '\n';
        });
    }

    const messages: AiMessage[] = [{
        role: AiRole.User,
        content: prompt + contextString
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