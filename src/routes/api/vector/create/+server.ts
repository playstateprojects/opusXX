import OpenAI from "openai";
import { OPENAI_API_KEY } from '$env/static/private';
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });


export async function POST({ request }) {
    const body = await request.json();
    const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: "Your text string goes here",
        encoding_format: "float",
    });
    console.log(embedding);
    return new Response(JSON.stringify({ error: 'Not implemented', body, embedding }));
}