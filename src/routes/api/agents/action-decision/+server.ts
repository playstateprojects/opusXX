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
import { json, type RequestHandler } from '@sveltejs/kit';
import { countAssistantQuestions, MAX_CLARIFYING_QUESTIONS } from '$lib/utils/stringUtils';

const buildPrompt = (taxonomy: Taxonomy) => `🎼 MUSICAL CHAT CLASSIFIER & FILTER EXTRACTION PROMPT (v2)
------------------------------------------------------

Task:
Analyze the latest user message in the context of the conversation and currently displayed works (if any) to:
1. Decide whether to initiate a SQL search, vector search, or continue conversation
2. Extract ALL implicit and explicit filters from the ENTIRE CONVERSATION HISTORY when search is triggered

GLOBAL BIAS (CRITICAL — READ THIS FIRST):
- ALWAYS prefer searching over asking more questions. Returning "continue" makes the assistant ask the user another question, so every "continue" spends one question from a HARD conversation-wide budget. The flow must never feel like an interrogation.
- QUESTION BUDGET: a "QUESTION BUDGET STATUS" section is appended after the conversation with the exact number of questions already asked. Treat that count as authoritative:
  - 0-2 questions asked: you may return "continue" to clarify a broad filter, but search as soon as you have anything workable.
  - 3-5 questions asked: wind the flow down. Return "continue" ONLY if there is genuinely nothing searchable yet; otherwise SEARCH with whatever filters you have.
  - 6+ questions asked: the budget is EXHAUSTED. You MUST return "sql_search" or "vector_search". NEVER "continue". The user can always refine or ask for more after seeing results.
- Two filters is MORE than enough to search. Never wait for three or four filters before searching.
- If the user provides TWO or more filters (e.g. "Renaissance" + "Instrumental") → SEARCH IMMEDIATELY. Do not ask further questions.
- If the user provides ONE broad filter (e.g. just "Renaissance"), you MAY ask one clarifying question (e.g. "What kind of Renaissance music?"). But once they answer, SEARCH — do not ask again.
- The user can always refine results AFTER seeing them. Showing results early is always better than asking a second clarifying question.
- If the user is talking about pieces they might want to hear / see / use (e.g. "something…", "show me…", "I want…", "too dramatic", "more dreamy"), you MUST return either "sql_search" or "vector_search", NOT "continue".
- THEMES, IMAGERY, AND MOODS ARE COMPLETE SEARCH QUERIES. If the user describes a theme, scene, mood, or evocative image (e.g. "moonlight in Gibraltar", "a stormy night", "autumn melancholy", "a walk through Paris"), return "vector_search" IMMEDIATELY with no follow-up questions. These are rich semantic queries that vector search handles perfectly. Do NOT ask for period, genre, or instrument — the theme itself is the search.
- Only return "continue" when: (a) the user has provided ONE or ZERO broad categorical filters (like just a period name) and you haven't yet asked a follow-up, or (b) the user is clearly asking meta-questions or chatting about non-search topics.

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


2. "vector_search" (Use for semantic/descriptive/thematic queries)
Return "vector_search" IMMEDIATELY (no follow-up questions needed) when the user's message contains:
- Themes, scenes, or evocative imagery ("moonlight in Gibraltar", "a walk through Paris", "spring morning")
- Descriptive mood/character ("sad", "joyful", "peaceful", "dramatic", "heroic", "dreamy")
- Abstract concepts ("something melancholic", "uplifting music")
- Programme or concert themes ("music for a candlelit dinner", "pieces about the sea")
- Comparative / refinement language:
  - "something like this but gentler"
  - "more energetic"
  - "less dramatic"
  - "slower", "faster", "more dreamy"
  - "that's too intense", "that's too dramatic"
- Refinements of previous searches with mood/character descriptors

CRITICAL: Themes and imagery are COMPLETE queries — they do NOT need period, genre, or instrument to be searchable. Search immediately.

Use vector_search when semantic similarity matching is needed. IMPORTANT: Even with vector_search, extract and include any categorical filters from the conversation history.

Examples:
- "moonlight in Gibraltar" → vector_search with filters: {} (theme is the query — search immediately, do NOT ask for period/genre)
- "music for a stormy night" → vector_search with filters: {} (search immediately)
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
  ${CANONICAL_PERIODS.map((p) => `"${p}"`).join(', ')}
  These map to composition years: Medieval (<1400), Renaissance (1400-1599), Baroque (1600-1749), Classical (1750-1819), Romantic (1820-1899), 20th Century (1900-1999), Contemporary (2000+)
  Can be array when user says "also include" or "and" (e.g., ["20th Century", "Romantic"])

- genre: MUST be EXACTLY one of (case-sensitive, note capitalization):
  ${taxonomy.genres.map((g) => `"${g.name.trim()}"`).join(', ')}
  ⚠️ NOTE: "Chamber Music" has capital M, not "Chamber music"
  Can be array for multiple genres (e.g., ["Chamber Music", "Solo"])

- subgenre: MUST be EXACTLY one of (case-sensitive):
  ${taxonomy.subgenres.map((s) => `"${s.name.trim()}"`).join(', ')}
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
- Period synonyms: "early romantic" / "late romantic" / "19th century" = "Romantic", "1900s" / "modern" / "modernist" = "20th Century", "21st century" / "music written today" = "Contemporary"
- NEVER append the word "Period" to a period value ("Romantic", not "Romantic Period")


CONVERSATION-BASED FILTER ACCUMULATION EXAMPLES:

Conversation 1 (ONE follow-up max, then SEARCH):
User: "From a specific time period"
→ action: "continue" (no specific filter yet, ask which period)
User: "Renaissance"
→ action: "continue" (one broad filter — you may ask ONE clarifying question, e.g. "What kind of Renaissance music?")
User: "Instrumental"
→ action: "sql_search", filters: { period: "Renaissance" }
(IMPORTANT: You already asked one follow-up. Now SEARCH with what you have. Do NOT ask "what ensemble?" — the user can refine after seeing results.)

Conversation 2 (Two filters = search immediately, no follow-up needed):
User: "Renaissance instrumental music"
→ action: "sql_search", filters: { period: "Renaissance" }
(Two filters given upfront — search immediately, no questions.)

Conversation 3 (Accumulate filters via refinement AFTER results):
User: "Classical period"
→ action: "continue" (one broad filter, ask one clarifying question)
User: "Chamber music"
→ action: "sql_search", filters: { period: "Classical", genre: "Chamber Music" }
(User sees results, then refines:)
User: "Wind quintet specifically"
→ action: "sql_search", filters: { period: "Classical", genre: "Chamber Music", subgenre: "Quintet", instrument: ["wind quintet"] }
User: "these are great but can you find something dreamy?"
→ action: "vector_search", filters: { period: "Classical", genre: "Chamber Music", instrument: ["wind quintet"] }

Conversation 4:
User: "Romantic piano music"
→ action: "sql_search", filters: { period: "Romantic", instrument: "piano" }
(Two filters — search immediately.)
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
User: "can you also include options from the romantic period?"
→ action: "sql_search", filters: { period: "Romantic", instrument: "cello", genre: "Chamber Music" }
(Note: Search ONLY Romantic to add to existing results. Frontend will merge both result sets)

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
  - User says "also include Romantic" or "let's include Fanny Mendelssohn" AFTER seeing results
  - This means: Search ONLY for the NEW filter value, keeping other context filters
  - The frontend will combine the old and new results
  - Example: After showing "20th Century + cello" results:
    - User: "can you also include options from the romantic period?"
    - Return ONLY: { period: "Romantic", instrument: "cello", genre: "Chamber Music" }

  B) Before any search (user specifying initial criteria):
  - User mentions multiple values upfront: "Show me 20th Century AND Romantic music"
  - This means: Search for BOTH in one query using array
  - Return: { period: ["20th Century", "Romantic"] }

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

export const POST: RequestHandler = async ({ request, locals }) => {
    const body: ActionDecisionInfo = await request.json();

    // Live genre/subgenre values from Supabase so the model only emits filter
    // values that actually exist in the database (cached, see taxonomy.ts)
    const taxonomy = await getTaxonomy(locals.supabase);
    const prompt = buildPrompt(taxonomy);

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