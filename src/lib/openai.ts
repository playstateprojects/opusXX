import { OPENAI_API_KEY } from '$env/static/private';
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const getEmbedding = async (text: string) => {
    const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: "Your text string goes here",
        encoding_format: "float",
    });
    return embedding
}

export { getEmbedding }