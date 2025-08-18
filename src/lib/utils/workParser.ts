import { Work } from "$lib/zodDefinitions";
import { parseSupabaseComposer } from "./supabase";

const parseRawWork = (rawWork: any): Work => {
    return rawWork.map((work: Work) => ({
        title: work.title || '',
        composer: work.composers ? parseSupabaseComposer(work.composers) : null,
        location: work.location || '',
        publicationYear: work.publication_year || '',
        duration: work.duration || '',
        shortDescription: work.short_description || '',
        longDescription: work.long_description || '',
        publisher: work.publisher || '',
        media: work.media || [],
        links: work.links || [],
        instrumentation: work.instrumentation || [],
        references: work.references || [],
        period: work.period || undefined,
        genre: work.genre || undefined,
        subGenre: work.sub_genre || undefined,
        genreSubGenre: work.genre_sub_genre || undefined,
        style: work.style || undefined,
        sources: work.sources || [],
        rawContent: work.raw_content || ''
    }));
}
export { parseRawWork }