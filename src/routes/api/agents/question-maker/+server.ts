// this endpoint accepts a chat thread and returns a follow up question with optional quick response buttons.

import { jsonChat } from '$lib/server/openai';
import {
    AiMessage,
    AiRole,
    type QuestionMakerInfo,
    type QuestionMakerResponse
} from '$lib/types.js';
import { getPrompt } from '$lib/server/prompts';
import { json, type RequestHandler } from '@sveltejs/kit';
import { countAssistantQuestions, MAX_CLARIFYING_QUESTIONS } from '$lib/utils/stringUtils';

export const POST: RequestHandler = async ({ request, locals }) => {
    const body: QuestionMakerInfo = await request.json();
    const prompt = await getPrompt(locals.supabase, 'question-maker');

    const questionsAsked = countAssistantQuestions(body.chatLog ?? '');

    // Build context string including displayed works if available
    let contextString = '\n\nChat conversation:\n' + body.chatLog;

    contextString += `\n\nQUESTION BUDGET STATUS:\nYou have already asked ${questionsAsked} question(s) in this conversation.`;
    if (questionsAsked >= MAX_CLARIFYING_QUESTIONS) {
        contextString += '\nThe question budget is EXHAUSTED. Do NOT ask another question. Return an empty question (optionally with a brief summary of displayed works).';
    } else if (questionsAsked >= 3) {
        contextString += '\nThe budget is nearly exhausted. Prefer an empty question or Assumption Mode — only ask if the user truly cannot proceed without deciding something.';
    }

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

        // Enforce the question cap deterministically: if the model still asks
        // after the budget is spent, strip the question. The frontend skips
        // empty questions, so the flow simply ends until the user prompts again.
        if (questionsAsked >= MAX_CLARIFYING_QUESTIONS && parsedContent.question?.trim()) {
            parsedContent.question = '';
            parsedContent.quickResponses = [];
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
