import type { GenresType } from "$lib/types";
import type { PageServerLoad } from './$types'

export const load = (async () => {
    console.log('hello')
    // TODO: Implement PostgreSQL queries to get genres, subgenres, and styles
    // These would need to be fetched from your PostgreSQL database
    let genres: GenresType = [];
    let subGenres: GenresType = [];
    let styles: GenresType = [];
    console.log('genres', genres)
    console.log('subGenres', subGenres)
    console.log('styles', styles)
    return { genres, subGenres, styles };
}) satisfies PageServerLoad;