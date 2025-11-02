// SQL-based work search using structured filters from action-decision agent

import { json, type RequestHandler } from '@sveltejs/kit';
import type { ActionDecisionFilters } from '$lib/types.js';
import type { WorkWithRelations } from '$lib/databaseTypes.js';

export interface SqlSearchRequest {
    filters: ActionDecisionFilters;
    limit?: number;
    offset?: number;
}

export interface SqlSearchResponse {
    works: WorkWithRelations[];
    total: number;
    filters_applied: ActionDecisionFilters;
}

export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        const body: SqlSearchRequest = await request.json();
        const { filters, limit = 20, offset = 0 } = body;

        // Get Supabase client from locals (server-side authenticated client)
        const supabase = locals.supabase;

        if (!supabase) {
            return new Response(JSON.stringify({ error: 'Database client not available' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Start building the query - just get works first
        // We'll fetch related data separately since PostgREST relationships might not be detected
        // Filter for works with a publisher (not null and not empty string)
        let query = supabase
            .from('works')
            .select('*', { count: 'exact' })
            .not('publisher', 'is', null)
            .neq('publisher', '');

        // Apply filters based on what's present

        // 1. Period filter - works.period column (exact match or contains)
        if (filters.period) {
            const periods = Array.isArray(filters.period) ? filters.period : [filters.period];

            if (periods.length === 1) {
                query = query.ilike('period', `%${periods[0]}%`);
            } else if (periods.length > 1) {
                // Multiple periods - use OR condition
                const orConditions = periods.map(p => `period.ilike.%${p}%`);
                query = query.or(orConditions.join(','));
            }
        }

        // 2. Composer filter - first get matching composer IDs, then filter works
        if (filters.composer) {
            const composers = Array.isArray(filters.composer) ? filters.composer : [filters.composer];
            const allComposerIds: number[] = [];

            for (const composerName of composers) {
                const { data: composerData } = await supabase
                    .from('composers')
                    .select('id')
                    .ilike('name', `%${composerName}%`);

                if (composerData && composerData.length > 0) {
                    allComposerIds.push(...composerData.map(c => c.id));
                }
            }

            if (allComposerIds.length > 0) {
                query = query.in('composer', allComposerIds);
            } else {
                // No matching composers found - query will return empty
                query = query.eq('composer', -1); // Force empty result
            }
        }

        // 3. Genre filter - filter by genre_id matching the genre name
        // Also check the legacy 'genre' text column for backwards compatibility
        if (filters.genre) {
            const genres = Array.isArray(filters.genre) ? filters.genre : [filters.genre];
            const orConditions: string[] = [];

            for (const genreName of genres) {
                // First get genre ID(s) that match
                const { data: genreData } = await supabase
                    .from('genres')
                    .select('id')
                    .eq('name', genreName)
                    .limit(1)
                    .maybeSingle();

                if (genreData) {
                    // Search both genre_id (foreign key) and genre (text) columns
                    orConditions.push(`genre_id.eq.${genreData.id}`);
                    orConditions.push(`genre.ilike.%${genreName}%`);
                } else {
                    // If no genre_id match, try the text genre column
                    orConditions.push(`genre.ilike.%${genreName}%`);
                }
            }

            if (orConditions.length > 0) {
                query = query.or(orConditions.join(','));
            }
        }

        // 4. Subgenre filter - filter by subgenre_id matching the subgenre name
        if (filters.subgenre) {
            const subgenres = Array.isArray(filters.subgenre) ? filters.subgenre : [filters.subgenre];
            const subgenreIds: number[] = [];

            for (const subgenreName of subgenres) {
                // First get subgenre ID(s) that match
                const { data: subgenreData } = await supabase
                    .from('subgenres')
                    .select('id')
                    .eq('name', subgenreName)
                    .limit(1)
                    .maybeSingle();

                if (subgenreData) {
                    subgenreIds.push(subgenreData.id);
                }
            }

            if (subgenreIds.length > 0) {
                query = query.in('subgenre_id', subgenreIds);
            }
        }

        // 5. Instrument filter - search in instrumentation or scoring columns
        if (filters.instrument) {
            const instruments = Array.isArray(filters.instrument)
                ? filters.instrument
                : [filters.instrument];

            // Build OR condition for each instrument
            // Format: instrumentation.ilike.%piano%,scoring.ilike.%piano%
            const orConditions: string[] = [];

            instruments.forEach(instrument => {
                orConditions.push(`instrumentation.ilike.%${instrument}%`);
                orConditions.push(`scoring.ilike.%${instrument}%`);
            });

            query = query.or(orConditions.join(','));
        }

        // Don't apply pagination yet - we need to get all results for random sampling
        // Order by name for consistent results
        query = query.order('name', { ascending: true });

        // Execute query to get all matching works
        const { data: allWorks, error, count } = await query;

        if (error) {
            console.error('Supabase query error:', error);
            return new Response(JSON.stringify({
                error: 'Database query failed',
                details: error.message
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (!allWorks || allWorks.length === 0) {
            return json({
                works: [],
                total: 0,
                filters_applied: filters
            });
        }

        // Randomly sample 10 works from the full result set
        const sampleSize = Math.min(10, allWorks.length);
        const shuffled = [...allWorks].sort(() => Math.random() - 0.5);
        const works = shuffled.slice(0, sampleSize);

        // Fetch related data for sampled works
        // Get unique composer IDs, genre IDs, and subgenre IDs
        const composerIds = [...new Set(works.map(w => w.composer).filter(Boolean))];
        const genreIds = [...new Set(works.map(w => w.genre_id).filter(Boolean))];
        const subgenreIds = [...new Set(works.map(w => w.subgenre_id).filter(Boolean))];

        // Fetch composers
        const { data: composers } = await supabase
            .from('composers')
            .select('id, name, birth_date, death_date, birth_location, nationality, composer_period, short_description, long_description, image_url, gender')
            .in('id', composerIds);

        // Fetch genres
        const { data: genres } = await supabase
            .from('genres')
            .select('id, name, slug')
            .in('id', genreIds);

        // Fetch subgenres
        const { data: subgenres } = await supabase
            .from('subgenres')
            .select('id, name, slug')
            .in('id', subgenreIds);

        // Create lookup maps
        const composerMap = new Map((composers || []).map(c => [c.id, c]));
        const genreMap = new Map((genres || []).map(g => [g.id, g]));
        const subgenreMap = new Map((subgenres || []).map(s => [s.id, s]));

        // Transform the data to match WorkWithRelations type
        const transformedWorks: WorkWithRelations[] = works.map((work: any) => ({
            ...work,
            composer_details: work.composer ? composerMap.get(work.composer) : undefined,
            genre_details: work.genre_id ? genreMap.get(work.genre_id) : undefined,
            subgenre_details: work.subgenre_id ? subgenreMap.get(work.subgenre_id) : undefined
        }));

        // Return results
        const response: SqlSearchResponse = {
            works: transformedWorks,
            total: count || 0,
            filters_applied: filters
        };

        return json(response);

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('SQL search error:', errorMessage);
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
