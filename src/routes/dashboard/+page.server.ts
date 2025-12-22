import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();

	// Protected route - redirect to login if not authenticated
	if (!session || !user) {
		redirect(303, '/auth/login');
	}

	return {
		user
	};
};

