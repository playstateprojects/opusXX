import { Composer, Work } from "$lib/types"
import { supabase } from '$lib/supabase'
import { parseRawComposerToComposer } from "./composerParser";

const getComposerByName = async (composerName: string): Promise<Composer | null> => {
  const { data, error } = await supabase
    .from('composer_names')
    .select(`
    *,
    composers (
      *,
      profile_images (*),
      works(*)
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
const getComposerById = async (composerId: number): Promise<Composer | null> => {
  const { data, error } = await supabase
    .from('composers')
    .select(`
    *,
      profile_images (*),
      works(*)
    )
  `)
    .eq('id', composerId);

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
const parseSupabaseComposer = (data: unknown): Composer => {
  return parseRawComposerToComposer(data);
}

// Function to handle arrays of composers
const parseSupabaseComposers = (data: unknown[]): Composer[] => {
  return data.map(item => parseRawComposerToComposer(item));
}

// Function to convert raw database work data to Work type
const parseSupabaseWork = (work: any): Work => {
  return {
    id: work.id,
    name: work.name || '',
    composer: work.composer || undefined,
    composerDetails: work.composers ? parseSupabaseComposer(work.composers) : undefined,
    source: work.source || undefined,
    publicationYear: work.publication_year || undefined,
    firstPerformance: work.first_performance || undefined,
    duration: work.duration || undefined,
    availability: work.availability || undefined,
    linkToScore: work.link_to_score || undefined,
    links: work.links || undefined,
    status: work.status || undefined,
    notes: work.notes || undefined,
    genre: work.genre || undefined,
    period: work.period || undefined,
    instrumentation: work.instrumentation || undefined,
    relatedWorks: work.related_works || undefined,
    longDescription: work.long_description || undefined,
    shortDescription: work.short_description || undefined,
    tags: work.tags || undefined,
    catalogNumber: work.catalog_number || undefined,
    ismn: work.ismn || undefined,
    publisher: work.publisher || undefined,
    oclc: work.oclc || undefined,
    iswc: work.iswc || undefined,
    genreId: work.genre_id || undefined,
    subgenreId: work.subgenre_id || undefined,
    scoring: work.scoring || undefined
  };
}

const getWorksByComposerId = async (composerId: number): Promise<Work[]> => {
  const { data, error } = await supabase
    .from('works')
    .select(`
      *,
      composers (
        *,
        profile_images (*)
      )
    `)
    .eq('composer', composerId);

  if (error) {
    console.error('Error fetching works by composer ID:', error);
    return [];
  }

  if (!data) {
    console.log('No works found for composer ID:', composerId);
    return [];
  }
  console.log(data)

  // Handle both single object and array results
  const worksData = Array.isArray(data) ? data : [data];

  // Parse each work using the abstracted parser
  return worksData.map(work => parseSupabaseWork(work));
};

const getWorkById = async (workId: number): Promise<Work | null> => {
  const { data, error } = await supabase
    .from('works')
    .select(`
      *,
      composers (
        *,
        profile_images (*)
      )
    `)
    .eq('id', workId);

  if (error) {
    console.error('Error fetching works by composer ID:', error);
    return null;
  }

  if (!data) {
    console.log('No work found for work ID:', workId);
    return null;
  }

  // Handle both single object and array results
  const workData = Array.isArray(data) ? data[0] : data;

  if (!workData) {
    return null;
  }

  // Parse the work using the abstracted parser
  return parseSupabaseWork(workData);
};

export { getComposerByName, parseSupabaseComposer, parseSupabaseComposers, parseSupabaseWork, getWorksByComposerId, getComposerById, getWorkById }
