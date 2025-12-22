import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();

	return {
		user: user ?? null,
		isLoggedIn: !!session
	};
};

