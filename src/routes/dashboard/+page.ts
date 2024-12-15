import { redirect, type Load } from '@sveltejs/kit';

export const load: Load = async ({ parent }) => {
    const parentData = await parent();

    if (!parentData.session) {
        throw redirect(303, '/login');
    }

    return {
        ...parentData,
        user: parentData.session.user
    };
};