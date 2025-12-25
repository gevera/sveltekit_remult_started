import type { Handle } from '@sveltejs/kit';
import { auth } from './auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';

export const handleAuth: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	if (session) {
		event.locals.user = session.user;
		event.locals.session = session.session;
	}

	return svelteKitHandler({ event, resolve, auth, building });
};
