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
	signup: async ({ request, locals, url }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (!email || !password) {
			return fail(400, {
				error: 'Please provide both email and password',
				email
			});
		}

		if (password.length < 6) {
			return fail(400, {
				error: 'Password must be at least 6 characters',
				email
			});
		}

		const { error } = await locals.supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: `${url.origin}/auth/callback`
			}
		});

		if (error) {
			console.error('Signup error:', error.message);
			return fail(400, {
				error: error.message,
				email
			});
		}

		return {
			success: true,
			message: 'Check your email to confirm your account'
		};
	},

	oauth: async ({ request, locals, url }) => {
		const formData = await request.formData();
		const provider = formData.get('provider') as 'google' | 'github';

		if (!provider || !['google', 'github'].includes(provider)) {
			return fail(400, { error: 'Invalid OAuth provider' });
		}

		const { data, error } = await locals.supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: `${url.origin}/auth/callback`
			}
		});

		if (error) {
			console.error('OAuth error:', error.message);
			return fail(400, { error: 'Failed to initiate OAuth signup' });
		}

		if (data.url) {
			redirect(303, data.url);
		}
	}
};

