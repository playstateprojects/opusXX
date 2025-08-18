
import { R2Bucket } from '@cloudflare/workers-types';
import { error, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, platform }) => {
    // params.key already contains the *entire* rest of the URL path,
    // e.g. "orchestral//construction-in-space.md"
    if (!params.key) throw error(400, 'missing key');
    const key = decodeURIComponent(params.key);

    const r2 = platform?.env?.R2 as R2Bucket | undefined;
    if (!r2) throw error(500, 'R2 binding not found');
    console.log('Connected bucket ->', await r2.list({ limit: 5 }));
    console.log("env keys:", Object.keys(platform?.env || {}));
    const object = await r2.get(key);  // just in case
    console.log("object", object)
    console.log("key", key)
    if (!object) throw error(404, `object "${key}" not found`);

    const text = await object.text();

    return new Response(JSON.stringify({ content: text }), {
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
};
