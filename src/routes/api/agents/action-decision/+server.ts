// this endpoint accepts a chat thread and determines if the user's response should trigger a work search or continue conversation.

import { jsonChat } from '$lib/server/openai';
import {
    AiMessage,
    AiRole,
    type ActionDecisionInfo,
    type ActionDecisionResponse,
    periods,
    genres,
    subGenres
} from '$lib/types.js';
import { json, type RequestHandler } from '@sveltejs/kit';

const prompt = `🎼 MUSICAL CHAT CLASSIFIER & FILTER EXTRACTION PROMPT
------------------------------------------------------

Task:
Analyze the latest user message in the context of the conversation to:
1. Decide whether to initiate a SQL search, vector search, or continue conversation
2. Extract ALL implicit and explicit filters from the message when search is triggered

CRITICAL: Filters should be extracted liberally whenever they are mentioned or implied, even if not explicitly stated as search criteria.


Decision Rules
--------------

1. "sql_search" (PREFERRED when structured filters present)
Return "sql_search" when the user's message contains STRUCTURED, CATEGORICAL information that can be filtered:
- Specific period (Baroque, Romantic, Classical, etc.)
- Specific genre (Chamber music, Opera, Solo, etc.)
- Specific subgenre (Quartet, Symphony, Sonata, etc.)
- Composer name
- Instrument(s)

Use sql_search when the query can be answered with exact/categorical matching.

Examples:
- "Romantic period chamber music" → sql_search (period: "Romantic", genre: "Chamber music")
- "String quartets by Beethoven" → sql_search (composer: "Ludwig van Beethoven", genre: "Chamber music", subgenre: "Quartet")
- "Baroque violin concertos" → sql_search (period: "Baroque", subgenre: "Concerto", instrument: "violin")
- "Something by Debussy for piano" → sql_search (composer: "Claude Debussy", instrument: "piano")
- "20th century symphonies" → sql_search (period: "20th Century", genre: "Orchestral", subgenre: "Symphony")


2. "vector_search" (Use for semantic/descriptive queries)
Return "vector_search" when the user's message is DESCRIPTIVE, SEMANTIC, or MOOD-BASED without clear categorical filters:
- Descriptive mood/character ("sad", "joyful", "peaceful", "dramatic", "heroic")
- Abstract concepts ("something melancholic", "uplifting music")
- Comparative language without specific filters ("something like this but gentler")
- Vague requests without structured criteria

Use vector_search when semantic similarity matching is needed rather than categorical filtering.

Examples:
- "Something peaceful and contemplative" → vector_search
- "Music that feels like autumn rain" → vector_search
- "Uplifting and energetic pieces" → vector_search
- "Something melancholic but not too sad" → vector_search
- "Music similar to what I just heard" → vector_search


3. "continue"
Return "continue" if the user is not expressing search intent:
- Asking for clarification, background, or context
- Giving a non-directive reaction ("That's nice", "Tell me more")
- Discussing music theory or history without implying a search
- Making meta or conversational comments

Examples:
- "Who was she?" → continue
- "What defines the Romantic period?" → continue
- "Thanks, that's helpful." → continue
- "That's too dramatic." → continue


Filter Extraction (CRITICAL)
-----------------------------
When action = "search", ALWAYS extract filters whenever they appear in the message, whether explicit or implicit.

Available filter fields:
- composer: Full composer name (e.g., "Clara Schumann", "Claude Debussy")
- period: MUST be one of: "Medieval", "Renaissance", "Baroque", "Classical", "Early Romantic", "Late Romantic", "Romantic", "20th Century", "Contemporary"
- genre: MUST be one of: "Chamber music", "Choral", "Opera", "Orchestral", "Solo", "Vocal"
- subgenre: MUST be one of: "Canon", "Fugue", "Children's Opera", "Dance", "Mazurka", "Quintet", "Motet", "Opera Seria", "Madrigal", "Symphonic poem", "Anthem", "Etude", "Lieder", "Suite", "Concerto grosso", "Bagatelle", "Concerto", "Prelude", "Serenade", "Trio", "Duo", "Tone poem", "Grand Opera", "Waltz", "Polonaise", "Quartet", "Symphony", "Ballet", "Comic Opera", "Sonata", "Opera Buffa", "Impromptu", "Cantata", "Ensemble", "Chorale", "Scherzo", "Requiem", "Mass", "Masque", "Divertimento", "Minuet"
- instrument: Any instrument(s) or ensemble mentioned (string, array, or free-text like "piano", "string quartet", ["violin", "cello"])

IMPORTANT Mapping Rules:
- "string quartet" → genre: "Chamber music", subgenre: "Quartet", instrument: "string"
- "piano sonata" → genre: "Solo", subgenre: "Sonata", instrument: "piano"
- "opera" → genre: "Opera" (may include subgenre if specific type mentioned)
- "symphony" → genre: "Orchestral", subgenre: "Symphony"
- "chamber music" → genre: "Chamber music"
- Period synonyms: "late 19th century" = "Late Romantic", "1900s" = "20th Century", "modern" = "Contemporary"

Filter Extraction Examples:

User: "Show me a string quartet"
→ filters: { genre: "Chamber music", subgenre: "Quartet", instrument: "string" }

User: "Something by Debussy for piano"
→ filters: { composer: "Claude Debussy", instrument: "piano" }

User: "I want Baroque opera"
→ filters: { period: "Baroque", genre: "Opera" }

User: "A sad Romantic piano piece"
→ filters: { period: "Romantic", genre: "Solo", instrument: "piano" }

User: "Maybe something by Mendelssohn instead?"
→ filters: { composer: "Felix Mendelssohn" }

User: "What about a symphony from the 20th century?"
→ filters: { period: "20th Century", genre: "Orchestral", subgenre: "Symphony" }

User: "Chamber music for flute and harp"
→ filters: { genre: "Chamber music", instrument: ["flute", "harp"] }


Context Awareness
-----------------
- If the user just received search results, treat follow-up refinements (e.g., "only by Mendelssohn", "maybe something slower", "more chamber music") as NEW searches with filters extracted from the refinement.
- Extract filters even from conversational messages if search intent is clear.
- When a period is mentioned colloquially (e.g., "Baroque", "modern times"), map it to the closest valid period enum.
- When a composer is mentioned by last name only, infer the full name if commonly known (e.g., "Debussy" → "Claude Debussy", "Bach" → "Johann Sebastian Bach").


Output Format
-------------
Return JSON only:

{
  "action": "sql_search" | "vector_search" | "continue",
  "reason": "<brief explanation>",
  "filters": {
    "composer"?: string,
    "period"?: string,  // MUST match period enum
    "genre"?: string,   // MUST match genre enum
    "subgenre"?: string, // MUST match subgenre enum
    "instrument"?: string | string[]
  }
}

IMPORTANT:
- If action is "sql_search", filters MUST be provided with at least one field
- If action is "vector_search", filters should be omitted or minimal
- If action is "continue", filters should be omitted
- Only include filter fields that are present in the message. Omit fields that are not mentioned or implied.
`;

export const POST: RequestHandler = async ({ request }) => {
    const body: ActionDecisionInfo = await request.json();
    const messages: AiMessage[] = [{
        role: AiRole.User,
        content: prompt + '\n\nChat conversation:\n' + body.chatLog
    }]
    try {
        const data = await jsonChat(messages);
        // Handle error response from jsonChat
        if (!data || 'error' in data) {
            return new Response(JSON.stringify({ error: 'Failed to determine action from chat' }), {
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

        // Validate filter values against enum types if filters are present
        if (parsedContent.filters) {
            const { filters } = parsedContent;

            // Validate period against periods enum
            if (filters.period) {
                const validPeriod = periods.safeParse(filters.period);
                if (!validPeriod.success) {
                    console.warn(`Invalid period "${filters.period}", will be ignored`);
                    delete filters.period;
                }
            }

            // Validate genre against genres enum
            if (filters.genre) {
                const validGenre = genres.safeParse(filters.genre);
                if (!validGenre.success) {
                    console.warn(`Invalid genre "${filters.genre}", will be ignored`);
                    delete filters.genre;
                }
            }

            // Validate subgenre against subGenres enum
            if (filters.subgenre) {
                const validSubgenre = subGenres.safeParse(filters.subgenre);
                if (!validSubgenre.success) {
                    console.warn(`Invalid subgenre "${filters.subgenre}", will be ignored`);
                    delete filters.subgenre;
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