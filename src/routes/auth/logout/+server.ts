import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Logout must be POST to prevent CSRF
export const POST: RequestHandler = async ({ locals }) => {
	await locals.supabase.auth.signOut();
	redirect(303, '/');
};

