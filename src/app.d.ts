import { SupabaseClient, Session } from '@supabase/supabase-js'

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient
			getSession(): Promise<Session | null>
		}
		interface PageData {
			session: Session | null
		}
		// interface Error {}
		// interface Platform {}
	}
	namespace NodeJS {
		interface ProcessEnv {
			CF_ACCOUNT_ID: string;
			CF_AI_TOKEN: string;
		}
	}
}

export { };
