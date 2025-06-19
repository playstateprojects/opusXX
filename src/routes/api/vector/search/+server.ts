import { RequestEvent } from "@sveltejs/kit";


export async function POST({ request, platform }: RequestEvent) {
    const body = await request.json();
    console.log("Body:", body);
    try {
        console.log('go', platform?.env?.AI)
        const result = await platform?.env?.AI.autorag("dawn-frog-0b30").search({
            query: body.query,
        });
        return new Response(JSON.stringify({ success: true, result }), {
            status: 200,
        });
    } catch (error) {
        console.log(error);
        return new Response(JSON.stringify({ success: false, error }), {
            status: 500,
        });
    }

}