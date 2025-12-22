import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { enemyId, x, y } = await request.json();

		if (!enemyId || typeof x !== 'number' || typeof y !== 'number') {
			return json({ error: 'Invalid data' }, { status: 400 });
		}

		const { error } = await locals.supabase
			.from('enemies')
			.update({ position_x: x, position_y: y })
			.eq('id', enemyId)
			.eq('user_id', user.id);

		if (error) {
			console.error('Error updating position:', error);
			return json({ error: 'Failed to save position' }, { status: 500 });
		}

		return json({ success: true });
	} catch (error) {
		console.error('Position update error:', error);
		return json({ error: 'Failed to save position' }, { status: 500 });
	}
};

