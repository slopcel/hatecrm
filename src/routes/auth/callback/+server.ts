import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	const code = url.searchParams.get('code');
	const redirectTo = url.searchParams.get('redirectTo') ?? '/dashboard';

	if (code) {
		const { error } = await locals.supabase.auth.exchangeCodeForSession(code);

		if (error) {
			console.error('OAuth callback error:', error.message);
			redirect(303, '/auth/login?error=Could not authenticate');
		}
	}

	redirect(303, redirectTo);
};

