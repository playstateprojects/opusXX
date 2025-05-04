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

    // Set a more permissive CSP for the waitlist page
    if (isWaitlistPage) {
        response.headers.set(
            'Content-Security-Policy',
            `default-src 'self'; script-src 'self' https://use.typekit.net https://prod-waitlist-widget.s3.us-east-2.amazonaws.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://prod-waitlist-widget.s3.us-east-2.amazonaws.com; img-src 'self' data: https://prod-waitlist-widget.s3.us-east-2.amazonaws.com https://p.typekit.net; font-src 'self' https://use.typekit.net; connect-src 'self' https://api.getwaitlist.com; object-src 'none'; base-uri 'self'; frame-src https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/`
        );
    } else {
        // Use the more secure CSP for other pages, but include reCAPTCHA domains
        response.headers.set(
            'Content-Security-Policy',
            `default-src 'self'; script-src 'self' https://use.typekit.net https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ 'nonce-${nonce}' 'sha256-BRMPMcskM/8JkGxnfV+Dv451MzxzBRgfQ0p/kpAG3vY=' 'sha256-EkUJtXb7kM6r1hdxv7JUNsN+LOcZgFr1mL7PB4l42NQ='; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://p.typekit.net; font-src 'self' https://use.typekit.net; connect-src 'self' https://api.getwaitlist.com; object-src 'none'; base-uri 'self'; frame-src https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/`
        );
    }

    return response;
};
