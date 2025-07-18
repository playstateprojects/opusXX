import { redirect } from '@sveltejs/kit';
import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ locals: { getUser } }) => {
    const user = await getUser();
    // Redirect to dashboard if already logged in
    if (user) {
        throw redirect(303, '/dashboard');
    }
    return {};
};
