// src/lib/services/timerService.js

import { get } from 'svelte/store';
import { gameState } from '$lib/stores/gameStore.js';

export const timerService = {
	timer: null,

	start(initialTime) {
		this.stop();

		this.timer = setInterval(() => {
			gameState.update((state) => {
				if (state.timeLeft <= 1) {
					this.stop();
					// replaced to avoid circular dependency
					// import('./gameplayService.js').then(({ gameplayService }) => {
					// 	gameplayService.endGame('TIME_UP');
					// });

					if (typeof window !== 'undefined') {
						window.dispatchEvent(
							new CustomEvent('game:timeUp', {
								detail: { reason: 'TIME_UP' }
							})
						);
					}

					return { ...state, timeLeft: 0, status: 'TIME_UP' };
				}
				return { ...state, timeLeft: state.timeLeft - 1 };
			});
		}, 1000);

		return this.timer;
	},

	stop() {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
	},

	pause() {
		this.stop();
	},

	resume() {
		const $gameState = get(gameState);
		if ($gameState.timeLeft > 0) {
			this.start($gameState.timeLeft);
		}
	}
};
