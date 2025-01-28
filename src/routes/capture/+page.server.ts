import { getGenres, getStyles, getSubGenres } from '$lib/airtable';
import type { Genres } from '$lib/zodDefinitions';
import type { PageServerLoad } from './$types'

export const load = (async () => {
    console.log('hello')
    let genres: Genres = await getGenres();
    let subGenres: Genres = await getSubGenres();
    let styles: Genres = await getStyles();
    console.log('genres', genres)
    console.log('subGenres', subGenres)
    console.log('styles', styles)
    return { genres, subGenres, styles };
}) satisfies PageServerLoad;