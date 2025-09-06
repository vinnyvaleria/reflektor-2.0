/** @type {import('tailwindcss').Config} */

import defaultTheme from 'tailwindcss/defaultTheme';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				// custom colors
				game: {
					primary: '#ff2d55',
					secondary: '#9c0a26',
					blue: '#00639a',
					green: '#5ce65c',
					dark: '#5e0a0a',
					light: '#f5f5dc'
				},
				'game-primary': '#ff2d55',
				'game-secondary': '#9c0a26',
				'game-blue': '#00639a',
				'game-green': '#5ce65c',
				'game-dark': '#5e0a0a',
				'game-light': '#f5f5dc'
			},

			// custom fonts
			fontFamily: {
				sans: [...defaultTheme.fontFamily.sans],
				// jersey: ['Jersey 10', ...defaultTheme.fontFamily.sans],
				pixelify: ['Pixelify Sans', ...defaultTheme.fontFamily.mono]
			},

			// custom animations
			animation: {
				'bounce-slow': 'bounce 2s infinite',
				'pulse-slow': 'pulse 3s infinite',
				'ping-once': 'ping 1s cubic-bezier(0, 0, 0.2, 1)'
			},

			// custom spacing for grid layouts
			spacing: {
				18: '4.5rem',
				88: '22rem',
				128: '32rem'
			},

			// custom border radius for game elements
			borderRadius: {
				xl: '1rem',
				'2xl': '1.5rem'
			},

			// box shadows for depth
			boxShadow: {
				game: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
				'game-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
			}
		}
	},
	plugins: []
};
