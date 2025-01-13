// src/routes/api/proxy/+server.ts
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
    const target = url.searchParams.get('url');
    if (!target) return new Response('Missing "url" query parameter', { status: 400 });

    let targetUrl: URL;
    try {
        targetUrl = new URL(target);
    } catch (err) {
        return new Response('Invalid URL', { status: 400 });
    }

    try {
        const response = await fetch(targetUrl.toString());
        const html = await response.text();
        return new Response(html, { status: 200 });
    } catch (err) {
        return new Response('Error fetching resource: ' + err, { status: 500 });
    }
};
