import { ScalarApiReference } from '@scalar/sveltekit';
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

const render = ScalarApiReference({
	pageTitle: 'API Documentation',
	sources: [
		{ url: '/api/openapi.json', title: 'Remult API' },
		{ url: '/api/auth/open-api/generate-schema', title: 'Authentication' }
	]
});

export const GET: RequestHandler = ({ locals }) => {
	if (!locals.user || !locals.session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	} else {
		return render();
	}
};
