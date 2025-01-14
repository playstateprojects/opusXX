import { composerByName } from '$lib/airtable.js';
import { json } from '@sveltejs/kit';


export async function GET({ url }) {
    const name = url.searchParams.get('name');
    if (!name) {
        return new Response(JSON.stringify({ error: 'name is required' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
    try {

        const data = await composerByName(name)
        console.log("dd", data)


        return json(data);
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}