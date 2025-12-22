import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { Handle } from '@sveltejs/kit';
import type { Database } from '$lib/types/database';

export const handle: Handle = async ({ event, resolve }) => {
	// Create Supabase server client with cookie-based session handling
	event.locals.supabase = createServerClient<Database>(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				getAll: () => event.cookies.getAll(),
				setAll: (cookiesToSet) => {
					cookiesToSet.forEach(({ name, value, options }) => {
						event.cookies.set(name, value, { ...options, path: '/' });
					});
				}
			}
		}
	);

	// Safe session getter that validates the JWT by calling getUser()
	// This prevents session spoofing by verifying the token server-side
	event.locals.safeGetSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();

		if (!session) {
			return { session: null, user: null };
		}

		// IMPORTANT: Validate the session by calling getUser()
		// getSession() only reads from cookies and can be spoofed
		// getUser() actually validates the JWT with Supabase
		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();

		if (error || !user) {
			// Invalid session - clear it
			return { session: null, user: null };
		}

		return { session, user };
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			// Supabase needs these headers for auth
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};

