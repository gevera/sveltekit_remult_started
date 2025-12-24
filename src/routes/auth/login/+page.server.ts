import { auth } from '$modules/auth/server/auth';
import { fail, redirect, isRedirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { route } from '$lib/ROUTES';
import { loginSchema } from '$modules/auth/authSchemas';
import { extractFormData } from '$lib/utils';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		redirect(302, route('/admin'));
	}
};

export const actions: Actions = {
	default: async ({ request }) => {
		const { data, error } = await extractFormData(request, loginSchema);

		if (error || !data) {
			console.error(error);
			return fail(400, { error });
		}

		try {
			await auth.api.signInEmail({
				body: data,
				headers: request.headers
			});

			redirect(302, route('/admin'));
		} catch (error) {
			// Re-throw redirects - they're not errors
			if (isRedirect(error)) {
				throw error;
			}

			// TODO: Save errors to Database
			console.error(error);
			return fail(400, { error: (error as Error)?.message ?? 'An error occurred during login' });
		}
	}
};

