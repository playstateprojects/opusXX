// this endpoint accepts an array of works and intention string, returns insights with relevance scores

import { jsonChat } from '$lib/server/openai';
import {
    AiMessage,
    AiRole,
    type InsightMakerRequest,
    type InsightMakerResponse,
} from '$lib/types.js';
import { json, type RequestHandler } from '@sveltejs/kit';

const prompt = `Provide an insight regarding each musical work provided paying particular attention to how it migh relate to the provided intention.

Instructions:
- For each work, provide a brief insight highlighting how it relates to the intention
- Score relevance from 0-10 (10 = perfectly matches intention, 0 = no relation)
- Be concise but meaningful in insights
- If a work has no clear relation to the intention, give it a low score
- Avoid potentially offensive or stereotypical comentary.

Output JSON only in this exact format:
{
  "works": [
    {
      "workId": "<work id or name>",
      "insight": "<brief explanation of how this work relates to the intention>",
      "relevanceScore": <number 0-10>
    }
  ]
}

INTENTION: `;

export const POST: RequestHandler = async ({ request }) => {
    try {
        const body: InsightMakerRequest = await request.json();

        // Validate input
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

        // Prepare works data for AI (simplified to avoid token bloat)
        const worksData = body.works.map(work => ({
            id: work.id || work.name,
            name: work.name,
            composer: work.composer?.name || 'Unknown',
            genre: work.genre || 'Unknown',
            period: work.period || 'Unknown',
            instrumentation: work.instrumentation || 'Unknown',
            duration: work.duration || 'Unknown'
        }));

        const messages: AiMessage[] = [{
            role: AiRole.User,
            content: prompt + body.intention + '\n\nWORKS TO ANALYZE:\n' + JSON.stringify(worksData, null, 2)
        }];

        const data = await jsonChat(messages);

        // Handle error response from jsonChat
        if (!data || 'error' in data) {
            return new Response(JSON.stringify({ error: 'Failed to generate insights' }), {
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
        let parsedContent: InsightMakerResponse;
        try {
            parsedContent = JSON.parse(data.content) as InsightMakerResponse;
        } catch {
            return new Response(JSON.stringify({ error: 'Invalid JSON response from AI' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validate response structure
        if (!parsedContent.works || !Array.isArray(parsedContent.works)) {
            return new Response(JSON.stringify({ error: 'Invalid response format from AI' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validate and clean each work insight
        const validatedWorks = parsedContent.works
            .filter(work => {
                // Basic validation
                if (!work.workId || !work.insight || typeof work.relevanceScore !== 'number') {
                    return false;
                }
                // Ensure relevance score is within range
                work.relevanceScore = Math.max(0, Math.min(10, Math.round(work.relevanceScore)));
                return true;
            })
            .filter(work => {
                // Apply minimum relevance score filter if provided
                return !body.minRelevanceScore || work.relevanceScore >= body.minRelevanceScore;
            })
            .sort((a, b) => b.relevanceScore - a.relevanceScore); // Sort by relevance (descending)

        return json({ works: validatedWorks });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};