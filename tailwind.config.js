import { fontFamily } from 'tailwindcss/defaultTheme';

module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				'game-primary': '#ff2d55',
				'game-secondary': '#9c0a26',
				'game-blue': '#00639a',
				'game-green': '#5ce65c',
				'game-dark': '#5e0a0a',
				'game-light': '#f5f5dc'
			},
			fontFamily: {
				sans: [...fontFamily.sans],
				jersey: ['Jersey 10', 'sans-serif'],
				pixelify: ['Pixelify Sans', 'sans-serif']
			}
		}
	},
	plugins: []
};
