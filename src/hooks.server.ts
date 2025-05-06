import { randomBytes } from 'crypto';
import type { Handle } from '@sveltejs/kit';
import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit';

const PUBLIC_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const PUBLIC_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const handle: Handle = async ({ event, resolve }) => {
    event.locals.supabase = createSupabaseServerClient({
        supabaseUrl: PUBLIC_SUPABASE_URL,
        supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
        event,
    });

    event.locals.getSession = async () => {
        const {
            data: { session },
        } = await event.locals.supabase.auth.getSession();
        return session;
    };

    const nonce = randomBytes(16).toString('hex');

    const response = await resolve(event, {
        filterSerializedResponseHeaders(name) {
            return name === 'content-range';
        },
        transformPageChunk: ({ html }) => {
            // Debug the transformation
            console.log('Transforming HTML with nonce:', nonce);
            return html.replace(/__NONCE__/g, nonce);
        },
    });

    // Check if the request is for the waitlist page
    const isWaitlistPage = event.url.pathname.includes('/waitlist');

    // Debug the URL path to ensure we're correctly identifying the waitlist page
    console.log('URL path:', event.url.pathname, 'isWaitlistPage:', isWaitlistPage);


    return response;
};
