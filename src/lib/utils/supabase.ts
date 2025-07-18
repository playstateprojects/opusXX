import { Composer } from "$lib/zodDefinitions"
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

export { getComposerByName, parseSupabaseComposer, parseSupabaseComposers }
