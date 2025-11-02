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
2. Extract ALL implicit and explicit filters from the ENTIRE CONVERSATION HISTORY when search is triggered

CRITICAL:
- Filters should be extracted liberally whenever they are mentioned or implied, even if not explicitly stated as search criteria.
- ACCUMULATE filters from the entire conversation - if the user mentioned "Classical period" earlier and now says "something dreamy", include BOTH period: "Classical" AND perform a vector search for "dreamy"
- When a user refines their search (e.g., "something more dreamy"), preserve all previously mentioned filters while adding the new constraint


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
- "Romantic period chamber music" → sql_search (period: "Romantic", genre: "Chamber Music")
- "String quartets by Beethoven" → sql_search (composer: "Ludwig van Beethoven", genre: "Chamber Music", subgenre: "Quartet")
- "Baroque violin concertos" → sql_search (period: "Baroque", subgenre: "Concerto", instrument: "violin")
- "Something by Debussy for piano" → sql_search (composer: "Claude Debussy", instrument: "piano")
- "20th century symphonies" → sql_search (period: "20th Century", genre: "Orchestral", subgenre: "Symphony")


2. "vector_search" (Use for semantic/descriptive queries)
Return "vector_search" when the user's message is DESCRIPTIVE, SEMANTIC, or MOOD-BASED:
- Descriptive mood/character ("sad", "joyful", "peaceful", "dramatic", "heroic", "dreamy")
- Abstract concepts ("something melancholic", "uplifting music")
- Comparative language ("something like this but gentler", "more energetic")
- Refinements of previous searches with mood/character descriptors

Use vector_search when semantic similarity matching is needed. IMPORTANT: Even with vector_search, extract and include any categorical filters from the conversation history.

Examples:
- "Something peaceful and contemplative" → vector_search with filters: {}
- "Music that feels like autumn rain" → vector_search with filters: {}
- After discussing Classical period: "something dreamy" → vector_search with filters: { period: "Classical" }
- After filtering to Chamber music: "more energetic" → vector_search with filters: { genre: "Chamber Music" }
- "Classical period wind quintet that's dreamy" → vector_search with filters: { period: "Classical", genre: "Chamber Music", instrument: ["wind quintet"] }


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
When action = "sql_search" OR "vector_search", ALWAYS extract filters from the ENTIRE CONVERSATION HISTORY, not just the latest message.

ACCUMULATION RULES:
- Review the full conversation to identify all filters mentioned at any point
- If the user previously mentioned "Classical period" and now says "something dreamy", extract period: "Classical"
- If they said "Chamber music" earlier and now add "wind quintet", extract both genre: "Chamber Music" and instrument: ["wind quintet"]
- Filters persist across the conversation unless the user explicitly changes them (e.g., "actually, Romantic period instead")
- When the user refines ("more dreamy", "something slower"), keep all previous filters and trigger vector_search

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

Filter Extraction Examples:

User: "Show me a string quartet"
→ action: "sql_search", filters: { genre: "Chamber Music", subgenre: "Quartet", instrument: "string" }

User: "Something by Debussy for piano"
→ action: "sql_search", filters: { composer: "Claude Debussy", instrument: "piano" }

User: "I want Baroque opera"
→ action: "sql_search", filters: { period: "Baroque", genre: "Opera" }

User: "A sad Romantic piano piece"
→ action: "vector_search", filters: { period: "Romantic", genre: "Solo", instrument: "piano" }

User: "What about a symphony from the 20th century?"
→ action: "sql_search", filters: { period: "20th Century", genre: "Orchestral", subgenre: "Symphony" }

User: "Chamber music for flute and harp"
→ action: "sql_search", filters: { genre: "Chamber Music", instrument: ["flute", "harp"] }

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
- ACCUMULATE filters from the entire conversation history unless explicitly overridden
- If the user just received search results and refines (e.g., "only by Mendelssohn", "maybe something slower", "more dreamy"), treat this as a NEW search that INCLUDES all previous filters PLUS the new constraint

- **CRITICAL: "also include" / "let's include" pattern** - Two different behaviors based on context:

  **A) After receiving search results** (user wants to ADD more results):
  - User says "also include Late Romantic" or "let's include Fanny Mendelssohn" AFTER seeing results
  - This means: Search ONLY for the NEW filter value, keeping other context filters
  - The frontend will combine the old and new results
  - Example: After showing "20th Century + cello" results:
    - User: "can you also include options from the late romantic period?"
    - Return ONLY: { period: "Late Romantic", instrument: "cello" } (NOT an array)
    - This will search for Late Romantic cello works to ADD to the existing 20th Century results

  **B) Before any search** (user specifying initial criteria):
  - User mentions multiple values upfront: "Show me 20th Century AND Late Romantic music"
  - This means: Search for BOTH in one query using array
  - Return: { period: ["20th Century", "Late Romantic"] }

- Extract filters even from conversational messages if search intent is clear
- When a period is mentioned colloquially (e.g., "Baroque", "modern times"), map it to the closest valid period enum
- When a composer is mentioned by last name only, infer the full name if commonly known (e.g., "Debussy" → "Claude Debussy", "Bach" → "Johann Sebastian Bach")
- Track filter state across messages: once mentioned, filters persist until explicitly changed
- "instead" or "actually" signals replacement: "Romantic instead" replaces previous period, not adds to it


Output Format
-------------
Return JSON only:

{
  "action": "sql_search" | "vector_search" | "continue",
  "reason": "<brief explanation>",
  "filters": {
    "composer"?: string | string[],      // Array when multiple composers requested (e.g., "also include Fanny")
    "period"?: string | string[],        // Array when "also include" another period; MUST match period enum
    "genre"?: string | string[],         // Array when multiple genres requested; MUST match genre enum
    "subgenre"?: string | string[],      // Array when multiple subgenres requested; MUST match subgenre enum
    "instrument"?: string | string[]     // Array when multiple instruments mentioned
  }
}

IMPORTANT:
- If action is "sql_search", filters MUST be provided with at least one field
- If action is "vector_search", filters SHOULD include any categorical constraints from the conversation history (period, genre, instrument, etc.) to narrow the semantic search
- If action is "continue", filters should be omitted
- Include ALL filter fields that have been mentioned anywhere in the conversation history, not just the latest message

**Array vs Single Value Decision:**
- Use arrays ONLY when user mentions multiple values INITIALLY/UPFRONT (e.g., "Baroque and Classical", "Clara and Fanny")
- DO NOT use arrays when user says "also include" AFTER seeing results - instead return ONLY the NEW filter value
- The distinction:
  - "Show me Baroque and Classical works" → period: ["Baroque", "Classical"] (initial multi-value)
  - [After seeing Baroque results] "also include Classical" → period: "Classical" (incremental, frontend merges)

- Only exclude filters if the user explicitly overrides them (e.g., "actually, Romantic instead of Classical")
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