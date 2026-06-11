import { OPENAI_API_KEY, DEEPSEEK_API_KEY } from '$env/static/private';
import OpenAI from 'openai';
import type { AiMessage } from '../types';
import { zodResponseFormat } from "openai/helpers/zod";
import { ComposerExtractSchema, ComposerList, WorkListSchema, type Composer } from '../types';

const useDeepseek = true;
// Default ("pro") model used everywhere. FLASH_MODEL is a faster/cheaper tier for
// high-volume, per-item calls (e.g. per-work insights). Confirm the exact flash
// model id with DeepSeek if requests start 404-ing on an unknown model.
export const PRO_MODEL = "deepseek-v4-pro";
export const FLASH_MODEL = "deepseek-v4-flash";
let aiModel = PRO_MODEL;
let openai: OpenAI;

if (!useDeepseek) {
    openai = new OpenAI({ apiKey: OPENAI_API_KEY });
} else {
    aiModel = PRO_MODEL;
    if (!DEEPSEEK_API_KEY) {
        throw new Error('DEEPSEEK_API_KEY is required when useDeepseek is true');
    }
    openai = new OpenAI({ baseURL: 'https://api.deepseek.com', apiKey: DEEPSEEK_API_KEY });
}

// Errors worth retrying: network blips and request timeouts. The OpenAI SDK throws
// named error classes (APITimeoutError / APIConnectionError) which a substring check
// on `message` alone would miss, so check both.
const isRetryableError = (error: any): boolean =>
    error?.name === 'APITimeoutError' ||
    error?.name === 'APIConnectionError' ||
    error?.name === 'APIConnectionTimeoutError' ||
    error?.message?.includes('fetch') ||
    error?.message?.includes('Premature close') ||
    error?.message?.toLowerCase?.().includes('timeout') ||
    error?.code === 'ECONNRESET' ||
    error?.code === 'ETIMEDOUT';

const getEmbedding = async (text: string) => {
    const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        encoding_format: "float",
    });
    return embedding
}

const chat = async (messages: AiMessage[], retries = 2) => {
    let lastError: any;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await openai.chat.completions.create(
                {
                    model: aiModel,
                    messages: messages
                },
                { timeout: 60000 }
            );

            console.log("ch12", response)
            if (response && response.choices[0].message) {
                return response.choices[0].message
            } else {
                return { error: true }
            }
        } catch (error: any) {
            lastError = error;

            // Check if it's a network/connection error worth retrying
            const isNetworkError = error.message?.includes('fetch') ||
                error.message?.includes('Premature close') ||
                error.code === 'ECONNRESET' ||
                error.code === 'ETIMEDOUT';

            if (isNetworkError && attempt < retries) {
                console.log(`Network error on attempt ${attempt + 1}, retrying...`);
                // Exponential backoff: wait 1s, then 2s
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                continue;
            }

            // Don't retry on other errors or if max retries reached
            break;
        }
    }

    // All retries failed
    console.error('chat failed after retries:', lastError);
    return { error: true, message: lastError?.message || 'Unknown error' }
}

const jsonChat = async (
    messages: AiMessage[],
    options: { model?: string; retries?: number; timeoutMs?: number } = {}
) => {
    const { model = aiModel, retries = 2, timeoutMs = 60000 } = options;
    let lastError: any;

    // Thinking is always disabled — none of our JSON tasks need chain-of-thought and
    // it roughly doubles latency. DeepSeek's hybrid models take this `thinking` param;
    // the OpenAI SDK doesn't type it, so build the body and cast.
    const body = {
        model,
        messages,
        response_format: { type: 'json_object' as const },
        thinking: { type: 'disabled' }
    } as OpenAI.ChatCompletionCreateParamsNonStreaming;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            // `timeout` is a per-request SDK option (2nd arg), NOT a completion body
            // param — passing it in the body does nothing.
            const response = await openai.chat.completions.create(body, { timeout: timeoutMs });

            if (response && response.choices[0].message) {
                return response.choices[0].message
            } else {
                return { error: true }
            }
        } catch (error: any) {
            lastError = error;

            if (isRetryableError(error) && attempt < retries) {
                console.log(`Retryable error on attempt ${attempt + 1}, retrying...`, error?.message);
                // Exponential backoff: wait 1s, then 2s
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                continue;
            }

            // Don't retry on other errors or if max retries reached
            break;
        }
    }

    // All retries failed
    console.error('jsonChat failed after retries:', lastError);
    return { error: true, message: lastError?.message || 'Unknown error' }
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