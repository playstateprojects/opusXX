// this endpoint accepts an array of works and intention string, returns insights with relevance scores

import { jsonChat } from '$lib/server/openai';
import {
    AiMessage,
    AiRole,
    type InsightMakerRequest,
    type InsightMakerResponse,
} from '$lib/types.js';
import { json, type RequestHandler } from '@sveltejs/kit';

const prompt = `You are Opus XX's programming advisor.
You are generating a short artistic insight for a work card.
Instrumentation, duration, year, and composer name are displayed elsewhere on the card.
Do not repeat this information unless it is essential to the artistic reasoning.

PURPOSE
Answer this question: Why is this work artistically strong and worth including in a serious concert programme?
Your insight must demonstrate musical understanding and contextual awareness.
Do not:
- Explain why it matches a search filter.
- Use diversity as justification.
- Provide generic praise.
- Repeat visible metadata.
- Provide biography unless it directly clarifies artistic value.

REQUIRED ELEMENTS
Your insight should draw from:
- The musical characteristics of the work
- What is known about the composer's style
- The historical or stylistic period
- Relevant contextual data in the database
- The work's position within the composer's output (if meaningful)
Context must strengthen the artistic case, not replace it.

STRUCTURE
Write 2–4 sentences total (approx. 600 characters max).

1. Distinctive Musical Qualities
Identify specific features: structural approach, treatment of material, harmonic or rhythmic language, texture, instrumental writing, formal clarity or innovation.
Avoid vague adjectives. If you use evaluative words (bold, inventive, lyrical, austere), explain how.

2. Contextual Placement
If relevant, briefly situate the work within: the composer's broader style, their compositional priorities, the stylistic language of the period, a turning point in their output.
Keep this concise and functional.

3. Programming Value
Explain how the work might function in a programme: contrast, structural anchor, quiet centre, thematic reinforcement, reframing familiar repertoire, perspective shift.
Be practical.

TONE
- Professional but warm.
- Clear and direct language.
- Deeply informed, not academic.
- Calmly enthusiastic.
Avoid: Poetic metaphors, marketing tone, moral framing, corporate language, exclamation marks, emojis.
You are a trusted musical colleague.

INTERNAL REASONING (Important)
Before generating the final insight, internally consider:
- What makes this work different from standard repertoire of the same period?
- What might a sceptical conductor question?
- What specific musical evidence supports its inclusion?
- What context from the database strengthens the argument?
Do not output this reasoning. Use it to improve the final insight.

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
      "insight": "<artistic insight for the work card>",
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
        const worksData = body.works.map(work => {
            // More aggressive description truncation to avoid payload issues
            let description = 'No description available';
            if (work.shortDescription) {
                description = work.shortDescription.substring(0, 200);
            } else if (work.longDescription) {
                description = work.longDescription.substring(0, 200);
            }

            return {
                id: work.id || work.name,
                name: work.name,
                composer: work.composer?.name || 'Unknown',
                genre: work.genre?.name || 'Unknown',
                period: work.period || 'Unknown',
                instrumentation: Array.isArray(work.instrumentation)
                    ? work.instrumentation.slice(0, 5).join(', ')
                    : typeof work.instrumentation === 'string'
                        ? work.instrumentation.substring(0, 100)
                        : 'Unknown',
                duration: work.duration || 'Unknown',
                description: description
            };
        });

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