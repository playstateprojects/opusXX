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
		interface Platform {
			env: {
				VECTORIZE: {
					insert: (data: any) => Promise<any>;
					query: (data: any, options: any) => Promise<any>;
					// Add other methods if VECTORIZE supports more
				};
			};
		}
		// interface Error {}
		// interface Platform {}
	}
	namespace NodeJS {
		interface ProcessEnv {
			CF_ACCOUNT_ID: string;
			CF_AI_TOKEN: string;
			OPENAI_API_KEY: string;
		}
	}
}

export { };
