import type { AiMessage } from "$lib/types";

/**
 * Utility functions for Cloudflare AI operations
 * These functions need to be called with the platform environment
 * from server-side code (API routes, server hooks, etc.)
 */

/**
 * Cloudflare environment interface
 */
interface CloudflareEnv {
    AI?: {
        run?: (model: string, params: any) => Promise<any>;
        autorag?: (indexName: string) => { search: (params: { query: string }) => Promise<any> };
    };
    VECTORIZE?: {
        insert: (data: any) => Promise<any>;
        query: (data: any, options: any) => Promise<any>;
    };
    [key: string]: any;
}
const cfModel = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
// const cfModel = "@cf/meta/llama-4-scout-17b-16e-instruct";
/**
 * Run a JSON chat completion using Cloudflare AI
 * @param messages - Array of AI messages
 * @param env - Cloudflare environment from platform
 * @param model - AI model to use (defaults to '@cf/meta/llama-3.3-70b-instruct-fp8-fast')
 * @param jsonSchema - Optional JSON schema for structured output
 * @returns The AI response message
 */
export async function jsonChat(
    messages: AiMessage[],
    env: CloudflareEnv,
    jsonSchema?: object
): Promise<any | { error: boolean }> {
    try {
        // Check if AI binding is available
        console.log("env.AI.run available?", typeof env?.AI?.run === "function");
        if (!env?.AI?.run) {
            console.error("AI binding or run method not found in environment");
            return { error: true };
        }

        const requestParams: any = {
            messages: messages
        };

        // Add response format based on whether schema is provided
        if (jsonSchema) {
            requestParams.response_format = {
                type: 'json_schema',
                json_schema: jsonSchema
            };
        } else {
            requestParams.response_format = {
                type: 'json_object'
            };
        }

        console.log("Request params:", requestParams);
        const response = await env.AI.run(cfModel, requestParams);
        console.log("got res")
        if (response && response.response) {
            console.log("AI response:", response);

            // Parse the response based on the format
            try {
                let cleanResponse = response.response;

                // Remove markdown code block wrappers if present
                if (cleanResponse.startsWith('```json')) {
                    cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
                } else if (cleanResponse.startsWith('```')) {
                    cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
                }

                return JSON.parse(cleanResponse.trim());
            } catch (parseError) {
                console.error("Failed to parse JSON response:", parseError);
                // Return the cleaned response as-is if it's not valid JSON
                return response.response;
            }
        } else {
            console.error("Invalid response format from AI:", response);
            return { error: true };
        }
    } catch (error) {
        console.error("Error in jsonChat:", error);
        return { error: true };
    }
}

/**
 * Alternative method using the AI binding directly if available
 * @param messages - Array of AI messages
 * @param env - Cloudflare environment from platform
 * @param model - AI model to use (defaults to '@cf/meta/llama-3.3-70b-instruct-fp8-fast')
 * @param jsonSchema - Optional JSON schema for structured output
 * @returns The raw AI response
 */
export async function runAI(
    messages: AiMessage[],
    env: CloudflareEnv,
    model: string = cfModel,
    jsonSchema?: object
): Promise<any> {
    try {
        if (!env?.AI?.run) {
            throw new Error("AI binding or run method not found");
        }

        const requestParams: any = {
            messages: messages
        };

        // Add response format based on whether schema is provided
        if (jsonSchema) {
            requestParams.response_format = {
                type: 'json_schema',
                json_schema: jsonSchema
            };
        } else {
            requestParams.response_format = {
                type: 'json_object'
            };
        }

        return await env.AI.run(model, requestParams);
    } catch (error) {
        console.error("Error running AI:", error);
        throw error;
    }
}
