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
import { json, type RequestHandler } from '@sveltejs/kit';

const prompt = `You are Opus XX's programming advisor.
You are scoring how well each work matches a user's stated intention for a concert programme.

RELEVANCE SCORING GUIDE:
- 9-10: Exceptional match - work strongly aligns with multiple aspects of the intention (theme, mood, instrumentation, style)
- 7-8: Strong match - work clearly relates to the intention in significant ways
- 5-6: Moderate match - work has some connection to the intention but may lack certain elements
- 3-4: Weak match - work has tangential or minimal connection to the intention
- 1-2: Poor match - work barely relates to the intention
- 0: No match - work has no discernible connection to the intention

IMPORTANT: Be discriminating with high scores (8-10). These should be reserved for works that genuinely excel at matching the intention. Most works should fall in the 4-7 range if they have some relevance. Don't inflate scores just because a work matches one basic criterion (e.g., period or genre alone). Score the works relative to each other.

Output JSON only in this exact format:
{
  "scores": [
    { "workId": "<work id or name>", "relevanceScore": <number 0-10> }
  ]
}

INTENTION: `;

export const POST: RequestHandler = async ({ request }) => {
    try {
        const body: WorkScorerRequest = await request.json();

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
