import { Planet } from '$lib/entites/planets';
import { remultApi } from 'remult/remult-sveltekit';

export const api = remultApi({
	entities: [Planet],
	admin: true
});

export const openApiDocument = api.openApiDoc({ title: 'remult-planets' });
