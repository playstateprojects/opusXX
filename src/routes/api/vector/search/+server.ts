import { RequestEvent } from "@sveltejs/kit";
import { normalizePeriod } from "$lib/server/taxonomy";


// AutoRAG search takes a single query string, so categorical filters are folded
// into the query text using the canonical period names
function enrichQuery(query: string, filters?: Record<string, string | string[]>): string {
    if (!filters) return query;

    const terms: string[] = [];
    const asArray = (v: string | string[]) => (Array.isArray(v) ? v : [v]);

    if (filters.period) {
        terms.push(...asArray(filters.period).map(p => `${normalizePeriod(p) ?? p} period`));
    }
    if (filters.genre) terms.push(...asArray(filters.genre));
    if (filters.subgenre) terms.push(...asArray(filters.subgenre));
    if (filters.instrument) terms.push(...asArray(filters.instrument));
    if (filters.composer) terms.push(...asArray(filters.composer));

    return terms.length > 0 ? `${query} (${terms.join(', ')})` : query;
}

export async function POST({ request, platform }: RequestEvent) {
    const body = await request.json();
    console.log("Bodyxx:", body);

    // Check if AI binding is available
    if (!platform?.env?.AI) {
        console.error("AI binding not found");
        return new Response(JSON.stringify({
            success: false,
            error: "AI service not configured"
        }), {
            status: 500,
        });
    }

    try {
        console.log('go', platform?.env?.AI)

        // Check if autorag method exists
        if (!platform.env.AI.autorag) {
            console.error("AI.autorag method not found");
            return new Response(JSON.stringify({
                success: false,
                error: "AI search service not available"
            }), {
                status: 500,
            });
        }
        console.log("body", body)
        const result = await platform.env.AI.autorag("dawn-frog-0b30").search({
            query: enrichQuery(body.query, body.filters),
        });

        return new Response(JSON.stringify({ success: true, result }), {
            status: 200,
        });
    } catch (error) {
        console.error("Vector search error:", error);
        return new Response(JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred"
        }), {
            status: 500,
        });
    }
}
