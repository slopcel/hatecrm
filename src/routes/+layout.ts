import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { LayoutLoad } from './$types';
import type { Database } from '$lib/types/database';

export const load: LayoutLoad = async ({ data, depends, fetch }) => {
	// This tells SvelteKit to re-run this load function when auth state changes
	depends('supabase:auth');

	const supabase = isBrowser()
		? createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
				global: {
					fetch
				}
			})
		: createServerClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
				global: {
					fetch
				},
				cookies: {
					getAll() {
						return data.session ? [] : [];
					}
				}
			});

	// Get session from server data (already validated)
	const session = data.session;
	const user = data.user;

	return {
		supabase,
		session,
		user
	};
};

