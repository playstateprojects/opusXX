// Scores an array of works against an intention in a single call.
// Output is intentionally tiny (ids + numbers) so it stays fast even on the pro
// model, and scoring all works together preserves relative discrimination.

import { jsonChat, FLASH_MODEL } from '$lib/server/openai';
import {
    AiMessage,
    AiRole,
    type WorkScorerRequest,
    type WorkScorerResponse,
} from '$lib/types.js';
import { getPrompt } from '$lib/server/prompts';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        const body: WorkScorerRequest = await request.json();
        const prompt = await getPrompt(locals.supabase, 'work-scorer');

        if (!body.works || !Array.isArray(body.works) || body.works.length === 0) {
            return new Response(JSON.stringify({ error: 'Works array is required and must not be empty' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (!body.intention || typeof body.intention !== 'string' || body.intention.trim() === '') {
            return new Response(JSON.stringify({ error: 'Intention string is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Simplified work data — enough context to score, kept small to avoid token bloat
        const worksData = body.works.map(work => {
            let description = 'No description available';
            if (work.shortDescription) {
                description = work.shortDescription.substring(0, 200);
            } else if (work.longDescription) {
                description = work.longDescription.substring(0, 200);
            }

            // Declared as string, but defend against array data at runtime.
            const instrumentation = work.instrumentation as unknown;

            return {
                id: work.id || work.name,
                name: work.name,
                composer: work.composer?.name || 'Unknown',
                genre: work.genre?.name || 'Unknown',
                period: work.period || 'Unknown',
                instrumentation: Array.isArray(instrumentation)
                    ? instrumentation.slice(0, 5).join(', ')
                    : typeof instrumentation === 'string'
                        ? instrumentation.substring(0, 100)
                        : 'Unknown',
                duration: work.duration || 'Unknown',
                description: description
            };
        });

        const messages: AiMessage[] = [{
            role: AiRole.User,
            content: prompt + body.intention + '\n\nWORKS TO SCORE:\n' + JSON.stringify(worksData, null, 2)
        }];

        // Flash tier: scoring is a fast, bounded-output task (thinking is disabled
        // globally in jsonChat).
        const data = await jsonChat(messages, { model: FLASH_MODEL });

        if (!data || 'error' in data) {
            return new Response(JSON.stringify({ error: 'Failed to score works' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (!data.content) {
            return new Response(JSON.stringify({ error: 'No content received from AI' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        let parsed: WorkScorerResponse;
        try {
            parsed = JSON.parse(data.content) as WorkScorerResponse;
        } catch {
            return new Response(JSON.stringify({ error: 'Invalid JSON response from AI' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (!parsed.scores || !Array.isArray(parsed.scores)) {
            return new Response(JSON.stringify({ error: 'Invalid response format from AI' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const scores = parsed.scores
            .filter(s => s.workId && typeof s.relevanceScore === 'number')
            .map(s => ({
                workId: s.workId,
                relevanceScore: Math.max(0, Math.min(10, Math.round(s.relevanceScore)))
            }))
            .filter(s => !body.minRelevanceScore || s.relevanceScore >= body.minRelevanceScore)
            .sort((a, b) => b.relevanceScore - a.relevanceScore);

        return json({ scores } satisfies WorkScorerResponse);

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
