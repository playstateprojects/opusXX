import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ locals: { getSession, getUser } }) => {
    const session = await getSession();
    const user = session ? await getUser() : null;

    return {
        session,
        user,
    };
};
