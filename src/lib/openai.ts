import { OPENAI_API_KEY } from '$env/static/private';
import { DEEPSEEK_API_KEY } from '$env/static/private';
import OpenAI from 'openai';
import type { AiMessage } from './types';
import type { ThreadMessage } from 'openai/resources/beta/threads/messages';

import { zodResponseFormat } from "openai/helpers/zod";
import { Composer, ComposerList, WorkList } from './zodDefinitions';

const useDeepseek = true;
let aiModel = "gpt-4o-mini"
let openai: OpenAI;

if (!useDeepseek) {
    openai = new OpenAI({ apiKey: OPENAI_API_KEY });
} else {
    aiModel = "deepseek-chat"
    openai = new OpenAI({ baseURL: 'https://api.deepseek.com', apiKey: DEEPSEEK_API_KEY });
}

// const aiModel = "gpt-4o-2024-08-06"



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
const assistant = async (messages: AiMessage[], assistantId?: string) => {
    try {
        // Create a thread with initial messages if provided
        const { threadId, error: threadError } = await createThread(messages.slice(0, -1));
        if (threadError) {
            return { error: threadError };
        }

        // Add the most recent message to the thread
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role === 'user') {
            const { error: messageError } = await addMessage(threadId, lastMessage.content as string);
            if (messageError) {
                return { error: messageError };
            }
        }

        // Run the assistant and wait for completion
        const { runId, error: runError } = await runAssistant(
            threadId,
            assistantId || process.env.DEFAULT_ASSISTANT_ID || ''
        );
        if (runError) {
            return { error: runError };
        }

        const { error: waitError } = await waitForRun(threadId, runId);
        if (waitError) {
            return { error: waitError };
        }

        // Get the assistant's response
        const { messages: threadMessages, error: messagesError } = await getMessages(threadId);
        if (messagesError) {
            return { error: messagesError };
        }

        // Find the latest assistant message
        const assistantResponse = threadMessages.find(m => m.role === 'assistant');
        if (!assistantResponse) {
            return { error: "No assistant response found" };
        }

        // Convert to the format expected by your application
        return {
            role: 'assistant',
            content: assistantResponse.content[0].type === 'text'
                ? assistantResponse.content[0].text.value
                : JSON.stringify(assistantResponse.content)
        };
    } catch (error) {
        console.error("Error in assistant function:", error);
        return { error: "An unexpected error occurred" };
    }
};

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
            response_format: zodResponseFormat(Composer, "composer")
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
            response_format: zodResponseFormat(WorkList, "workList")
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

export { getEmbedding, chat, extractComposer, extractComposerList, extractWorkList }