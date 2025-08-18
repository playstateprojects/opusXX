import { extractComposer } from "$lib/openai";
import type { ComposerExtract } from "$lib/types.js";
import { json } from "@sveltejs/kit";
// import { createComposer } from "$lib/utils/supabase.js";

export async function POST({ request }) {
    const body = await request.json();
    try {
        const { data } = await extractComposer(body.text)
        if (data) {
            const composer: ComposerExtract = data as ComposerExtract
            
            // TODO: Implement createComposer function in supabase.ts
            // Convert extracted data to PostgreSQL format and create in database
            console.log("TODO: Save composer to PostgreSQL database", {
                name: composer.name,
                birth_date: composer.birthDate,
                death_date: composer.deathDate,
                birth_location: composer.birthLocation,
                death_location: composer.deathLocation,
                long_description: composer.longDescription,
                short_description: composer.shortDescription,
                image_url: composer.imageURL,
                gender: composer.gender,
                nationality: composer.nationality,
                sources: composer.sources ? JSON.stringify(composer.sources) : null,
                tags: composer.tags ? JSON.stringify(composer.tags) : null,
                references: composer.refrences ? JSON.stringify(composer.refrences) : null
            })
        }

        return json({ data: data });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}