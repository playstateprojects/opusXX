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