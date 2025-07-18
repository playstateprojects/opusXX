import { Composer, Work } from "$lib/zodDefinitions"
import { supabase } from '$lib/supabase'
import { parseRawComposerToComposer } from "./composerParser";

const getComposerByName = async (composerName: string): Promise<Composer | null> => {
  const { data, error } = await supabase
    .from('composer_names')
    .select(`
    *,
    composers (
      *,
      profile_images (*)
    )
  `)
    .ilike('name', `%${composerName}%`);

  if (error) console.error(error);

  // Handle both single object and array results
  const composerData = Array.isArray(data) ? data[0] : data;
  if (!composerData) {
    console.log("no composer data");
    return null;
  }
  const composer = parseRawComposerToComposer(composerData);
  return composer;
}

// New function to handle any data format from Supabase
const parseSupabaseComposer = (data: any): Composer => {
  return parseRawComposerToComposer(data);
}

// Function to handle arrays of composers
const parseSupabaseComposers = (data: any[]): Composer[] => {
  return data.map(item => parseRawComposerToComposer(item));
}

const getWorksByComposerId = async (composerId: string): Promise<Work[]> => {
  const { data, error } = await supabase
    .from('works')
    .select(`
      *,
      composers (
        *,
        profile_images (*)
      )
    `)
    .eq('composer_id', composerId);

  if (error) {
    console.error('Error fetching works by composer ID:', error);
    return [];
  }

  if (!data) {
    console.log('No works found for composer ID:', composerId);
    return [];
  }

  // Handle both single object and array results
  const worksData = Array.isArray(data) ? data : [data];

  // Parse each work using the existing parser
  return worksData.map(work => ({
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
};

export { getComposerByName, parseSupabaseComposer, parseSupabaseComposers, getWorksByComposerId }
