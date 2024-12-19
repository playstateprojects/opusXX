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
