import { getEmbedding } from '$lib/openai.js';


export async function POST({ request }) {
    const body = await request.json();
    const embedding = await getEmbedding(body.text);
    console.log(embedding);
    return new Response(JSON.stringify({ error: 'Not implemented', body, embedding }));
}