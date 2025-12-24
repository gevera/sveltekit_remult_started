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
		const email = formData.get('email')?.toString();
		const password = formData.get('password')?.toString();

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required' });
		}

		try {
			await auth.api.signInEmail({
				body: {
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

