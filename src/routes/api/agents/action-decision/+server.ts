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

const prompt = `🎼 MUSICAL CHAT CLASSIFIER & FILTER EXTRACTION PROMPT (v2)
------------------------------------------------------

Task:
Analyze the latest user message in the context of the conversation and currently displayed works (if any) to:
1. Decide whether to initiate a SQL search, vector search, or continue conversation
2. Extract ALL implicit and explicit filters from the ENTIRE CONVERSATION HISTORY when search is triggered

GLOBAL BIAS (IMPORTANT):
- When in doubt, assume the user wants a search.
- If the user is talking about pieces they might want to hear / see / use (e.g. "something…", "show me…", "I want…", "too dramatic", "more dreamy"), you MUST return either "sql_search" or "vector_search", NOT "continue".
- After at least one musical filter (composer, period, genre, instrument, etc.) has appeared earlier in the conversation, only use "continue" when the user is clearly asking for meta-information (history, definitions) or explicitly not asking for more works.

DISPLAYED WORKS AWARENESS:
- If works are currently displayed, consider whether the user's message is refining/filtering those results or asking for completely new criteria
- User comments on displayed works (e.g., "too dramatic", "more upbeat", "something different") should trigger vector_search with accumulated filters
- If user is satisfied with displayed works and just commenting positively, consider "continue" instead of searching again


Decision Rules
--------------

1. "sql_search" (PREFERRED when structured filters present)
Return "sql_search" when the user's message contains STRUCTURED, CATEGORICAL information that can be filtered:
- Specific period (Baroque, Romantic, Classical, etc.)
- Specific genre (Chamber music, Opera, Solo, etc.)
- Specific subgenre (Quartet, Symphony, Sonata, etc.)
- Composer name
- Instrument(s)
- Requests like "show me...", "I want...", "find...", "give me..." that mention specific periods/genres/instruments

Use sql_search when the query can be answered with exact/categorical matching.

Examples:
- "Romantic period chamber music" → sql_search (period: "Romantic", genre: "Chamber Music")
- "String quartets by Beethoven" → sql_search (composer: "Ludwig van Beethoven", genre: "Chamber Music", subgenre: "Quartet")
- "Baroque violin concertos" → sql_search (period: "Baroque", subgenre: "Concerto", instrument: "violin")
- "Something by Debussy for piano" → sql_search (composer: "Claude Debussy", instrument: "piano")
- "20th century symphonies" → sql_search (period: "20th Century", genre: "Orchestral", subgenre: "Symphony")


2. "vector_search" (Use for semantic/descriptive queries)
Return "vector_search" when the user's message is DESCRIPTIVE, SEMANTIC, or MOOD-BASED:
- Descriptive mood/character ("sad", "joyful", "peaceful", "dramatic", "heroic", "dreamy")
- Abstract concepts ("something melancholic", "uplifting music")
- Comparative / refinement language:
  - "something like this but gentler"
  - "more energetic"
  - "less dramatic"
  - "slower", "faster", "more dreamy"
  - "that's too intense", "that's too dramatic"
- Refinements of previous searches with mood/character descriptors

Use vector_search when semantic similarity matching is needed. IMPORTANT: Even with vector_search, extract and include any categorical filters from the conversation history.

Examples:
- "Something peaceful and contemplative" → vector_search with filters: {}
- "Music that feels like autumn rain" → vector_search with filters: {}
- After discussing Classical period: "something dreamy" → vector_search with filters: { period: "Classical" }
- After filtering to Chamber music: "more energetic" → vector_search with filters: { genre: "Chamber Music" }
- "A sad Romantic piano piece" → vector_search, filters: { period: "Romantic", genre: "Solo", instrument: "piano" }
- "Classical period wind quintet that's dreamy" → vector_search with filters: { period: "Classical", genre: "Chamber Music", instrument: ["wind quintet"] }


3. "continue" (RARE – only meta / non-search)
Return "continue" ONLY if the user is clearly not expressing search intent:
- Asking for clarification, background, or context ABOUT MUSIC ITSELF (not asking for works):
  - "Who was she?"
  - "What defines the Romantic period?"
  - "What is a string quartet?"
- Giving a non-directive reaction without implying they want different music:
  - "Thanks, that's helpful."
  - "Interesting!"
- Discussing music theory, history, or meta UX without implying retrieval:
  - "How do you categorize chamber music?"
  - "How does your search system work?"

IMPORTANT:
- If the user comments on the CHARACTER of previous results (e.g. "That's too dramatic", "too intense", "can we make it more dreamy?", "that's a bit heavy") you MUST treat this as a refinement and return "vector_search" using all previous filters plus the new mood constraint.
  - Example:
    - Previous context: Romantic piano works
    - User: "That's too dramatic."
    - → action: "vector_search", filters: { period: "Romantic", instrument: "piano" }
- Once any filter has appeared earlier in the conversation, default to "sql_search" or "vector_search" rather than "continue" unless the user is clearly asking for historical/theoretical info or closing the topic.


Filter Extraction (CRITICAL)
-----------------------------
When action = "sql_search" OR "vector_search", ALWAYS extract filters from the ENTIRE CONVERSATION HISTORY, not just the latest message.

ACCUMULATION RULES:
- Review the full conversation to identify all filters mentioned at any point.
- Filters persist across the conversation unless the user explicitly changes them (e.g., "actually, Romantic period instead").
- If the user previously mentioned "Classical period" and now says "something dreamy", extract period: "Classical".
- If they said "Chamber music" earlier and now add "wind quintet", extract both genre: "Chamber Music" and instrument: ["wind quintet"].
- When the user refines ("more dreamy", "something slower", "less dramatic"), keep ALL previous filters and trigger vector_search.

Available filter fields (all can be strings or arrays when multiple values requested):
**CRITICAL: Match exact casing from enums below - case-sensitive!**

- composer: Full composer name(s) (e.g., "Clara Schumann", ["Clara Schumann", "Fanny Mendelssohn"])

- period: MUST be EXACTLY one of (case-sensitive):
  "Medieval", "Renaissance", "Baroque", "Classical", "Early Romantic", "Late Romantic", "Romantic", "20th Century", "Contemporary"
  Can be array when user says "also include" or "and" (e.g., ["20th Century", "Late Romantic"])

- genre: MUST be EXACTLY one of (case-sensitive, note capitalization):
  "Chamber Music", "Choral", "Opera", "Orchestral", "Solo", "Vocal"
  ⚠️ NOTE: "Chamber Music" has capital M, not "Chamber music"
  Can be array for multiple genres (e.g., ["Chamber Music", "Solo"])

- subgenre: MUST be EXACTLY one of (case-sensitive):
  "Canon", "Fugue", "Children's Opera", "Dance", "Mazurka", "Quintet", "Motet", "Opera Seria", "Madrigal", "Symphonic poem", "Anthem", "Etude", "Lieder", "Suite", "Concerto grosso", "Bagatelle", "Concerto", "Prelude", "Serenade", "Trio", "Duo", "Tone poem", "Grand Opera", "Waltz", "Polonaise", "Quartet", "Symphony", "Ballet", "Comic Opera", "Sonata", "Opera Buffa", "Impromptu", "Cantata", "Ensemble", "Chorale", "Scherzo", "Requiem", "Mass", "Masque", "Divertimento", "Minuet"
  Can be array for multiple subgenres (e.g., ["Quartet", "Trio"])

- instrument: Any instrument(s) or ensemble mentioned (string, array, or free-text like "piano", "string quartet", ["violin", "cello"], ["wind quintet"])

IMPORTANT Mapping Rules (use EXACT casing shown):
- "string quartet" → genre: "Chamber Music", subgenre: "Quartet", instrument: "string"
- "wind quintet" → genre: "Chamber Music", subgenre: "Quintet", instrument: ["wind quintet"]
- "piano trio" → genre: "Chamber Music", subgenre: "Trio", instrument: "piano"
- "piano sonata" → genre: "Solo", subgenre: "Sonata", instrument: "piano"
- "opera" → genre: "Opera" (may include subgenre if specific type mentioned)
- "symphony" → genre: "Orchestral", subgenre: "Symphony"
- "chamber music" → genre: "Chamber Music" (capital M!)
- Period synonyms: "late 19th century" = "Late Romantic", "1900s" = "20th Century", "modern" = "Contemporary"


CONVERSATION-BASED FILTER ACCUMULATION EXAMPLES:

Conversation 1:
User: "Classical period"
Assistant: "What instrumentation..."
User: "Chamber music"
Assistant: "What size..."
User: "Wind quintet"
Assistant: "What difficulty..."
User: "these are great but can you find something dreamy?"
→ action: "vector_search", filters: { period: "Classical", genre: "Chamber Music", instrument: ["wind quintet"] }

Conversation 2:
User: "Romantic piano music"
Assistant: "What type..."
User: "something melancholic"
→ action: "vector_search", filters: { period: "Romantic", instrument: "piano" }

Conversation 3:
User: "Show me Baroque concertos"
Assistant: [shows results]
User: "actually, make it Romantic instead"
→ action: "sql_search", filters: { period: "Romantic", subgenre: "Concerto" }
(Note: "Baroque" is replaced by "Romantic" due to explicit override)

Conversation 4 (Incremental Search - AFTER seeing results):
User: "20th Century"
Assistant: "What instrumentation..."
User: "something featuring cello"
Assistant: "What genre..."
User: "Chamber music"
Assistant: [shows 20th Century cello chamber music results]
User: "can you also include options from the late romantic period?"
→ action: "sql_search", filters: { period: "Late Romantic", instrument: "cello", genre: "Chamber Music" }
(Note: Search ONLY Late Romantic to add to existing results. Frontend will merge both result sets)

Conversation 5 (Incremental Search - AFTER seeing results):
User: "Show me works by Clara Schumann"
Assistant: [shows Clara Schumann results]
User: "can you also include Fanny Mendelssohn?"
→ action: "sql_search", filters: { composer: "Fanny Mendelssohn" }
(Note: Search ONLY Fanny to add to existing Clara results. Frontend will combine them)

Conversation 6 (Multi-value Initial Search - BEFORE any results):
User: "Show me works by Clara Schumann and Fanny Mendelssohn"
→ action: "sql_search", filters: { composer: ["Clara Schumann", "Fanny Mendelssohn"] }
(Note: User mentioned both upfront, so search both in one query using array)

Conversation 7 (Multi-value Initial Search):
User: "I want to see Baroque and Classical period concertos"
→ action: "sql_search", filters: { period: ["Baroque", "Classical"], subgenre: "Concerto" }
(Note: Both periods mentioned initially, search together)


Context Awareness
-----------------
- ACCUMULATE filters from the entire conversation history unless explicitly overridden.
- If the user just received search results and refines (e.g., "only by Mendelssohn", "maybe something slower", "more dreamy"), treat this as a NEW search that INCLUDES all previous filters PLUS the new constraint.
- "also include" / "let's include" pattern:

  A) After receiving search results (user wants to ADD more results):
  - User says "also include Late Romantic" or "let's include Fanny Mendelssohn" AFTER seeing results
  - This means: Search ONLY for the NEW filter value, keeping other context filters
  - The frontend will combine the old and new results
  - Example: After showing "20th Century + cello" results:
    - User: "can you also include options from the late romantic period?"
    - Return ONLY: { period: "Late Romantic", instrument: "cello", genre: "Chamber Music" }

  B) Before any search (user specifying initial criteria):
  - User mentions multiple values upfront: "Show me 20th Century AND Late Romantic music"
  - This means: Search for BOTH in one query using array
  - Return: { period: ["20th Century", "Late Romantic"] }

- Extract filters even from conversational messages if search intent is clear.
- When a period is mentioned colloquially (e.g., "Baroque", "modern times"), map it to the closest valid period enum.
- When a composer is mentioned by last name only, infer the full name if commonly known (e.g., "Debussy" → "Claude Debussy", "Bach" → "Johann Sebastian Bach").
- Track filter state across messages: once mentioned, filters persist until explicitly changed.
- "instead" or "actually" signals replacement: "Romantic instead" replaces previous period, not adds to it.


Output Format
-------------
Return JSON only:

{
  "action": "sql_search" | "vector_search" | "continue",
  "reason": "<brief explanation>",
  "filters": {
    "composer"?: string | string[],
    "period"?: string | string[],
    "genre"?: string | string[],
    "subgenre"?: string | string[],
    "instrument"?: string | string[]
  }
}

IMPORTANT:
- If action is "sql_search", filters MUST be provided with at least one field.
- If action is "vector_search", filters SHOULD include any categorical constraints from the conversation history (period, genre, instrument, etc.) to narrow the semantic search.
- If action is "continue", filters should be omitted.
- Include ALL filter fields that have been mentioned anywhere in the conversation history, not just the latest message.
- When uncertain whether to "continue" or search, choose "sql_search" or "vector_search" (whichever better matches the query type).

`;

export const POST: RequestHandler = async ({ request }) => {
    const body: ActionDecisionInfo = await request.json();

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