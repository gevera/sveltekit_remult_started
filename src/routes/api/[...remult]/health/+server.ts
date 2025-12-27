
import { dbClient } from '$server/api.js';
import { json } from '@sveltejs/kit';

export const GET = async () => {
	try {
		await dbClient.execute('SELECT 1');
		return json({
			database: 'connected',
			status: 'ok',
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		console.error(error);
		return json({
			database: 'disconnected',
			status: 'error',
			timestamp: new Date().toISOString()
		}, { status: 503 });
	}
	
}