// Generates a single artistic insight for one work. Small and fast — the client
// fires these in parallel (bounded concurrency) on the flash model, so a slow or
// failed call only affects one card instead of a whole batch.

import { jsonChat, FLASH_MODEL } from '$lib/server/openai';
import {
    AiMessage,
    AiRole,
    type WorkInsightRequest,
    type WorkInsightResponse,
} from '$lib/types.js';
import { json, type RequestHandler } from '@sveltejs/kit';

const prompt = `You are Opus XX's programming advisor, writing a one-line artistic insight for a work card.
The card already shows composer, instrumentation, duration, and year — never repeat them.
The work was already selected to match the user's intention — never explain that it matches.

THE INSIGHT
One sentence, two at most (under 280 characters).
Tell the programmer the single most interesting thing they don't already know about this work: a specific musical feature, a surprising context, or a concrete way it functions in a programme.
Think of it as the remark a sharp colleague would add after the obvious facts are on the table.

NEVER include:
- Why the work fits the search or intention (genre, period, instrumentation, theme matches — all obvious).
- Diversity or representation as justification.
- Generic praise ("masterful", "stunning", "a gem") without a concrete musical observation behind it.
- Biography, unless it directly explains the work's sound.
- Vague evaluative adjectives without evidence.

TONE
A trusted musical colleague: direct, specific, calmly enthusiastic.
No poetic metaphors, marketing language, exclamation marks, or emojis.

Before writing, ask yourself: would a sceptical conductor learn something from this sentence? If not, find a sharper observation.

Output JSON only in this exact format:
{ "insight": "<artistic insight for the work card>" }

INTENTION: `;

export const POST: RequestHandler = async ({ request }) => {
    try {
        const body: WorkInsightRequest = await request.json();

        if (!body.work) {
            return new Response(JSON.stringify({ error: 'Work is required' }), {
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

        const work = body.work;
        const workId = (work.id || work.name) as string;

        let description = 'No description available';
        if (work.shortDescription) {
            description = work.shortDescription.substring(0, 400);
        } else if (work.longDescription) {
            description = work.longDescription.substring(0, 400);
        }

        // Declared as string, but defend against array data at runtime.
        const instrumentation = work.instrumentation as unknown;

        const workData = {
            id: workId,
            name: work.name,
            composer: work.composer?.name || 'Unknown',
            genre: work.genre?.name || 'Unknown',
            period: work.period || 'Unknown',
            instrumentation: Array.isArray(instrumentation)
                ? instrumentation.slice(0, 5).join(', ')
                : typeof instrumentation === 'string'
                    ? instrumentation.substring(0, 150)
                    : 'Unknown',
            duration: work.duration || 'Unknown',
            description: description
        };

        const messages: AiMessage[] = [{
            role: AiRole.User,
            content: prompt + body.intention + '\n\nWORK:\n' + JSON.stringify(workData, null, 2)
        }];

        // Flash tier: per-work insights are high-volume, so favour speed/cost
        // (thinking is disabled globally in jsonChat).
        const data = await jsonChat(messages, { model: FLASH_MODEL });

        if (!data || 'error' in data || !data.content) {
            return new Response(JSON.stringify({ error: 'Failed to generate insight' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        let parsed: { insight?: string };
        try {
            parsed = JSON.parse(data.content);
        } catch {
            return new Response(JSON.stringify({ error: 'Invalid JSON response from AI' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (!parsed.insight || typeof parsed.insight !== 'string') {
            return new Response(JSON.stringify({ error: 'Invalid response format from AI' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return json({ workId, insight: parsed.insight } satisfies WorkInsightResponse);

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
