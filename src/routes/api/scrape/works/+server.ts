import { extractWorkList } from "$lib/openai";
import type { WorkListType, WorkExtract } from "$lib/types.js";
import { json } from "@sveltejs/kit";

export async function POST({ request }) {
    const body = await request.json();
    try {
        // const source = await createSource(body.source)
        // if (!source || source == '') {
        //     return json({ error: 'no source' })
        // }
        const { data } = await extractWorkList(body.text)
        if (data) {
            const { works } = data as WorkList

            console.log("work", works)

            // const res = await createWork(work)

        }

        return json({ data: data });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}