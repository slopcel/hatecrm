import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { session } = await locals.safeGetSession();

	// Already logged in - redirect to dashboard
	if (session) {
		redirect(303, '/dashboard');
	}

	return {};
};

export const actions: Actions = {
	login: async ({ request, locals, url }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (!email || !password) {
			return fail(400, {
				error: 'Please provide both email and password',
				email
			});
		}

		const { error } = await locals.supabase.auth.signInWithPassword({
			email,
			password
		});

		if (error) {
			console.error('Login error:', error.message);
			return fail(400, {
				error: 'Invalid email or password',
				email
			});
		}

		// Redirect to the page they were trying to access, or dashboard
		const redirectTo = url.searchParams.get('redirectTo') ?? '/dashboard';
		redirect(303, redirectTo);
	},

	oauth: async ({ request, locals, url }) => {
		const formData = await request.formData();
		const provider = formData.get('provider') as 'google' | 'github';

		if (!provider || !['google', 'github'].includes(provider)) {
			return fail(400, { error: 'Invalid OAuth provider' });
		}

		const redirectTo = url.searchParams.get('redirectTo') ?? '/dashboard';

		const { data, error } = await locals.supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: `${url.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`
			}
		});

		if (error) {
			console.error('OAuth error:', error.message);
			return fail(400, { error: 'Failed to initiate OAuth login' });
		}

		if (data.url) {
			redirect(303, data.url);
		}
	}
};

