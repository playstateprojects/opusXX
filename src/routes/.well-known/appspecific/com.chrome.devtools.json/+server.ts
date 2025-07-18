import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
    // Return empty JSON for Chrome DevTools
    return new Response(JSON.stringify({}), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
};
