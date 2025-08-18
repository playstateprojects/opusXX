import { z } from "zod";

export const CollaboratorSchema = z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
})

const Reference = z.object({
    content: z.string(),
    source: z.string(),
    tags: z.array(z.string())
})
const ComposerSex = z.enum([
    'Female',
    'Male',
    'Other',
])
const periods = z.enum([
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
const genres = z.enum([
    "Chamber music",
    "Choral",
    "Opera",
    "Orchestral",
    "Solo",
    "Vocal"
])
const subGenres = z.enum([
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
const styles = z.enum([
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
const genreSubGenre = z.enum([
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
]
)
const CardSection = z.object({
    title: z.string(),
    content: z.string()
})
const Media = z.object({
    url: z.string().optional(),
    type: z.enum(["image", "video", "audio", "document"]),
    info: z.string(),
    tags: z.array(z.string()).optional()
})
const ComposerExtractSchema = z.object({
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
    refrences: z.array(Reference),
    gender: z.enum(['male', 'female', 'other']),
    sources: z.array(z.string()).optional(),
    nationality: z.string().optional(),
    sections: z.array(CardSection).optional(),
    representativeWorks: z.string().optional(),
})

const WorkExtractSchema = z.object({
    title: z.string(),
    location: z.string(),
    publicationYear: z.string().optional(),
    duration: z.string().optional(),
    shortDescription: z.string(),
    longDescription: z.string(),
    publisher: z.string().optional(),
    media: z.array(z.string()).optional(),
    links: z.array(z.string()).optional(),
    instrumentation: z.array(z.string()).optional(),
    references: z.array(Reference),
    period: periods.optional(),
    genre: genres.optional(),
    subGenre: subGenres.optional(),
    genreSubGenre: genreSubGenre.optional(),
    style: styles.optional(),
    sources: z.array(z.string()).optional(),
    rawContent: z.string(),
    sections: z.array(CardSection).optional()
})


const Source = z.object({
    'URL': z.string().optional(),
    'Content': z.string().optional(),
    'Composer': z.array(z.string()).optional(),
    RawHTML: z.string().optional(),
    Work: z.array(z.string()).optional(),
})
type Source = z.infer<typeof Source>



const ComposerList = z.object({
    links: z.array(
        z.object(
            { name: z.string(), url: z.string() }
        )
    )
})

const WorkList = z.object({
    works: z.array(WorkExtractSchema)
});

const WorkCard = z.object({
    work: WorkExtractSchema,
    insight: z.string()
})

const Genres = z.array(z.object({
    name: z.string(),
    id: z.string().optional()
}))

const CTA = z.object({
    link: z.string(),
    label: z.string()
})

const Spotlight = z.object({
    title: z.string(),
    image: z.string(),
    subtitle: z.string(),
    content: z.string(),
    date: z.string().optional(),
    logo: z.string().optional(),
    colour: z.string(),
    type: z.string().optional(),
    cta: CTA
})

type ComposerExtract = z.infer<typeof ComposerExtractSchema>
type WorkExtract = z.infer<typeof WorkExtractSchema>
type WorkCard = z.infer<typeof WorkCard>
type WorkList = z.infer<typeof WorkList>
type Reference = z.infer<typeof Reference>
type ComposerList = z.infer<typeof ComposerList>
type Genres = z.infer<typeof Genres>
type CTA = z.infer<typeof CTA>
type Spotlight = z.infer<typeof Spotlight>


export { 
    Reference, 
    WorkExtractSchema, 
    WorkExtract,
    ComposerExtractSchema, 
    ComposerExtract, 
    ComposerList, 
    Source, 
    Genres, 
    WorkList, 
    WorkCard, 
    CTA, 
    Spotlight 
}