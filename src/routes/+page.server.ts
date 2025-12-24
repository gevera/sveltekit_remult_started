import { auth } from '$modules/auth/server/auth';
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { route } from '$lib/ROUTES';

export const actions: Actions = {
	logout: async ({ request }) => {
		await auth.api.signOut({
			headers: request.headers
		});
		redirect(302, route('/'));
	}
};

