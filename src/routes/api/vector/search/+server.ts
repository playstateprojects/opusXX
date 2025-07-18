import { RequestEvent } from "@sveltejs/kit";


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

        const result = await platform.env.AI.autorag("dawn-frog-0b30").search({
            query: body.query,
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
