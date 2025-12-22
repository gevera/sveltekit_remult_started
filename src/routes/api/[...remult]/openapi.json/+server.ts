import { json } from '@sveltejs/kit';
import { openApiDocument } from '../../../../server/api';

export const GET = () => {
	return json(openApiDocument);
};
