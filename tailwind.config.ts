/** @type {import('tailwindcss').Config}*/
const config = {
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'
	],

	plugins: [require('flowbite/plugin'), require('flowbite-typography')],

	darkMode: 'class',

	theme: {
		extend: {
			colors: {
				// flowbite-svelte
				primary: {
					50: '#f9fafb',   // Super light, barely-there grey
					100: '#f3f4f6',  // Like, paper-white but with attitude
					200: '#e5e7eb',  // Getting a bit more serious
					300: '#d1d5db',  // Nice middle-light tone
					400: '#9ca3af',  // Perfect for secondary text
					500: '#6b7280',  // Your go-to middle grey
					600: '#4b5563',  // Getting into the moody territory
					700: '#374151',  // Dark but not too dark
					800: '#1f2937',  // Almost-but-not-quite black
					900: '#111827'   // The deep end
				},
				gray: {
					800: '#0C2464',
					900: '#0C2464'
				}
			}
		}
	}
};

module.exports = config;
