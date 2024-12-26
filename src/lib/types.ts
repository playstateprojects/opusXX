export enum AiRole {
    System = "system",
    User = "user",
    Assistant = "assistant"

}

export interface AiMessage {
    role: AiRole,
    content: string,
    time?: Date
}

export interface VectorInfo {
    sourceUrl: string;
    vector: number[];
    meta: string;
    namespace: string
}