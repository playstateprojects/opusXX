import { redirect } from '@sveltejs/kit';
import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ locals: { getSession } }) => {
    const session = await getSession();
    // Redirect to dashboard if already logged in
    if (session) {
        throw redirect(303, '/dashboard');
    }
    return {};
};
