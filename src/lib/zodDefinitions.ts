import { z } from "zod";
import { GenreSchema } from "./zodAirtableTypes";

export const AirtableCollaboratorSchema = z.object({
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
    ' Medieval',
    'Renaissance',
    'Baroque',
    'Classical',
    'Early Romantic',
    'Late Romantic',
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
const Work = z.object({
    title: z.string(),
    composer: z.string(),
    location: z.string(),
    publicationYear: z.string().optional(),
    duration: z.string().optional(),
    shortDescription: z.string(),
    longDescription: z.string(),
    publisher: z.string().optional(),
    media: z.array(z.string()).optional(),
    links: z.array(z.string()).optional(),
    instrumentation: z.array(z.string()).optional(),
    refrences: z.array(Reference),
    period: periods.optional(),
    genre: genres.optional(),
    subGenre: subGenres.optional(),
    style: styles.optional(),
})

const Media = z.object({
    url: z.string().optional(),
    type: z.enum(["image", "video", "audio", "document"]),
    info: z.string(),
    tags: z.array(z.string()).optional()
})
const Source = z.object({
    'URL': z.string().optional(),
    'Content': z.string().optional(),
    'Composer': z.array(z.string()).optional(),
    RawHTML: z.string().optional(),
    Work: z.array(z.string()).optional(),
})
type Source = z.infer<typeof Source>

const Composer = z.object({
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
    works: z.array(Work),
    gender: z.enum(['male', 'female', 'other']),
    sources: z.array(z.string()).optional(),
    'Notes': z.string().optional(),
    'Sex': z.array(ComposerSex).optional(),
    'Active Locations': z.string().optional(),
    'Work': z.array(z.string()).optional(),
    'Alernate Names': z.array(z.string()).optional(),
    loading: z.boolean().optional(),

})

const ComposerList = z.object({
    links: z.array(
        z.object(
            { name: z.string(), url: z.string() }
        )
    )
})



const Genres = z.array(z.object({
    name: z.string(),
    id: z.string().optional()
}))

type Composer = z.infer<typeof Composer>
type Work = z.infer<typeof Work>
type Reference = z.infer<typeof Reference>
type ComposerList = z.infer<typeof ComposerList>
type Genres = z.infer<typeof Genres>



export { Reference, Work, Composer, ComposerList, Source, Genres }