import { OPENAI_API_KEY, DEEPSEEK_API_KEY } from '$env/static/private';
import OpenAI from 'openai';
import type { AiMessage } from '../types';
import { zodResponseFormat } from "openai/helpers/zod";
import { ComposerExtractSchema, ComposerList, WorkListSchema, type Composer } from '../types';

const useDeepseek = true;
let aiModel = "deepseek-chat"
let openai: OpenAI;

if (!useDeepseek) {
    openai = new OpenAI({ apiKey: OPENAI_API_KEY });
} else {
    aiModel = "deepseek-chat";
    if (!DEEPSEEK_API_KEY) {
        throw new Error('DEEPSEEK_API_KEY is required when useDeepseek is true');
    }
    openai = new OpenAI({ baseURL: 'https://api.deepseek.com', apiKey: DEEPSEEK_API_KEY });
}

const getEmbedding = async (text: string) => {
    const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        encoding_format: "float",
    });
    return embedding
}

const chat = async (messages: AiMessage[]) => {
    const response = await openai.chat.completions.create({
        model: aiModel,
        messages: messages
    });
    console.log("ch12", response)
    if (response && response.choices[0].message) {
        return response.choices[0].message
    } else {
        return { error: true }
    }
}

const jsonChat = async (messages: AiMessage[]) => {
    const response = await openai.chat.completions.create({
        model: aiModel,
        messages: messages,
        response_format: {
            'type': 'json_object'
        }
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
                {
                    role: "system", content: `Extract data from the provided text related to the composer and their works. 
                    Ensure that the short Description is a summation of around 250 characters. `
                },
                { role: "user", content: text }
            ],
            response_format: zodResponseFormat(ComposerExtractSchema, "composer")
        });

        console.log("Composer response:", response);

        const parsedData = response?.choices?.[0]?.message?.parsed;
        if (!parsedData) {
            return { error: "Failed to extract composer data" };
        }
        console.log("Composer data:", parsedData);
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

const extractWorkList = async (text: string) => {
    try {
        const response = await openai.beta.chat.completions.parse({
            model: aiModel,
            messages: [
                {
                    role: "system", content: `You will be provided content that is from a catalogue on classical music works. 
                    Please extract information for each described work.
                    Raw content should include all text from the original source.`
                },
                { role: "user", content: text }
            ],
            response_format: zodResponseFormat(WorkListSchema, "workList")
        });

        console.log("Worklist response: ", response);

        const parsedData = response?.choices?.[0]?.message?.parsed;
        if (!parsedData) {
            return { error: "Failed to extract work data" };
        }
        console.log("Work data:", parsedData);
        return { data: parsedData };
    } catch (error) {
        console.error("extractWork error:", error);
        return { error: "An unexpected error occurred" };
    }
}

export { getEmbedding, chat, jsonChat, extractComposer, extractComposerList, extractWorkList }