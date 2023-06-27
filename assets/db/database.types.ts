export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json }
	| Json[];

export interface Database {
	public: {
		Tables: {
			cmd_analytics: {
				Row: {
					command: string;
					times: number;
				};
				Insert: {
					command: string;
					times?: number;
				};
				Update: {
					command?: string;
					times?: number;
				};
				Relationships: [];
			};
			music_notifications: {
				Row: {
					author: string;
					length: number;
					name: string;
					requestedby: string;
					server_id: string;
					started: string;
					thumbnail: string;
				};
				Insert: {
					author: string;
					length: number;
					name: string;
					requestedby: string;
					server_id: string;
					started?: string;
					thumbnail: string;
				};
				Update: {
					author?: string;
					length?: number;
					name?: string;
					requestedby?: string;
					server_id?: string;
					started?: string;
					thumbnail?: string;
				};
				Relationships: [];
			};
			ranks: {
				Row: {
					achivements: string[] | null;
					id: number;
					server_id: string | null;
					user_id: string | null;
					xp: number | null;
				};
				Insert: {
					achivements?: string[] | null;
					id?: number;
					server_id?: string | null;
					user_id?: string | null;
					xp?: number | null;
				};
				Update: {
					achivements?: string[] | null;
					id?: number;
					server_id?: string | null;
					user_id?: string | null;
					xp?: number | null;
				};
				Relationships: [];
			};
			reminders: {
				Row: {
					channel_id: string;
					created_at: string;
					future_sends: string[];
					id: number;
					message_id: string;
					remind_at: string;
					reminder: string;
					server_id: string;
					user_id: string;
				};
				Insert: {
					channel_id: string;
					created_at?: string;
					future_sends: string[];
					id?: number;
					message_id: string;
					remind_at: string;
					reminder: string;
					server_id: string;
					user_id: string;
				};
				Update: {
					channel_id?: string;
					created_at?: string;
					future_sends?: string[];
					id?: number;
					message_id?: string;
					remind_at?: string;
					reminder?: string;
					server_id?: string;
					user_id?: string;
				};
				Relationships: [];
			};
			servers: {
				Row: {
					config: Json | null;
					free_nitro_emotes: boolean;
					id: number;
					invited_at: string;
					prefix: string[];
					server_id: string;
					suggestion_accepted_channel: string | null;
					suggestion_channel: string | null;
					suggestion_denied_channel: string | null;
				};
				Insert: {
					config?: Json | null;
					free_nitro_emotes?: boolean;
					id?: number;
					invited_at?: string;
					prefix?: string[];
					server_id: string;
					suggestion_accepted_channel?: string | null;
					suggestion_channel?: string | null;
					suggestion_denied_channel?: string | null;
				};
				Update: {
					config?: Json | null;
					free_nitro_emotes?: boolean;
					id?: number;
					invited_at?: string;
					prefix?: string[];
					server_id?: string;
					suggestion_accepted_channel?: string | null;
					suggestion_channel?: string | null;
					suggestion_denied_channel?: string | null;
				};
				Relationships: [];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
}
