import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();

	// Protected route - redirect to login if not authenticated
	if (!session || !user) {
		redirect(303, '/auth/login');
	}

	// Fetch user's subscription status (example)
	const { data: subscription } = await locals.supabase
		.from('subscriptions')
		.select('*')
		.eq('user_id', user.id)
		.single();

	return {
		user,
		subscription
	};
};

