import { SupabaseClient, Session, User } from '@supabase/supabase-js'
import type { R2Bucket } from '@cloudflare/workers-types'

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient
			getSession(): Promise<Session | null>
			getUser(): Promise<User | null>
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
				AI: {
					autorag: (data: any) => { search: (params: { query: string }) => Promise<any> };
				}
				R2: R2Bucket
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
			DEEPSEEK_API_KEY: string;
		}
	}
}

export { };
