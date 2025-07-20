import { json } from '@sveltejs/kit';
import OpenAI from 'openai';

export async function POST({ request, platform }) {
    const { query, topK = 5 } = await request.json();

    const openai = new OpenAI({ apiKey: platform.env.OPENAI_API_KEY });

    const embeddingRes = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: query
    });

    const xq = embeddingRes.data[0].embedding;

    const res = await fetch(`https://opusxx-a805eee.svc.aped-4627-b74a.pinecone.io/query`, {
        method: 'POST',
        headers: {
            'Api-Key': platform.env.PINECONE_API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ vector: xq, topK, includeMetadata: true })
    }).then(r => r.json());

    return json(res.matches);
}