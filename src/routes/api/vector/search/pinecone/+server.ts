import { json } from '@sveltejs/kit';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST({ request }) {
    const { query, topK = 5 } = await request.json();

    // 1. Turn the string into the same vector space you indexed with
    const embeddingRes = await openai.embeddings.create({
        model: 'text-embedding-3-small', // or whatever you used when you upserted
        input: query
    });
    const xq = embeddingRes.data[0].embedding;

    // 2. Query the index
    const index = pc.Index(process.env.PINECONE_INDEX!);
    const res = await index.query({
        vector: xq,
        topK,
        includeMetadata: true
    });

    // 3. Send back the matches
    return json(res.matches);
}