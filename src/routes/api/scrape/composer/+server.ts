import { createComposer } from "$lib/airtable.js";
import { extractComposer } from "$lib/openai";
import type { Composer } from "$lib/zodDefinitions.js";
import { json } from "@sveltejs/kit";

export async function POST({ request }) {
    const body = await request.json();
    try {

        const data = await extractComposer(body.text)
        if (!data.error) {
            const res = await createComposer(data as Composer)
            console.log("created c", res)
        }

        return json({ data: data });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}