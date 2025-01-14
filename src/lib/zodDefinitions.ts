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


const Composer = z.object({
    name: z.string(),
    birthDate: z.string(),
    deathDate: z.string().optional(),
    birthLocation: z.string(),
    deathLocation: z.string().optional(),
    description: z.string(),
    media: z.array(z.string()).optional(),
    links: z.array(z.string()).optional(),
    tags: z.array(z.string()),
    refrences: z.array(Reference),
    works: z.array(Work),
    gender: z.enum(['male', 'female', 'other'])
})

type Composer = z.infer<typeof Composer>
type Work = z.infer<typeof Work>
type Reference = z.infer<typeof Reference>



export { Reference, Work, Composer }