import { getEmbedding } from '$lib/openai.js';
import type { Embedding } from 'openai/resources/embeddings.mjs';
import type { RequestEvent } from '../$types.js';

interface metaEmbedding {
    values: number[];
    metadata: {
        sourceUrl: string;
    }
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


export async function POST({ request, platform }: RequestEvent) {
    const body = await request.json();
    console.log("Body:", body);
    const embedding = await getEmbedding(body.text);
    let embeddings: metaEmbedding[] = embedding.data.map((item) => { return { id: generateUUID(), values: item.embedding, metadata: { sourceUrl: "xxx" } } });

    // console.log("Platform:", platform);
    // console.log("VECTORIZE Binding:", platform?.env?.VECTORIZE);
    // console.log("Embeddings:", embeddings);
    // console.log("First Embedding:", embeddings[0]?.embedding);
    try {
        const result = await platform?.env?.VECTORIZE.insert(embeddings);
        console.log("rrr", result);
        const matches = await platform?.env.VECTORIZE.query(embeddings[0]?.values, {
            topK: 3,
            returnValues: true,
            returnMetadata: "all",
        });
        console.log("mmmmm", matches)
        return new Response(JSON.stringify({ success: true, result, matches }), {
            status: 200,
        });
    } catch (error) {
        console.log(error);
        return new Response(JSON.stringify({ success: false, error }), {
            status: 500,
        });
    }

}