// this endpoint accepts a chat thread and determines if the user's response should trigger a work search or continue conversation.

import { jsonChat } from '$lib/server/openai';
import {
    AiMessage,
    AiRole,
    type ActionDecisionInfo,
    type ActionDecisionResponse
} from '$lib/types.js';
import {
    CANONICAL_PERIODS,
    getTaxonomy,
    normalizeNameFilter,
    normalizePeriodFilter,
    type Taxonomy
} from '$lib/server/taxonomy';
import { getPrompt, renderPrompt } from '$lib/server/prompts';
import { json, type RequestHandler } from '@sveltejs/kit';
import { countAssistantQuestions, MAX_CLARIFYING_QUESTIONS } from '$lib/utils/stringUtils';

// The prompt template is stored in the Supabase `prompts` table (slug
// "action-decision") so it can be edited without a redeploy. It contains
// {{PERIODS}}, {{GENRES}} and {{SUBGENRES}} placeholders that are filled here
// from the live taxonomy so the model only emits filter values that exist.
const buildPrompt = (template: string, taxonomy: Taxonomy) =>
    renderPrompt(template, {
        PERIODS: CANONICAL_PERIODS.map((p) => `"${p}"`).join(', '),
        GENRES: taxonomy.genres.map((g) => `"${g.name.trim()}"`).join(', '),
        SUBGENRES: taxonomy.subgenres.map((s) => `"${s.name.trim()}"`).join(', ')
    });

export const POST: RequestHandler = async ({ request, locals }) => {
    const body: ActionDecisionInfo = await request.json();

    // Live genre/subgenre values from Supabase so the model only emits filter
    // values that actually exist in the database (cached, see taxonomy.ts)
    const taxonomy = await getTaxonomy(locals.supabase);
    const template = await getPrompt(locals.supabase, 'action-decision');
    const prompt = buildPrompt(template, taxonomy);

    const questionsAsked = countAssistantQuestions(body.chatLog ?? '');

    // Build context string including displayed works if available
    let contextString = '\n\nChat conversation:\n' + body.chatLog;

    contextString += `\n\nQUESTION BUDGET STATUS:\nThe assistant has already asked ${questionsAsked} clarifying question(s) in this conversation.`;
    if (questionsAsked >= MAX_CLARIFYING_QUESTIONS) {
        contextString += '\nThe question budget is EXHAUSTED. Do NOT return "continue". You MUST return "sql_search" or "vector_search" with the best filters available from the conversation history.';
    } else if (questionsAsked >= 3) {
        contextString += '\nThe budget is nearly exhausted. Return "continue" only if there is genuinely nothing searchable yet — otherwise search now with whatever filters you have.';
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
            const errorMessage = (data as any)?.message || 'Failed to determine action from chat';
            console.error('Action decision error:', errorMessage);
            return new Response(JSON.stringify({
                error: errorMessage,
                action: 'continue' // Fallback to continue conversation on error
            }), {
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
        if (!('action' in parsedContent) || !['sql_search', 'vector_search', 'continue'].includes(parsedContent.action)) {
            return new Response(JSON.stringify({ error: 'Invalid action in AI response' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Enforce the question cap deterministically: if the model still wants
        // to ask another question after the budget is spent, force a vector
        // search instead — the query-maker builds the semantic query from the
        // conversation, so empty filters are fine.
        if (parsedContent.action === 'continue' && questionsAsked >= MAX_CLARIFYING_QUESTIONS) {
            parsedContent = {
                action: 'vector_search',
                reason: `Question budget exhausted (${questionsAsked} questions asked) — searching with available context instead of asking again.`,
                filters: parsedContent.filters ?? {}
            };
        }

        // Normalize filter values against the canonical taxonomy. Each value is
        // mapped to its canonical form (handles arrays, casing, synonyms like
        // "Late Romantic" or "Romantic Period"); unrecognized values are dropped.
        if (parsedContent.filters) {
            const { filters } = parsedContent;

            if (filters.period) {
                const normalized = normalizePeriodFilter(filters.period);
                if (normalized.length === 0) {
                    console.warn(`Invalid period "${filters.period}", will be ignored`);
                    delete filters.period;
                } else {
                    filters.period = normalized.length === 1 ? normalized[0] : normalized;
                }
            }

            if (filters.genre) {
                const matched = normalizeNameFilter(taxonomy.genres, filters.genre);
                if (matched.length === 0) {
                    console.warn(`Invalid genre "${filters.genre}", will be ignored`);
                    delete filters.genre;
                } else {
                    const names = matched.map((g) => g.name);
                    filters.genre = names.length === 1 ? names[0] : names;
                }
            }

            if (filters.subgenre) {
                const matched = normalizeNameFilter(taxonomy.subgenres, filters.subgenre);
                if (matched.length === 0) {
                    console.warn(`Invalid subgenre "${filters.subgenre}", will be ignored`);
                    delete filters.subgenre;
                } else {
                    const names = matched.map((s) => s.name);
                    filters.subgenre = names.length === 1 ? names[0] : names;
                }
            }
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
