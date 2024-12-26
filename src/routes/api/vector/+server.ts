
export async function POST({ request }) {
    const body = await request.json();
    return new Response(JSON.stringify({ error: 'Not implemented', body: body }));
}