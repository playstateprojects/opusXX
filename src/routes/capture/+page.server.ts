import { getGenres, getSubGenres } from '$lib/airtable';
import type { Genres } from '$lib/zodDefinitions';
import type { PageServerLoad } from './$types'

export const load = (async () => {
    console.log('hello')
    let genres: Genres = await getGenres();
    let subGenres: Genres = await getSubGenres();
    return { genres, subGenres };
}) satisfies PageServerLoad;