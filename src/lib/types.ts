export enum AiRole {
    System = "system",
    User = "user",
    Assistant = "assistant"

}

export enum AiOptionIcon {
    period = "period",
    theme = "theme",
    drama = "drama",
}

export interface AiMessage {
    role: AiRole,
    content: string,
    time?: Date
}
export interface AiOption {
    content: string,
    icon?: AiOptionIcon
}

export interface VectorInfo {
    sourceUrl: string;
    vector: number[];
    meta: string;
    namespace: string
}
export interface CTA {
    link: string;
    label: string
}