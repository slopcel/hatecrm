// Auto-generated Supabase types - regenerate with: npx supabase gen types typescript
// For now, this is a placeholder. Run the command above after setting up your Supabase project.

export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export interface Database {
	public: {
		Tables: {
			// Add your tables here after running supabase gen types
			profiles: {
				Row: {
					id: string;
					email: string;
					full_name: string | null;
					avatar_url: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id: string;
					email: string;
					full_name?: string | null;
					avatar_url?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					email?: string;
					full_name?: string | null;
					avatar_url?: string | null;
					created_at?: string;
					updated_at?: string;
				};
			};
			subscriptions: {
				Row: {
					id: string;
					user_id: string;
					dodo_customer_id: string | null;
					dodo_subscription_id: string | null;
					status: string;
					plan: string | null;
					current_period_end: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					dodo_customer_id?: string | null;
					dodo_subscription_id?: string | null;
					status?: string;
					plan?: string | null;
					current_period_end?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					dodo_customer_id?: string | null;
					dodo_subscription_id?: string | null;
					status?: string;
					plan?: string | null;
					current_period_end?: string | null;
					created_at?: string;
					updated_at?: string;
				};
			};
		};
		Views: {};
		Functions: {};
		Enums: {};
	};
}

