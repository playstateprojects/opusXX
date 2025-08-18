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

export interface VectorMatch {
    document_name: string,
    fie_id: string,
    composer_name: string
    justification: string
}
export interface FormattedVectorResponse {
    summary: string,
    matches: VectorMatch[]
}

export interface Work {
    id?: number;
    name: string;
    composer?: number; // Foreign key to composer ID
    composerDetails?: Composer; // Populated composer details
    source?: string;
    publicationYear?: string;
    firstPerformance?: string;
    duration?: string;
    availability?: string;
    linkToScore?: string;
    links?: string;
    status?: string;
    notes?: string;
    genre?: string;
    period?: string;
    instrumentation?: string;
    relatedWorks?: string;
    longDescription?: string;
    shortDescription?: string;
    tags?: string;
    catalogNumber?: string;
    ismn?: string;
    publisher?: string;
    oclc?: string;
    iswc?: string;
    genreId?: number;
    subgenreId?: number;
    scoring?: string;
}

export interface Composer {
    id?: number;
    name?: string;
    birthDate?: string;
    deathDate?: string;
    birthLocation?: string;
    nationality?: string;
    deathLocation?: string;
    longDescription?: string;
    shortDescription?: string;
    imageUrl?: string;
    media?: any; // JSON field
    links?: any; // JSON field
    tags?: any; // JSON field
    references?: any; // JSON field
    gender?: string;
    sources?: any; // JSON field
    notes?: string;
    sexType?: string;
    sexValue?: string;
    activeLocations?: string;
    composerPeriod?: string;
    composerStyle?: string;
    birthYear?: number;
    profileImages?: ProfileImage[];
    works?: Work[];
}

export interface ProfileImage {
    id?: number;
    composerId?: number;
    originalImageUrl?: string;
    cloudflareImageUrl?: string;
    license?: string;
    attribution?: string;
    uploadStatus?: string;
}

export interface Genre {
    id?: number;
    name: string;
    slug: string;
    worksId?: number;
}

export interface Subgenre {
    id?: number;
    name: string;
    slug: string;
    worksId?: number;
}

export interface CardComposer {
    imageURL: string,
    profileImages: { url: string }[],
    name: string,
    birthDate: string,
    deathDate: string,
    shortDescription: string,
    longDescription: string,
    tags?: string[]
}
