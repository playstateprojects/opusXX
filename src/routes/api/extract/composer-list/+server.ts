import { json } from '@sveltejs/kit';
import { extractComposerList } from '$lib/server/openai';

export async function POST({ request }) {
    const body = await request.json();

    try {
        const data = await extractComposerList(body.text);
        return json(data);
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}