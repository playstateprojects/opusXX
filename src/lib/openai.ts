import { OPENAI_API_KEY } from '$env/static/private';
import OpenAI from 'openai';
import type { AiMessage } from './types';
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
import { zodResponseFormat } from "openai/helpers/zod";
import { Composer } from './zodDefinitions';

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

const extract = async (text: string) => {
    const response = await openai.beta.chat.completions.parse({
        model: "gpt-4o-2024-08-06",
        messages: [
            { role: "system", content: "Extract data from the provided text related to the composer and their works." },
            { role: "user", content: text }
        ],
        response_format: zodResponseFormat(Composer, "composer")

    })
    console.log("rrrrrrr", response)
    if (response && response.choices[0].message && response.choices[0].message.parsed) {
        return response.choices[0].message.parsed
    } else {
        return { error: true }
    }
}

export { getEmbedding, chat, extract }