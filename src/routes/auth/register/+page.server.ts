import { auth } from '$modules/auth/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { route } from '$lib/ROUTES';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		redirect(302, route('/admin'));
	}
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name')?.toString();
		const email = formData.get('email')?.toString();
		const password = formData.get('password')?.toString();

		if (!name || !email || !password) {
			return fail(400, { error: 'Name, email and password are required' });
		}

		try {
			await auth.api.signUpEmail({
				body: {
					name,
					email,
					password
				},
				headers: request.headers
			});
			redirect(302, route('/admin'));
		} catch (error) {
			// TODO: Save errors to Database
			console.error(error);
			return fail(400, { error: (error as Error)?.message ?? 'An error occurred' });
		}

	}
};

