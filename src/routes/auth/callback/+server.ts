import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Handle OAuth callback - exchange code for session
export const GET: RequestHandler = async ({ url, locals }) => {
	const code = url.searchParams.get('code');
	const next = url.searchParams.get('next') ?? '/dashboard';

	if (code) {
		const { error } = await locals.supabase.auth.exchangeCodeForSession(code);

		if (!error) {
			// Successful auth - redirect to dashboard or intended destination
			redirect(303, next);
		}
	}

	// Auth failed - redirect to error page or login
	redirect(303, '/auth/login?error=auth_failed');
};

