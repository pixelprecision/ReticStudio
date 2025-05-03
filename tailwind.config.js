/** @type {import('tailwindcss').Config} */
export default {
	// Note: JIT mode is enabled by default in Tailwind CSS v4
	content: [
		'./resources/js/admin/index.html',
		'./resources/js/admin/src/**/*.{js,jsx,ts,tsx}',
		'./resources/views/**/*.blade.php',
	],
	safelist: [
		// Generate all px values from 1-1000 for all spacing properties
		...Array.from({ length: 1000 }, (_, i) => i + 1).flatMap(num => [
			`p-${num}px`, `pt-${num}px`, `pr-${num}px`, `pb-${num}px`, `pl-${num}px`, `px-${num}px`, `py-${num}px`,
			`m-${num}px`, `mt-${num}px`, `mr-${num}px`, `mb-${num}px`, `ml-${num}px`, `mx-${num}px`, `my-${num}px`,
			`w-${num}px`, `h-${num}px`, `gap-${num}px`, `space-x-${num}px`, `space-y-${num}px`,
			`top-${num}px`, `right-${num}px`, `bottom-${num}px`, `left-${num}px`
		]),

		// Generate all rem values from 1-50 for all spacing properties
		...Array.from({ length: 50 }, (_, i) => i + 1).flatMap(num => [
			`p-${num}rem`, `pt-${num}rem`, `pr-${num}rem`, `pb-${num}rem`, `pl-${num}rem`, `px-${num}rem`, `py-${num}rem`,
			`m-${num}rem`, `mt-${num}rem`, `mr-${num}rem`, `mb-${num}rem`, `ml-${num}rem`, `mx-${num}rem`, `my-${num}rem`,
			`w-${num}rem`, `h-${num}rem`, `gap-${num}rem`, `space-x-${num}rem`, `space-y-${num}rem`,
			`top-${num}rem`, `right-${num}rem`, `bottom-${num}rem`, `left-${num}rem`
		]),

		// Add numeric values without units (Tailwind default spacing)
		...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 20, 24, 32, 40, 48, 56, 64, 72, 80, 96].flatMap(num => [
			`p-${num}`, `pt-${num}`, `pr-${num}`, `pb-${num}`, `pl-${num}`, `px-${num}`, `py-${num}`,
			`m-${num}`, `mt-${num}`, `mr-${num}`, `mb-${num}`, `ml-${num}`, `mx-${num}`, `my-${num}`,
			`w-${num}`, `h-${num}`, `gap-${num}`, `space-x-${num}`, `space-y-${num}`,
			`top-${num}`, `right-${num}`, `bottom-${num}`, `left-${num}`
		]),

		...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 20, 24, 32, 40, 48, 56, 64, 72, 80, 96].flatMap(num => [
			`!p-${num}`, `!pt-${num}`, `!pr-${num}`, `!pb-${num}`, `!pl-${num}`, `!px-${num}`, `!py-${num}`,
			`!m-${num}`, `!mt-${num}`, `!mr-${num}`, `!mb-${num}`, `!ml-${num}`, `!mx-${num}`, `!my-${num}`,
			`!w-${num}`, `!h-${num}`, `!gap-${num}`, `!space-x-${num}`, `!space-y-${num}`,
			`!top-${num}`, `!right-${num}`, `!bottom-${num}`, `!left-${num}`
		]),

		// Generate 100-1000 in steps of 100 (without units)
		...[100, 200, 300, 400, 500, 600, 700, 800, 900, 1000].flatMap(num => [
			`p-${num}`, `pt-${num}`, `pr-${num}`, `pb-${num}`, `pl-${num}`, `px-${num}`, `py-${num}`,
			`m-${num}`, `mt-${num}`, `mr-${num}`, `mb-${num}`, `ml-${num}`, `mx-${num}`, `my-${num}`,
			`w-${num}`, `h-${num}`, `gap-${num}`, `space-x-${num}`, `space-y-${num}`,
			`top-${num}`, `right-${num}`, `bottom-${num}`, `left-${num}`
		]),

		// Important percentages for widths and heights
		...[10, 20, 25, 30, 33, 40, 50, 60, 66, 70, 75, 80, 90, 100].flatMap(num => [
			`w-${num}%`, `h-${num}%`
		]),

		// Add Tailwind default border radius classes
		'rounded-none', 'rounded-sm', 'rounded', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-3xl', 'rounded-full',
		'rounded-t-none', 'rounded-t-sm', 'rounded-t', 'rounded-t-md', 'rounded-t-lg', 'rounded-t-xl', 'rounded-t-2xl', 'rounded-t-3xl', 'rounded-t-full',
		'rounded-r-none', 'rounded-r-sm', 'rounded-r', 'rounded-r-md', 'rounded-r-lg', 'rounded-r-xl', 'rounded-r-2xl', 'rounded-r-3xl', 'rounded-r-full',
		'rounded-b-none', 'rounded-b-sm', 'rounded-b', 'rounded-b-md', 'rounded-b-lg', 'rounded-b-xl', 'rounded-b-2xl', 'rounded-b-3xl', 'rounded-b-full',
		'rounded-l-none', 'rounded-l-sm', 'rounded-l', 'rounded-l-md', 'rounded-l-lg', 'rounded-l-xl', 'rounded-l-2xl', 'rounded-l-3xl', 'rounded-l-full',
		'rounded-tl-none', 'rounded-tl-sm', 'rounded-tl', 'rounded-tl-md', 'rounded-tl-lg', 'rounded-tl-xl', 'rounded-tl-2xl', 'rounded-tl-3xl', 'rounded-tl-full',
		'rounded-tr-none', 'rounded-tr-sm', 'rounded-tr', 'rounded-tr-md', 'rounded-tr-lg', 'rounded-tr-xl', 'rounded-tr-2xl', 'rounded-tr-3xl', 'rounded-tr-full',
		'rounded-bl-none', 'rounded-bl-sm', 'rounded-bl', 'rounded-bl-md', 'rounded-bl-lg', 'rounded-bl-xl', 'rounded-bl-2xl', 'rounded-bl-3xl', 'rounded-bl-full',
		'rounded-br-none', 'rounded-br-sm', 'rounded-br', 'rounded-br-md', 'rounded-br-lg', 'rounded-br-xl', 'rounded-br-2xl', 'rounded-br-3xl', 'rounded-br-full',

		// Include arbitrary value patterns for any we might have missed
		{ pattern: /p-\[.*\]/ },
		{ pattern: /pt-\[.*\]/ },
		{ pattern: /pr-\[.*\]/ },
		{ pattern: /pb-\[.*\]/ },
		{ pattern: /pl-\[.*\]/ },
		{ pattern: /px-\[.*\]/ },
		{ pattern: /py-\[.*\]/ },

		{ pattern: /m-\[.*\]/ },
		{ pattern: /mt-\[.*\]/ },
		{ pattern: /mr-\[.*\]/ },
		{ pattern: /mb-\[.*\]/ },
		{ pattern: /ml-\[.*\]/ },
		{ pattern: /mx-\[.*\]/ },
		{ pattern: /my-\[.*\]/ },

		{ pattern: /w-\[.*\]/ },
		{ pattern: /h-\[.*\]/ },

		{ pattern: /gap-\[.*\]/ },
		{ pattern: /space-y-\[.*\]/ },
		{ pattern: /space-x-\[.*\]/ },

		{ pattern: /top-\[.*\]/ },
		{ pattern: /right-\[.*\]/ },
		{ pattern: /bottom-\[.*\]/ },
		{ pattern: /left-\[.*\]/ },

		{ pattern: /text-\[.*\]/ },
		{ pattern: /bg-\[.*\]/ },
		{ pattern: /border-\[.*\]/ },
		{ pattern: /rounded-\[.*\]/ },
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Poppins', 'sans-serif'],
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
				// Generate 1-50rem values
				...Array.from({ length: 50 }, (_, i) => ({ [`${i+1}rem`]: `${i+1}rem` })).reduce((acc, val) => ({ ...acc, ...val }), {}),

				// Generate 1-1000px values
				...Array.from({ length: 1000 }, (_, i) => ({ [`${i+1}px`]: `${i+1}px` })).reduce((acc, val) => ({ ...acc, ...val }), {}),
			},
			boxShadow: {
				'outline-primary': '0 0 0 3px rgba(14, 165, 233, 0.45)',
			},
			// Add badge colors for the top bar
			backgroundColor: {
				'badge-info': 'var(--badge-info-bg, #3b82f6)',
				'badge-success': 'var(--badge-success-bg, #10b981)',
				'badge-warning': 'var(--badge-warning-bg, #f59e0b)',
				'badge-error': 'var(--badge-error-bg, #ef4444)',
				'badge-neutral': 'var(--badge-neutral-bg, #6b7280)',
			},
			textColor: {
				'badge-info': 'var(--badge-info-text, #ffffff)',
				'badge-success': 'var(--badge-success-text, #ffffff)',
				'badge-warning': 'var(--badge-warning-text, #ffffff)',
				'badge-error': 'var(--badge-error-text, #ffffff)',
				'badge-neutral': 'var(--badge-neutral-text, #ffffff)',
			},
		},
	},
	plugins: [
		require('@tailwindcss/forms'),
	],
}