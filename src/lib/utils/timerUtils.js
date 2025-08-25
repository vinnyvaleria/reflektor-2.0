// src/lib/utils/gameTimer.js
// countdown timer for freeplay mode

import { gameState, gameStateActions } from '$lib/stores/gameStore';

export class TimerUtils {
	constructor() {
		this.timer = null;
	}

	start(initialTime) {
		this.stop(); // clear any existing timer

		gameStateActions.updateTimeLeft(initialTime);

		this.timer = setInterval(() => {
			// get current state and update the timer
			gameState.update((state) => {
				const newTimeLeft = state.timeLeft <= 1 ? 0 : state.timeLeft - 1;

				if (newTimeLeft === 0) {
					this.stop();
					return { ...state, timeLeft: 0, status: 'TIME_UP' };
				}

				return { ...state, timeLeft: newTimeLeft };
			});
		}, 1000);

		return this.timer;
	}

	stop() {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
	}

	pause() {
		this.stop();
	}

	resume(currentTime) {
		this.start(currentTime);
	}
}
