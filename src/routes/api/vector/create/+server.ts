import OpenAI from "openai";
const openai = new OpenAI();


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