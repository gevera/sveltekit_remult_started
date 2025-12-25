import { redirect } from '@sveltejs/kit';
import { route } from '$lib/ROUTES';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	if (!locals.user) {
		redirect(302, route('/auth/login'));
	}
	return {};
}) satisfies PageServerLoad;
