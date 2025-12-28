import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { EnemyWithGrievances } from '$lib/types/database';

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) {
		redirect(303, '/auth/login');
	}

	// Fetch enemies with their grievances
	const { data: enemies, error } = await locals.supabase
		.from('enemies')
		.select(`
			*,
			grievances (*)
		`)
		.eq('user_id', user.id)
		.order('created_at', { ascending: false });

	if (error) {
		console.error('Error fetching enemies:', error);
	}

	// Transform data to include grievance count
	const enemiesWithCount: EnemyWithGrievances[] = (enemies || []).map((enemy) => ({
		...enemy,
		grievances: enemy.grievances || [],
		grievance_count: enemy.grievances?.length || 0
	}));

	return {
		user,
		enemies: enemiesWithCount
	};
};

export const actions: Actions = {
	addEnemy: async ({ request, locals }) => {
		const { session, user } = await locals.safeGetSession();
		if (!session || !user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const formData = await request.formData();
		const name = formData.get('name')?.toString().trim();
		const nickname = formData.get('nickname')?.toString().trim() || null;
		const twitter_handle = formData.get('twitter_handle')?.toString().trim() || null;
		const tweet_url = formData.get('tweet_url')?.toString().trim() || null;
		const reason = formData.get('reason')?.toString().trim() || null;

		if (!name) {
			return fail(400, { message: 'Name is required', action: 'addEnemy' });
		}

		const { data: enemy, error } = await locals.supabase.from('enemies').insert({
			user_id: user.id,
			name,
			nickname,
			twitter_handle,
			tweet_url
		}).select().single();

		if (error) {
			console.error('Error adding enemy:', error);
			return fail(500, { message: 'Failed to add to the list', action: 'addEnemy' });
		}

		// If a reason was provided, add it as the first grievance
		if (reason && enemy) {
			const { error: grievanceError } = await locals.supabase.from('grievances').insert({
				enemy_id: enemy.id,
				reason,
				tweet_url // Use the same tweet URL for the grievance
			});

			if (grievanceError) {
				console.error('Error adding initial grievance:', grievanceError);
				// Don't fail the whole operation, enemy was still created
			}
		}

		return { success: true, action: 'addEnemy' };
	},

	deleteEnemy: async ({ request, locals }) => {
		const { session, user } = await locals.safeGetSession();
		if (!session || !user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const formData = await request.formData();
		const enemyId = formData.get('enemyId')?.toString();

		if (!enemyId) {
			return fail(400, { message: 'Enemy ID required', action: 'deleteEnemy' });
		}

		const { error } = await locals.supabase
			.from('enemies')
			.delete()
			.eq('id', enemyId)
			.eq('user_id', user.id);

		if (error) {
			console.error('Error deleting enemy:', error);
			return fail(500, { message: 'Failed to remove from list', action: 'deleteEnemy' });
		}

		return { success: true, action: 'deleteEnemy' };
	},

	addGrievance: async ({ request, locals }) => {
		const { session, user } = await locals.safeGetSession();
		if (!session || !user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const formData = await request.formData();
		const enemyId = formData.get('enemyId')?.toString();
		const reason = formData.get('reason')?.toString().trim();

		if (!enemyId || !reason) {
			return fail(400, { message: 'Enemy ID and reason required', action: 'addGrievance' });
		}

		// Verify the enemy belongs to this user
		const { data: enemy } = await locals.supabase
			.from('enemies')
			.select('id')
			.eq('id', enemyId)
			.eq('user_id', user.id)
			.single();

		if (!enemy) {
			return fail(404, { message: 'Enemy not found', action: 'addGrievance' });
		}

		const { error } = await locals.supabase.from('grievances').insert({
			enemy_id: enemyId,
			reason
		});

		if (error) {
			console.error('Error adding grievance:', error);
			return fail(500, { message: 'Failed to add grievance', action: 'addGrievance' });
		}

		return { success: true, action: 'addGrievance', enemyId };
	},

	deleteGrievance: async ({ request, locals }) => {
		const { session, user } = await locals.safeGetSession();
		if (!session || !user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const formData = await request.formData();
		const grievanceId = formData.get('grievanceId')?.toString();

		if (!grievanceId) {
			return fail(400, { message: 'Grievance ID required', action: 'deleteGrievance' });
		}

		// Delete grievance (RLS will ensure user owns the parent enemy)
		const { error } = await locals.supabase
			.from('grievances')
			.delete()
			.eq('id', grievanceId);

		if (error) {
			console.error('Error deleting grievance:', error);
			return fail(500, { message: 'Failed to delete grievance', action: 'deleteGrievance' });
		}

		return { success: true, action: 'deleteGrievance' };
	}
};
