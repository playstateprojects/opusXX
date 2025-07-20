import { json } from '@sveltejs/kit';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

async function pineconeQuery(vector: number[]) {
    const url = `https://opusxx-a805eee.svc.aped-4627-b74a.pinecone.io/query`;
    return fetch(url, {
        method: 'POST',
        headers: {
            'Api-Key': process.env.PINECONE_API_KEY!,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ vector, topK: 8, includeMetadata: true })
    }).then(r => r.json());
}

export async function POST({ request }) {
    const { query, topK = 5 } = await request.json();
    // 1. Turn the string into the same vector space you indexed with
    const embeddingRes = await openai.embeddings.create({
        model: 'text-embedding-3-small', // or whatever you used when you upserted
        input: query
    });
    const xq = embeddingRes.data[0].embedding;

    // 2. Query the index

    const res = await pineconeQuery(xq);


    // 3. Send back the matches
    return json(res.matches);
}