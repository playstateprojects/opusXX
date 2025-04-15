// import type { ThreadMessage } from 'openai/resources/beta/threads/messages';
import type { AiMessage } from './types';
import OpenAI from 'openai';

const assitantId = "asst_gugfoJmAoT7knSYdbSwICF7P"
// Interface for assistant options
export interface AssistantOptions {
    instructions?: string;
    fileIds?: string[];
    metadata?: Record<string, string>;
}

// Function to create a new thread
export const createThread = async (openai: OpenAI, initialMessages?: AiMessage[]) => {
    try {
        // Convert AiMessage format to OpenAI thread message format if needed
        const messages = initialMessages?.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        const thread = await openai.beta.threads.create({
            messages: messages as any // Type casting as the structures may not exactly match
        });

        console.log("Thread created:", thread.id);
        return { threadId: thread.id };
    } catch (error) {
        console.error("Error creating thread:", error);
        return { error: "Failed to create thread" };
    }
};

// Function to add a message to an existing thread
export const addMessage = async (openai: OpenAI, threadId: string, message: string, role: 'user' = 'user') => {
    try {
        const response = await openai.beta.threads.messages.create(threadId, {
            role,
            content: message
        });

        console.log("Message added:", response.id);
        return { messageId: response.id };
    } catch (error) {
        console.error("Error adding message:", error);
        return { error: "Failed to add message to thread" };
    }
};

// Function to run the assistant on a thread
export const runAssistant = async (
    openai: OpenAI,
    threadId: string,
    assistantId: string,
    instructions?: string
) => {
    try {
        const run = await openai.beta.threads.runs.create(threadId, {
            assistant_id: assistantId,
            instructions
        });

        console.log("Run created:", run.id);
        return { runId: run.id };
    } catch (error) {
        console.error("Error running assistant:", error);
        return { error: "Failed to run assistant" };
    }
};

// Function to check the status of a run
export const checkRunStatus = async (openai: OpenAI, threadId: string, runId: string) => {
    try {
        const run = await openai.beta.threads.runs.retrieve(threadId, runId);
        return { status: run.status, run };
    } catch (error) {
        console.error("Error checking run status:", error);
        return { error: "Failed to check run status" };
    }
};

// Function to get messages from a thread
export const getMessages = async (openai: OpenAI, threadId: string) => {
    try {
        const messages = await openai.beta.threads.messages.list(threadId);
        return { messages: messages.data };
    } catch (error) {
        console.error("Error getting messages:", error);
        return { error: "Failed to get messages" };
    }
};

// Helper function to wait for a run to complete
export const waitForRun = async (
    openai: OpenAI,
    threadId: string,
    runId: string,
    maxAttempts = 60,
    delay = 1000
) => {
    let attempts = 0;

    while (attempts < maxAttempts) {
        const { status, error, run } = await checkRunStatus(openai, threadId, runId);

        if (error) {
            return { error };
        }

        if (status === 'completed') {
            return { status, run };
        }

        if (status === 'failed' || status === 'cancelled' || status === 'expired') {
            return { status, error: run?.last_error || "Run did not complete successfully", run };
        }

        // Wait before checking again
        await new Promise(resolve => setTimeout(resolve, delay));
        attempts++;
    }

    return { error: "Timeout waiting for run to complete" };
};

// Main function to chat with assistant
export const assistantChat = async (
    openai: OpenAI,
    message: string,
    threadId?: string,
    options?: AssistantOptions
) => {
    try {
        if (!options?.assistantId) {
            return { error: "Assistant ID is required" };
        }

        // Create a new thread if one doesn't exist
        if (!threadId) {
            const threadResult = await createThread(openai);
            if (threadResult.error) {
                return { error: threadResult.error };
            }
            threadId = threadResult.threadId;
        }
        if (!threadId) {
            return { error: "Failed to create thread" };
        }
        // Add the user message to the thread
        const messageResult = await addMessage(openai, threadId, message);
        if (messageResult.error) {
            return { error: messageResult.error };
        }

        // Run the assistant on the thread
        const runResult = await runAssistant(
            openai,
            threadId,
            options.assistantId,
            options.instructions
        );

        if (runResult.error) {
            return { error: runResult.error };
        }
        if (!runResult.runId) {
            return { error: "Failed to run assistant" };
        }


        // Wait for the run to complete
        const waitResult = await waitForRun(openai, threadId, runResult.runId);
        if (waitResult.error) {
            return { error: waitResult.error };
        }

        // Get the messages after the run completes
        const messagesResult = await getMessages(openai, threadId);
        if (messagesResult.error) {
            return { error: messagesResult.error };
        }
        if (!messagesResult.messages) {
            return { error: "Failed to get messages" };
        }

        // Get the assistant's response (first message should be the latest)
        const assistantResponse = messagesResult.messages.find(m => m.role === 'assistant');

        return {
            threadId,
            runId: runResult.runId,
            response: assistantResponse,
            messages: messagesResult.messages
        };
    } catch (error) {
        console.error("Error in assistantChat:", error);
        return { error: "An unexpected error occurred" };
    }
};

// Function to get a formatted response from the assistant
export const getAssistantResponse = async (
    openai: OpenAI,
    messages: AiMessage[],
    assistantId: string
) => {
    try {
        // Create a thread with initial messages if provided
        const { threadId, error: threadError } = await createThread(openai, messages.slice(0, -1));
        if (threadError) {
            return { error: threadError };
        }
        if (!threadId) {
            return { error: "Failed to create thread" };
        }

        // Add the most recent message to the thread
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role === 'user') {
            const { error: messageError } = await addMessage(openai, threadId, lastMessage.content as string);
            if (messageError) {
                return { error: messageError };
            }
        }

        // Run the assistant and wait for completion
        const { runId, error: runError } = await runAssistant(openai, threadId, assistantId);
        if (runError) {
            return { error: runError };
        }
        if (!runId) {
            return { error: "Failed to run assistant" };
        }

        const { error: waitError } = await waitForRun(openai, threadId, runId);
        if (waitError) {
            return { error: waitError };
        }

        // Get the assistant's response
        const { messages: threadMessages, error: messagesError } = await getMessages(openai, threadId);
        if (messagesError) {
            return { error: messagesError };
        }

        if (!threadMessages) {
            return { error: "No messages found" };
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
        console.error("Error in getAssistantResponse function:", error);
        return { error: "An unexpected error occurred" };
    }
};