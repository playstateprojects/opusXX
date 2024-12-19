import { json } from '@sveltejs/kit';
import { CF_ACCOUNT_ID, CF_AI_TOKEN } from '$env/static/private';
import { AiRole, type AiMessage } from '$lib/types.js';

export async function POST({ request }) {
    const body = await request.json();
    const model = '@cf/meta/llama-2-7b-chat-fp16';
    try {
        const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${model}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CF_AI_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        const message: string = data.result.response
        const result: AiMessage = {
            role: AiRole.Assistant,
            content: message
        }
        return json(result);
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}