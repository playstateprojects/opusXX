import { extract } from "$lib/openai";
import { json } from "@sveltejs/kit";

export async function POST({ request }) {
    const body = await request.json();
    try {

        const data = await extract(body.text)
        console.log("data", data)


        return json({ data: data });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}