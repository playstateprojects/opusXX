import { z } from "zod";

const Reference = z.object({
    content: z.string(),
    source: z.string(),
    tags: z.array(z.string())
})

const Work = z.object({
    title: z.string(),
    composer: z.string(),
    location: z.string(),
    date: z.string().optional(),
    duration: z.string().optional(),
    description: z.string(),
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

})

const Composer = z.object({
    name: z.string(),
    birthDate: z.string(),
    deathDate: z.string().optional(),
    birthLocation: z.string(),
    deathLocation: z.string().optional(),
    longDescription: z.string(),
    shortDescription: z.string(),
    media: z.array(Media).optional(),
    links: z.array(z.string()).optional(),
    tags: z.array(z.string()),
    refrences: z.array(Reference),
    works: z.array(Work),
    gender: z.enum(['male', 'female', 'other']),
    allRelevantTextContent: z.array(z.string())
})
const ComposerList = z.object({
    links: z.array(
        z.object(
            { name: z.string(), url: z.string() }
        )
    )
})

type Composer = z.infer<typeof Composer>
type Work = z.infer<typeof Work>
type Reference = z.infer<typeof Reference>
type ComposerList = z.infer<typeof ComposerList>



export { Reference, Work, Composer, ComposerList }