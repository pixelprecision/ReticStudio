/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./resources/js/admin/index.html',
		'./resources/js/admin/src/**/*.{js,jsx,ts,tsx}',
		'./resources/views/**/*.blade.php',
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Nunito', 'sans-serif'],
			},
			colors: {
				primary: {
					50: '#f0f9ff',
					100: '#e0f2fe',
					200: '#bae6fd',
					300: '#7dd3fc',
					400: '#38bdf8',
					500: '#0ea5e9',
					600: '#0284c7',
					700: '#0369a1',
					800: '#075985',
					900: '#0c4a6e',
					950: '#082f49',
				},
			},
			spacing: {
				'72': '18rem',
				'84': '21rem',
				'96': '24rem',
			},
			boxShadow: {
				'outline-primary': '0 0 0 3px rgba(14, 165, 233, 0.45)',
			},
		},
	},
	plugins: [
		require('@tailwindcss/forms'),
	],
}
