import { createComposer, createSource } from "$lib/airtable.js";
import { extractComposer } from "$lib/openai";
import type { Composer } from "$lib/zodDefinitions.js";
import { json } from "@sveltejs/kit";

export async function POST({ request }) {
    const body = await request.json();
    try {
        const source = await createSource(body.source)
        if (!source || source == '') {
            return json({ error: 'no source' })
        }
        const { data } = await extractComposer(body.text)
        if (data) {
            const composer: Composer = data as Composer

            composer.sources = [source]
            const res = await createComposer(composer)
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