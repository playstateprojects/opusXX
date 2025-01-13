import { json } from '@sveltejs/kit';
import { CF_ACCOUNT_ID, CF_AI_TOKEN } from '$env/static/private';
import { AiRole, type AiMessage } from '$lib/types.js';
import { chat } from '$lib/openai.js';

export async function POST({ request }) {
    const body = await request.json();

    try {

        const data = await chat(body.messages)
        console.log("data", data)


        return json({ data: data.content });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}