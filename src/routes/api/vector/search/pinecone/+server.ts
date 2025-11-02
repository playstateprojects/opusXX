import { json, type RequestHandler } from '@sveltejs/kit';
import OpenAI from 'openai';
import { OPENAI_API_KEY, PINECONE_API_KEY } from '$env/static/private';
import type { ActionDecisionFilters } from '$lib/types';

export const POST: RequestHandler = async ({ request, platform }) => {
    const { query, topK = 5, filters } = await request.json();

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    const embeddingRes = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: query
    });

    const xq = embeddingRes.data[0].embedding;

    // Build Pinecone filter from ActionDecisionFilters
    const pineconeFilter = buildPineconeFilter(filters);
    console.log('Pinecone search with filters:', JSON.stringify(pineconeFilter, null, 2));

    const res = await fetch(`https://opusxx-a805eee.svc.aped-4627-b74a.pinecone.io/query`, {
        method: 'POST',
        headers: {
            'Api-Key': PINECONE_API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            vector: xq,
            topK,
            includeMetadata: true,
            filter: pineconeFilter
        })
    }).then(r => r.json());

    return json(res.matches);
}

/**
 * Converts ActionDecisionFilters to Pinecone filter format
 * Maps filter fields to Pinecone metadata keys based on the example provided:
 * - composer -> composer_name
 * - period -> period (or composer_period)
 * - genre -> genre
 * - subgenre -> subgenre
 * - instrument -> instrumentation (array field, needs special handling)
 */
function buildPineconeFilter(filters?: ActionDecisionFilters): Record<string, any> {
    // Default filter - ensure we have some valid metadata
    const baseFilter: Record<string, any> = {
        genre: { "$exists": true }
    };

    if (!filters) {
        return baseFilter;
    }

    const pineconeFilter: Record<string, any> = {};

    // Map composer to composer_name (exact match or $in for arrays)
    if (filters.composer) {
        const composers = Array.isArray(filters.composer) ? filters.composer : [filters.composer];
        pineconeFilter.composer_name = composers.length === 1
            ? { "$eq": composers[0] }
            : { "$in": composers };
    }

    // Map period to period metadata field (exact match or $in for arrays)
    if (filters.period) {
        const periods = Array.isArray(filters.period) ? filters.period : [filters.period];
        pineconeFilter.period = periods.length === 1
            ? { "$eq": periods[0] }
            : { "$in": periods };
    }

    // Map genre to genre metadata field (exact match or $in for arrays)
    if (filters.genre) {
        const genres = Array.isArray(filters.genre) ? filters.genre : [filters.genre];
        pineconeFilter.genre = genres.length === 1
            ? { "$eq": genres[0] }
            : { "$in": genres };
    }

    // Map subgenre to subgenre metadata field (exact match or $in for arrays)
    if (filters.subgenre) {
        const subgenres = Array.isArray(filters.subgenre) ? filters.subgenre : [filters.subgenre];
        pineconeFilter.subgenre = subgenres.length === 1
            ? { "$eq": subgenres[0] }
            : { "$in": subgenres };
    }

    // Map instrument to instrumentation (contains check for array field)
    // The instrumentation field in Pinecone is a JSON array stored as string
    if (filters.instrument) {
        const instruments = Array.isArray(filters.instrument)
            ? filters.instrument
            : [filters.instrument];

        // Use $in operator to match if any of the instruments are in the instrumentation array
        pineconeFilter.instrumentation = {
            "$in": instruments
        };
    }

    // If no filters were applied, return the base filter
    return Object.keys(pineconeFilter).length > 0 ? pineconeFilter : baseFilter;
}