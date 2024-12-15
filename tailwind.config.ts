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
					50: '#ecfdf5',
					100: '#d1fae5',
					200: '#a7f3d0',
					300: '#6ee7b7',
					400: '#34d399',
					500: '#10b981',
					600: '#059669',
					700: '#3cf4a2',
					800: '#065f46',
					900: '#0C2464'
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
