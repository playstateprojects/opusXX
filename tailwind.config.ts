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
			fontFamily: {
				// Replace these with your actual Adobe font family names
				sans: ['Roboto', 'ff-zwo-web-pro', 'system-ui', 'sans-serif'],
				serif: ['courier', 'Georgia', 'serif'],
				zwo: ['ff-zwo-web-pro', 'Georgia', 'serif'],
				// Add more custom font families as needed
				heading: ['ff-zwo-corr-web-pro', 'system-ui', 'sans-serif'],
				zwocorr: ['ff-zwo-corr-web-pro', 'system-ui', 'sans-serif'],
			},
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
				},
				yellow: {
					100: '#FFF9E1',
					200: '#FEF0B3',
					300: '#FCE680',
					400: '#F9DB4D',
					500: '#EAC645', // Your custom yellow
					600: '#D0AD39',
					700: '#B5902F',
					800: '#9A7525',
					900: '#7F5C1C',
				},
				acid: {
					500: '#E5FF00'
				},
				spotlight: {
					"premiere": "#FF5733"

				},
				xx: {
					red: '#FF5733',
					peach: '#F47C7C',
					yellow: '#E5FF00',
				},
				period: {
					"romantic": '#F47C7C',
					"late_romantic": '#F47C7C',
					"early_romantic": '#F47C7C',
					"classical": '#FF00E5',
					"baroque": '#EAC645',
					"baroque_text": '#000',
					"contemporary": '#FF5733',
					"20th_century": '#A4FCFE',
					"20th_centuary": '#A4FCFE',
					"20th_century_text": '#000',
				}
			}
		}
	}
};

module.exports = config;
