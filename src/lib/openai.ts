import { OPENAI_API_KEY } from '$env/static/private';
import OpenAI from 'openai';
import type { AiMessage } from './types';
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const getEmbedding = async (text: string) => {
    const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: "Your text string goes here",
        encoding_format: "float",
    });
    return embedding
}
const chat = async (messages: AiMessage[]) => {
    const response = await openai.chat.completions.create({
        model: "chatgpt-4o-latest",
        messages: messages
    });
    if (response && response.choices[0].message) {
        return response.choices[0].message
    } else {
        return { error: true }
    }
}

export { getEmbedding, chat }