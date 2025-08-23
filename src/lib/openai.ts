import type { AiMessage } from './types';
import type { Composer } from './types';



const getEmbedding = async (text: string) => {
    const response = await fetch('/api/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    });
    return response.json();
}
const chat = async (messages: AiMessage[]) => {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
    });
    return response.json();
}
const jsonChat = async (messages: AiMessage[]) => {
    const response = await fetch('/api/chat/json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
    });
    return response.json();
}
// const assistant = async (messages: AiMessage[], assistantId?: string) => {
//     try {
//         // Create a thread with initial messages if provided
//         const { threadId, error: threadError } = await createThread(messages.slice(0, -1));
//         if (threadError) {
//             return { error: threadError };
//         }

//         // Add the most recent message to the thread
//         const lastMessage = messages[messages.length - 1];
//         if (lastMessage.role === 'user') {
//             const { error: messageError } = await addMessage(threadId, lastMessage.content as string);
//             if (messageError) {
//                 return { error: messageError };
//             }
//         }

//         // Run the assistant and wait for completion
//         const { runId, error: runError } = await runAssistant(
//             threadId,
//             assistantId || process.env.DEFAULT_ASSISTANT_ID || ''
//         );
//         if (runError) {
//             return { error: runError };
//         }

//         const { error: waitError } = await waitForRun(threadId, runId);
//         if (waitError) {
//             return { error: waitError };
//         }

//         // Get the assistant's response
//         const { messages: threadMessages, error: messagesError } = await getMessages(threadId);
//         if (messagesError) {
//             return { error: messagesError };
//         }

//         // Find the latest assistant message
//         const assistantResponse = threadMessages.find(m => m.role === 'assistant');
//         if (!assistantResponse) {
//             return { error: "No assistant response found" };
//         }

//         // Convert to the format expected by your application
//         return {
//             role: 'assistant',
//             content: assistantResponse.content[0].type === 'text'
//                 ? assistantResponse.content[0].text.value
//                 : JSON.stringify(assistantResponse.content)
//         };
//     } catch (error) {
//         console.error("Error in assistant function:", error);
//         return { error: "An unexpected error occurred" };
//     }
// };

const extractComposer = async (text: string): Promise<{ data?: Composer; error?: string }> => {
    const response = await fetch('/api/extract/composer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    });
    return response.json();
};
const extractComposerList = async (text: string) => {
    const response = await fetch('/api/extract/composer-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    });
    return response.json();
}
const extractWorkList = async (text: string) => {
    const response = await fetch('/api/extract/work-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    });
    return response.json();
}

export { getEmbedding, chat, extractComposer, extractComposerList, extractWorkList, jsonChat }
