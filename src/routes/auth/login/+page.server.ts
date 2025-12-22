import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { session } = await locals.safeGetSession();

	// Already logged in? Redirect to dashboard
	if (session) {
		redirect(303, '/dashboard');
	}
};

export const actions: Actions = {
	login: async ({ request, locals }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required' });
		}

		const { error } = await locals.supabase.auth.signInWithPassword({
			email,
			password
		});

		if (error) {
			return fail(400, { error: error.message });
		}

		redirect(303, '/dashboard');
	},

	google: async ({ locals, url }) => {
		const { data, error } = await locals.supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: `${url.origin}/auth/callback`
			}
		});

		if (error) {
			return fail(400, { error: error.message });
		}

		if (data.url) {
			redirect(303, data.url);
		}
	},

	github: async ({ locals, url }) => {
		const { data, error } = await locals.supabase.auth.signInWithOAuth({
			provider: 'github',
			options: {
				redirectTo: `${url.origin}/auth/callback`
			}
		});

		if (error) {
			return fail(400, { error: error.message });
		}

		if (data.url) {
			redirect(303, data.url);
		}
	}
};

