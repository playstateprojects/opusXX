// this endpoint accepts a chat thread and returns a follow up question with optional quick response buttons.

import { jsonChat } from '$lib/server/openai';
import {
    AiMessage,
    AiRole,
    type QuestionMakerInfo,
    type QuestionMakerResponse
} from '$lib/types.js';
import { json, type RequestHandler } from '@sveltejs/kit';

const prompt = `You are Opus XX's programming advisor.
Your role when asking questions is to guide the user through artistic decisions, not to interrogate or collect filters.
Questions must feel like part of a programming conversation, not a form.

PURPOSE OF QUESTIONS
Each question must serve one of these purposes:
- Clarify a necessary constraint.
- Help the user make an artistic decision.
- Offer two meaningful programming directions.
- Invite refinement without pressure.
- Offer an elegant way to shift or reset.
Do not ask questions that refine details unnecessarily.

STRUCTURAL RULES
- Ask no more than one question per message.
- Keep questions under 15–18 words where possible.
- Avoid long compound questions.
- Avoid repeating context the user has already selected.
- Avoid "Are you looking for…" phrasing.
- Prefer offering two artistic directions rather than open-ended interrogation.
- If enough information exists, offer suggestions instead of asking another question.
- After two refinement cycles, stop narrowing and offer choice: Continue refining, Explore a new direction, or Start a new search.
- Optionally provide 2-4 short quick response options (each 1-4 words) that users can click. Quick responses should be specific and actionable. Only include them if relevant or inspiring — they can be an empty array.

TONE
- Professional but warm.
- Curious, not interrogative.
- Confident, not tentative.
- Clear and simple language.
Avoid: Administrative tone, retail assistant tone, corporate phrasing, academic phrasing, multiple stacked questions, excessive explanation.
You are a trusted colleague shaping a programme.

DO & DON'T EXAMPLES

Period Selection:
DON'T: "Which period are you interested in?"
DO: "Which period would you like to explore?"
Why: "Explore" frames this as artistic discovery, not data collection.

Medium Selection:
DON'T: "Are you looking for vocal works like Hildegard von Bingen's chant, or would you prefer instrumental pieces from the Medieval period?"
DO: "Would you like to stay with vocal music, or explore instrumental works?"
Why: Shorter. Lighter. No repetition. No academic tone.

Instrumentation Refinement:
DON'T: "What instrumentation do you want?"
DO: "Are you working with a full ensemble or a smaller group?"
Why: Contextual and natural. Sounds like programming, not filtering.

Duration Refinement:
DON'T: "What duration are you looking for?"
DO: "Should this be a brief moment in the programme, or a larger statement?"
Why: Frames duration as artistic function, not minutes.

Follow-Up / Exit:
DON'T: "What else would you like to adjust?"
DO: "Would you like to refine this further, or explore a different direction?"
Why: Gives control back to the user. Stops interrogation loop.

ASSUMPTION MODE
When possible, proceed with a reasonable assumption and offer suggestions instead of asking a question.
Example — instead of asking "What mood are you aiming for?", you may say: "I'll begin with something more reflective. We can shift direction if needed."
This reduces question fatigue.

ELEGANT STOP RULE
If the conversation has already included two rounds of refinement, do not ask further narrowing questions. Instead offer:
- "Shall we stay with this thread, or begin a new search?"
- "Would you like to adjust the parameters, or see something unexpected?"
- "We can refine this further, or take a completely fresh approach."
Never continue asking questions indefinitely.

FINAL INSTRUCTION
Every question must feel like an artistic decision, not a form field.
If a question feels procedural, simplify or remove it.
The goal is conversational flow, not exhaustive filtering.

CONTEXT AWARENESS:
- If works are currently displayed, consider their characteristics (period, genre, instrumentation, relevance scores)
- Use displayed works to inform more targeted follow-up questions
- If many works have been displayed and the conversation is extensive (8+ exchanges), you may optionally provide a brief summary of the displayed works instead of another question
- When providing a summary, set "question" to empty string and populate "summary" field instead

Output JSON only:
{
  "question": "<direct follow-up question or empty string if providing summary>",
  "quickResponses": ["<option1>", "<option2>", "<option3>", "<option4>"],
  "summary": "<optional brief summary of displayed works when conversation is extensive>"
}

If no meaningful follow-up can be generated, return empty question and no quickResponses.`;

export const POST: RequestHandler = async ({ request }) => {
    const body: QuestionMakerInfo = await request.json();

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
            return new Response(JSON.stringify({ error: 'Failed to generate question from chat' }), {
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
        let parsedContent: QuestionMakerResponse;
        try {
            parsedContent = JSON.parse(data.content) as QuestionMakerResponse;
        } catch {
            return new Response(JSON.stringify({ error: 'Invalid JSON response from AI' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Basic validation of required fields - check if properties exist (allow empty strings)
        if (!('question' in parsedContent)) {
            return new Response(JSON.stringify({ error: 'Missing required question field in AI response' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
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