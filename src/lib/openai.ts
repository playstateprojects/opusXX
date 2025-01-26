import { OPENAI_API_KEY } from '$env/static/private';
import OpenAI from 'openai';
import type { AiMessage } from './types';
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
import { zodResponseFormat } from "openai/helpers/zod";
import { Composer, ComposerList } from './zodDefinitions';

// const aiModel = "gpt-4o-mini-2024-07-18"
const aiModel = "gpt-4o-2024-08-06"

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
        model: aiModel,
        messages: messages
    });
    if (response && response.choices[0].message) {
        return response.choices[0].message
    } else {
        return { error: true }
    }
}

const extractComposer = async (text: string): Promise<{ data?: Composer; error?: string }> => {
    try {
        const response = await openai.beta.chat.completions.parse({
            model: aiModel,
            messages: [
                { role: "system", content: "Extract data from the provided text related to the composer and their works. Ensure that the short Description is a summation of around 250 characters." },
                { role: "user", content: text }
            ],
            response_format: zodResponseFormat(Composer, "composer")
        });

        console.log("Composer response:", response);

        const parsedData = response?.choices?.[0]?.message?.parsed;
        if (!parsedData) {
            return { error: "Failed to extract composer data" };
        }

        return { data: parsedData };
    } catch (error) {
        console.error("extractComposer error:", error);
        return { error: "An unexpected error occurred" };
    }
};
const extractComposerList = async (text: string) => {
    console.log("getting from openApi")
    const response = await openai.beta.chat.completions.parse({
        model: aiModel,
        messages: [
            {
                role: "system", content: `You will be provided a content from a page that lists links to entries of people. 
                Analyse the data proided and extract all links related to pages about people. 
               ` },
            { role: "user", content: text }
        ],
        response_format: zodResponseFormat(ComposerList, "composerList")
    })
    if (response && response.choices[0].message && response.choices[0].message.parsed) {
        return response.choices[0].message.parsed
    } else {
        return { error: true }
    }
}

export { getEmbedding, chat, extractComposer, extractComposerList }