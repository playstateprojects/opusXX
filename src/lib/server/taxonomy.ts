// Canonical search taxonomy shared by the agents and the SQL/vector search routes.
//
// Periods are derived from composition year:
//   < 1400 Medieval | < 1600 Renaissance | < 1750 Baroque | < 1820 Classical
//   < 1900 Romantic | < 2000 20th Century | else Contemporary
//
// Genres and subgenres are the live rows in the Supabase `genres` and
// `subgenres` tables, cached in-memory per server instance.

import type { SupabaseClient } from '@supabase/supabase-js';

export const CANONICAL_PERIODS = [
    'Medieval',
    'Renaissance',
    'Baroque',
    'Classical',
    'Romantic',
    '20th Century',
    'Contemporary'
] as const;

export type CanonicalPeriod = (typeof CANONICAL_PERIODS)[number];

export function periodFromYear(year: number): CanonicalPeriod {
    if (year < 1400) return 'Medieval';
    if (year < 1600) return 'Renaissance';
    if (year < 1750) return 'Baroque';
    if (year < 1820) return 'Classical';
    if (year < 1900) return 'Romantic';
    if (year < 2000) return '20th Century';
    return 'Contemporary';
}

// Common colloquial / legacy names mapped onto the canonical set (keys lowercased).
const PERIOD_SYNONYMS: Record<string, CanonicalPeriod> = {
    'early romantic': 'Romantic',
    'late romantic': 'Romantic',
    '19th century': 'Romantic',
    'modern': '20th Century',
    'modernist': '20th Century',
    'early 20th century': '20th Century',
    '21st century': 'Contemporary'
};

// Values actually present in works.period / Pinecone period metadata for each
// canonical period — used when exact matching against stored data.
export const PERIOD_VARIANTS: Record<CanonicalPeriod, string[]> = {
    Medieval: ['Medieval'],
    Renaissance: ['Renaissance'],
    Baroque: ['Baroque'],
    Classical: ['Classical'],
    Romantic: ['Romantic', 'Late Romantic', '19th Century'],
    '20th Century': ['20th Century', '20th century', 'Early 20th century', 'Modern'],
    Contemporary: ['Contemporary', '21st Century']
};

/**
 * Maps any period-ish string ("Romantic Period", "late romantic", "modern")
 * onto a canonical period, or null if unrecognized.
 */
export function normalizePeriod(value: string): CanonicalPeriod | null {
    const cleaned = value.trim().replace(/\s+period$/i, '').toLowerCase();
    const direct = CANONICAL_PERIODS.find((p) => p.toLowerCase() === cleaned);
    return direct ?? PERIOD_SYNONYMS[cleaned] ?? null;
}

/** Normalizes a string-or-array period filter, dropping unrecognized values. */
export function normalizePeriodFilter(value: string | string[]): CanonicalPeriod[] {
    const values = Array.isArray(value) ? value : [value];
    return [...new Set(values.map(normalizePeriod).filter((p): p is CanonicalPeriod => p !== null))];
}

export interface TaxonomyRow {
    id: number;
    name: string;
}

export interface Taxonomy {
    genres: TaxonomyRow[];
    subgenres: TaxonomyRow[];
}

const CACHE_TTL_MS = 10 * 60 * 1000;
let cache: { taxonomy: Taxonomy; fetchedAt: number } | null = null;

/** Fetches genre and subgenre rows from Supabase, cached for 10 minutes. */
export async function getTaxonomy(supabase: SupabaseClient): Promise<Taxonomy> {
    if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
        return cache.taxonomy;
    }

    const [genresResult, subgenresResult] = await Promise.all([
        supabase.from('genres').select('id, name').order('name'),
        supabase.from('subgenres').select('id, name').order('name')
    ]);

    const taxonomy: Taxonomy = {
        genres: genresResult.data ?? [],
        subgenres: subgenresResult.data ?? []
    };

    // Only cache a successful fetch so a transient failure doesn't stick for the TTL
    if (taxonomy.genres.length > 0 && taxonomy.subgenres.length > 0) {
        cache = { taxonomy, fetchedAt: Date.now() };
    }

    return taxonomy;
}

/**
 * Finds a taxonomy row by name, ignoring case and surrounding whitespace
 * (several subgenre rows have trailing spaces, e.g. "Suite ").
 */
export function matchTaxonomyName(rows: TaxonomyRow[], value: string): TaxonomyRow | undefined {
    const needle = value.trim().toLowerCase();
    return rows.find((row) => row.name.trim().toLowerCase() === needle);
}

/**
 * Normalizes a string-or-array genre/subgenre filter against taxonomy rows,
 * returning the matched rows (with canonical DB casing) and dropping unknowns.
 */
export function normalizeNameFilter(rows: TaxonomyRow[], value: string | string[]): TaxonomyRow[] {
    const values = Array.isArray(value) ? value : [value];
    const matched = values
        .map((v) => matchTaxonomyName(rows, v))
        .filter((row): row is TaxonomyRow => row !== undefined);
    return [...new Map(matched.map((row) => [row.id, row])).values()];
}
