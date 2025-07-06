import { json } from '@sveltejs/kit';
import { jsonChat } from '$lib/openai.js';

export async function POST({ request }) {
    const body = await request.json();

    try {

        const data = await jsonChat(body.messages)
        console.log(data)


        return json(data);
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}