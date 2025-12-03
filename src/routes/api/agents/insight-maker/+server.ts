// this endpoint accepts an array of works and intention string, returns insights with relevance scores

import { jsonChat } from '$lib/server/openai';
import {
    AiMessage,
    AiRole,
    type InsightMakerRequest,
    type InsightMakerResponse,
} from '$lib/types.js';
import { json, type RequestHandler } from '@sveltejs/kit';

const prompt = `Provide an insight regarding each musical work provided, paying particular attention to how it might relate to the provided intention.
The insight should give an atmospheric or thematic overview, not strictly adherent to the search intention unless it relates to a rich search.

Instructions:
- For each work, provide a brief insight (1-2 sentences) highlighting how it relates to the intention if the intention has thematic or atmospheric elements
- Score relevance from 0-10 based on how well the work matches the intention
- Be concise but meaningful in insights
- Consider the work's description, genre, period, and instrumentation when assessing relevance
- Avoid potentially offensive or stereotypical commentary

RELEVANCE SCORING GUIDE:
- 9-10: Exceptional match - work strongly aligns with multiple aspects of the intention (theme, mood, instrumentation, style)
- 7-8: Strong match - work clearly relates to the intention in significant ways
- 5-6: Moderate match - work has some connection to the intention but may lack certain elements
- 3-4: Weak match - work has tangential or minimal connection to the intention
- 1-2: Poor match - work barely relates to the intention
- 0: No match - work has no discernible connection to the intention

IMPORTANT: Be discriminating with high scores (8-10). These should be reserved for works that genuinely excel at matching the intention. Most works should fall in the 4-7 range if they have some relevance. Don't inflate scores just because a work matches one basic criterion (e.g., period or genre alone).

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
            genre: work.genre?.name || 'Unknown',
            period: work.period || 'Unknown',
            instrumentation: work.instrumentation || 'Unknown',
            duration: work.duration || 'Unknown',
            description: work.shortDescription || work.longDescription?.substring(0, 300) || 'No description available'
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