import type { Handle } from '@sveltejs/kit';

function generateNonce() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}
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

    event.locals.getUser = async () => {
        const {
            data: { user },
            error,
        } = await event.locals.supabase.auth.getUser();
        if (error) {
            console.error('Error getting user:', error);
            return null;
        }
        return user;
    };

    const nonce = generateNonce();

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



    return response;
};
