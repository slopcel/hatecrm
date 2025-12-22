import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

interface LocalEnemy {
	id: string;
	name: string;
	nickname: string | null;
	twitter_handle: string | null;
	tweet_url: string | null;
	created_at: string;
	position_x: number | null;
	position_y: number | null;
}

interface LocalGrievance {
	id: string;
	enemy_id: string;
	reason: string;
	tweet_url: string | null;
	created_at: string;
}

interface SyncRequest {
	enemies: LocalEnemy[];
	grievances: LocalGrievance[];
}

export const POST: RequestHandler = async ({ request, locals }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { enemies, grievances }: SyncRequest = await request.json();

		if (!enemies || !Array.isArray(enemies)) {
			return json({ error: 'Invalid data format' }, { status: 400 });
		}

		// Track mapping from local IDs to new Supabase IDs
		const enemyIdMap = new Map<string, string>();
		let syncedEnemies = 0;
		let syncedGrievances = 0;

		// Insert enemies one by one to get their new IDs
		for (const enemy of enemies) {
			const { data: insertedEnemy, error: enemyError } = await locals.supabase
				.from('enemies')
				.insert({
					user_id: user.id,
					name: enemy.name,
					nickname: enemy.nickname,
					twitter_handle: enemy.twitter_handle,
					tweet_url: enemy.tweet_url,
					position_x: enemy.position_x,
					position_y: enemy.position_y,
					created_at: enemy.created_at
				})
				.select('id')
				.single();

			if (enemyError) {
				console.error('Error inserting enemy:', enemyError);
				continue;
			}

			if (insertedEnemy) {
				enemyIdMap.set(enemy.id, insertedEnemy.id);
				syncedEnemies++;
			}
		}

		// Insert grievances with mapped enemy IDs
		for (const grievance of grievances) {
			const newEnemyId = enemyIdMap.get(grievance.enemy_id);
			
			if (!newEnemyId) {
				// Enemy wasn't synced, skip this grievance
				continue;
			}

			const { error: grievanceError } = await locals.supabase
				.from('grievances')
				.insert({
					enemy_id: newEnemyId,
					reason: grievance.reason,
					tweet_url: grievance.tweet_url,
					created_at: grievance.created_at
				});

			if (grievanceError) {
				console.error('Error inserting grievance:', grievanceError);
				continue;
			}

			syncedGrievances++;
		}

		return json({
			success: true,
			syncedEnemies,
			syncedGrievances
		});
	} catch (error) {
		console.error('Sync error:', error);
		return json({ error: 'Failed to sync data' }, { status: 500 });
	}
};

