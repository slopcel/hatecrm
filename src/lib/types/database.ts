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
			enemies: {
				Row: {
					id: string;
					user_id: string;
					name: string;
					nickname: string | null;
					avatar_url: string | null;
					twitter_handle: string | null;
					tweet_url: string | null;
					position_x: number | null;
					position_y: number | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					name: string;
					nickname?: string | null;
					avatar_url?: string | null;
					twitter_handle?: string | null;
					tweet_url?: string | null;
					position_x?: number | null;
					position_y?: number | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					name?: string;
					nickname?: string | null;
					avatar_url?: string | null;
					twitter_handle?: string | null;
					tweet_url?: string | null;
					position_x?: number | null;
					position_y?: number | null;
					created_at?: string;
				};
			};
			grievances: {
				Row: {
					id: string;
					enemy_id: string;
					reason: string;
					tweet_url: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					enemy_id: string;
					reason: string;
					tweet_url?: string | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					enemy_id?: string;
					reason?: string;
					tweet_url?: string | null;
					created_at?: string;
				};
			};
		};
		Views: {};
		Functions: {};
		Enums: {};
	};
}

// Helper types for easier usage
export type Enemy = Database['public']['Tables']['enemies']['Row'];
export type EnemyInsert = Database['public']['Tables']['enemies']['Insert'];
export type Grievance = Database['public']['Tables']['grievances']['Row'];
export type GrievanceInsert = Database['public']['Tables']['grievances']['Insert'];

// Extended type with grievance count
export type EnemyWithGrievances = Enemy & {
	grievances: Grievance[];
	grievance_count: number;
};

