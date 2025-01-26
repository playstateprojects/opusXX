import { getGenres } from '$lib/airtable';
import type { Genres } from '$lib/zodDefinitions';
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
    console.log('hello')
    let genres: Genres = await getGenres();
    console.log('genres', genres)
    return { genres };
}