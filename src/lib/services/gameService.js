// src/lib/services/gameService.js

import { gameStateActions } from '$lib/stores/gameStore.js';
import { freeplayApis } from './freeplayApis.js';
import { storyApis } from './storyApis.js';
import { gameApis } from './gameApis.js';

export const gameService = {
	async startFreeplay(difficulty = 'EASY', playerName = null) {
		const { response, data } = await freeplayApis.start(difficulty, playerName);

		if (!response.ok) {
			throw new Error(`Failed to start freeplay: ${data.error || 'Unknown error'}`);
		}

		// update store state
		gameStateActions.setGameSession(data, data.mapData);
		gameStateActions.resetHelpers();

		return data;
	},

	async startStory(level = 1, playerName = null) {
		const { response, data } = await storyApis.start(level, playerName);

		if (!response.ok) {
			throw new Error(`Failed to start story: ${data.error || 'Unknown error'}`);
		}

		// update store state
		gameStateActions.setGameSession(data, data.mapData);
		gameStateActions.resetHelpers();

		return data;
	},

	async makeMove(direction, gameSessionId) {
		const { response, data } = await gameApis.move(gameSessionId, direction);

		if (response.ok) {
			// successful move
			const newPosition = data.newPosition || data.gameSession.currentPosition;
			gameStateActions.updatePosition(newPosition, data.gameSession);

			// handle freeplay puzzle completion
			if (data.nextPuzzle) {
				gameStateActions.setGameSession(data, data.mapData);
				gameStateActions.resetHelpers();
			}

			return { success: true, data };
		} else if (response.status === 400) {
			// game event (collision, boundary, etc.)
			if (data.gameSession) {
				gameStateActions.updatePosition(data.gameSession.currentPosition, data.gameSession);
			}
			return { success: false, reason: data.error, collision: data.collision };
		} else {
			// server error
			throw new Error(`Move failed: ${data.error || 'Server error'}`);
		}
	}
};
