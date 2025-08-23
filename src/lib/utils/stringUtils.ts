import { AiMessage } from "$lib/types";

const extractJSON = (str: string) => {
    // Handle code blocks
    const codeBlockMatch = str.match(/```(?:json)?\n([\s\S]*?)\n```/);
    if (codeBlockMatch) return codeBlockMatch[1];

    // Handle potential wrapped JSON
    const jsonMatch = str.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[0] : str;
};

const flattenChat = (log: AiMessage[]): string => {
    return log
        .filter(m => m.content.trim())
        .map(m => {
            switch (m.role) {
                case "user":
                    return `User: ${m.content.trim()}`;
                case "assistant":
                    return `Assistant: ${m.content.trim()}`;
            }
        })
        .join("\n");
}

export { extractJSON, flattenChat };
