export enum AiRole {
    System = "system",
    User = "user",
    Assistant = "assistant"

}
export enum ButtonSizes {
    sm = "sm",
    md = "md",
    lg = "lg",
    xl = "xl"

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
export interface ChatAction {
    label: string,
    action?: () => void
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
