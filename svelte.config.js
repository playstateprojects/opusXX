import cloudflare from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: cloudflare(),
		alias: {
			$lib: './src/lib',
			'$lib/*': './src/lib/*'
		},
		csp: {
			mode: 'auto',
			directives: {
				'script-src': ['self', 'https://use.typekit.net', 'unsafe-inline'],
				'style-src': [
					'self',
					'https://use.typekit.net',
					'https://p.typekit.net',
					'https://imagedelivery.net',
					'https://fonts.googleapis.com',
					'https://fonts.gstatic.com',
					'unsafe-inline'
				],
				'font-src': [
					'self',
					'https://use.typekit.net',
					'https://p.typekit.net',
					'https://fonts.gstatic.com',
					'https://imagedelivery.net'
				]
			}
		}
	}
};

export default config;
