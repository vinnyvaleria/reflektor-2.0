// src/lib/utils/gameTimer.js
// countdown timer for freeplay mode

import { gameStateActions } from '$lib/stores/gameStore';

export class GameTimer {
	constructor() {
		this.timer = null;
	}

	start(initialTime) {
		this.stop(); // clear any existing timer

		gameStateActions.updateTimeLeft(initialTime);

		this.timer = setInterval(() => {
			gameStateActions.updateTimeLeft((timeLeft) => {
				if (timeLeft <= 1) {
					this.stop();
					return 0;
				}
				return timeLeft - 1;
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
