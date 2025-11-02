import { z } from "zod";

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
    composer: Composer; // Full composer object
    source?: string;
    publicationYear?: string;
    firstPerformance?: string;
    duration?: string;
    availability?: string;
    linkToScore?: string;
    links?: string;
    status?: string;
    notes?: string;
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
    genre?: Genre; // Genre object from genres table
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

// ===========================================
// ZOD SCHEMAS FOR VALIDATION & EXTRACTION
// ===========================================

export const CollaboratorSchema = z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
})

export const Reference = z.object({
    content: z.string(),
    source: z.string(),
    tags: z.array(z.string())
})

export const ComposerSex = z.enum([
    'Female',
    'Male',
    'Other',
])

export const periods = z.enum([
    'Medieval',
    'Renaissance',
    'Baroque',
    'Classical',
    'Early Romantic',
    'Late Romantic',
    'Romantic',
    '20th Century',
    'Contemporary',
    'unkown'
])

export const genres = z.enum([
    "Chamber music",
    "Choral",
    "Opera",
    "Orchestral",
    "Solo",
    "Vocal"
])

export const subGenres = z.enum([
    'Canon',
    'Fugue',
    "Children's Opera",
    'Dance',
    'Mazurka',
    'Quintet',
    'Motet',
    'Opera Seria',
    'Madrigal',
    'Symphonic poem',
    'Anthem',
    'Etude ',
    'Lieder',
    'Suite ',
    'Concerto grosso',
    'instrumental',
    'Bagatelle',
    'Concerto',
    'Prelude',
    'Serenade',
    'Trio',
    'Duo',
    'Tone poem',
    'Grand Opera',
    'Waltz',
    'Concerto',
    'Polonaise',
    'Quartet',
    'Symphony',
    'Ballet',
    'Comic Opera',
    'Sonata',
    'Opera Buffa',
    'Impromptu',
    'Cantata',
    'Ensemble',
    'Chorale',
    'Scherzo',
    'Requiem',
    'Divisions',
    'Mass',
    'Masque',
    'songs',
    'Divertimento',
    'Minuet',
    'unkown'
])

export const styles = z.enum([
    'sacred',
    'minimalist',
    'meditative',
    'atonal',
    'post-modern',
    'neo-classical',
    'avant-garde',
    'sound installation',
    'formalism',
    'virtuosic',
    'tonal',
    'sad',
    'electro-acoustic',
    'renaissance',
    'serialist',
    'serious',
    'spectralism',
    'profane',
    'Impressionist',
    'relaxing',
    'fast',
    'modernist',
    'upbeat',
    '1st Viennese School',
    '12 tone ',
    'happy',
    'electronic',
    'neo-romantic',
    'tintinnabuli',
    'slow',
    'sound art',
    '2nd Viennese School',
    'melancholic',
    'experimental',
    'unkown'
])

export const genreSubGenre = z.enum([
    "Vocal-Anthem",
    "Choral-Anthem",
    "Solo-Bagatelle",
    "Orchestral-Ballet",
    "Cantata-",
    "Opera-ChildrensOpera",
    "Vocal-Chorale",
    "Choral-Chorale",
    "Opera-ComicOpera",
    "Orchestral-Concerto",
    "Concerto-",
    "Orchestral-ConcertoGrosso",
    "Solo-Divertimento",
    "Opera-Drame",
    "ChamberMusic-Duo",
    "ChamberMusic-Ensemble",
    "ChamberMusic-Ensemble",
    "Solo-Etude",
    "Solo-Fugue",
    "Opera-GrandOpera",
    "Choral-Hymn",
    "Vocal-Hymn",
    "Impromptu-",
    "Instrumental-",
    "Vocal-Lieder",
    "Choral-Madrigal",
    "Masque-",
    "Choral-Mass",
    "Solo-Mazurka",
    "Solo-Minuet",
    "Vocal-Motet",
    "Choral-Motet",
    "Opera-OperaBuffa",
    "Opera-OperaSeria",
    "ChamberMusic-PianoTrio",
    "Solo-Polonaise",
    "Solo-Prelude",
    "ChamberMusic-Quartet",
    "Quartet-",
    "ChamberMusic-Quintet",
    "Choral-Requiem",
    "Solo-Scherzo",
    "Solo-Serenade",
    "ChamberMusic-SmallMixEnsemble",
    "Sonata-",
    "Vocal-Songs",
    "Solo-Suite",
    "Orchestral-Suite",
    "Orchestral-SymphonicPoem",
    "Orchestral-Symphony",
    "Orchestral-TonePoem",
    "ChamberMusic-Trio"
])

export const CardSection = z.object({
    title: z.string(),
    content: z.string()
})

export const Media = z.object({
    url: z.string().optional(),
    type: z.enum(["image", "video", "audio", "document"]),
    info: z.string(),
    tags: z.array(z.string()).optional()
})

export const ComposerExtractSchema = z.object({
    name: z.string(),
    birthDate: z.string(),
    deathDate: z.string().optional(),
    birthLocation: z.string(),
    deathLocation: z.string().optional(),
    longDescription: z.string(),
    shortDescription: z.string(),
    imageURL: z.string(),
    media: z.array(Media).optional(),
    links: z.array(z.string()).optional(),
    tags: z.array(z.string()),
    references: z.array(Reference),
    gender: z.enum(['male', 'female', 'other']),
    sources: z.array(z.string()).optional(),
    nationality: z.string().optional(),
    sections: z.array(CardSection).optional(),
    representativeWorks: z.string().optional(),
})


export const Source = z.object({
    'URL': z.string().optional(),
    'Content': z.string().optional(),
    'Composer': z.array(z.string()).optional(),
    RawHTML: z.string().optional(),
    Work: z.array(z.string()).optional(),
})

export const ComposerList = z.object({
    links: z.array(
        z.object(
            { name: z.string(), url: z.string() }
        )
    )
})

// Simple WorkCard type that uses the existing Work interface
export interface WorkCardType {
    work: Work;
    insight: string;
    relevance?: number
}

export const Genres = z.array(z.object({
    name: z.string(),
    id: z.string().optional()
}))

export const Spotlight = z.object({
    title: z.string(),
    image: z.string(),
    subtitle: z.string(),
    content: z.string(),
    date: z.string().optional(),
    logo: z.string().optional(),
    colour: z.string(),
    type: z.string().optional(),
    cta: z.object({
        link: z.string(),
        label: z.string()
    })
})

export const WorkSchema = z.object({
    name: z.string(),
    composer: z.string(), // Just the name for extraction, will be populated with full object later
    instrumentation: z.string().optional(),
    duration: z.string().optional(),
    publicationYear: z.string().optional(),
    shortDescription: z.string().optional(),
    longDescription: z.string().optional()
})

export const WorkListSchema = z.object({
    works: z.array(WorkSchema)
})


// ===========================================
// INFERRED TYPES FROM ZOD SCHEMAS
// ===========================================

export type ComposerExtract = z.infer<typeof ComposerExtractSchema>
export type ReferenceType = z.infer<typeof Reference>
export type ComposerListType = z.infer<typeof ComposerList>
export type GenresType = z.infer<typeof Genres>
export type SpotlightType = z.infer<typeof Spotlight>
export type SourceType = z.infer<typeof Source>

// ===========================================
// API INTERFACE TYPES
// ===========================================

// Insight Maker API types
export interface InsightMakerRequest {
    works: Work[];
    intention: string;
    minRelevanceScore?: number; // Optional filter threshold (0-10)
}

export interface WorkInsight {
    workId: string;
    insight: string;
    relevanceScore: number;
}

export interface InsightMakerResponse {
    works: WorkInsight[];
}

// Query Maker API types
export interface QueryMakerInfo {
    schema?: object;
    chatLog?: string;
}

export interface QueryMakerResponse {
    intent: string;
    vectorQueryTerm: string;
}

// Question Maker API types
export interface QuestionMakerInfo {
    schema?: object;
    chatLog?: string;
}

export interface QuestionMakerResponse {
    question: string;
    quickResponses?: string[];
}

// Action Decision API types
export interface ActionDecisionInfo {
    schema?: object;
    chatLog?: string;
}

export interface ActionDecisionFilters {
    composer?: string;
    period?: string;
    genre?: string;
    subgenre?: string;
    instrument?: string | string[];
}

export interface ActionDecisionResponse {
    action: 'sql_search' | 'vector_search' | 'continue';
    reason?: string;
    filters?: ActionDecisionFilters;
}

// Common error response type
export interface ErrorResponse {
    error: string;
}
