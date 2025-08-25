// src/lib/services/gameService.js

import { gameState, helpers } from '$lib/stores/gameStore.js';
import { freeplayApis } from './freeplayApis.js';
import { storyApis } from './storyApis.js';
import { gameApis } from './gameApis.js';

export const gameService = {
	async startFreeplay(difficulty = 'EASY', playerName = null) {
		const { response, data } = await freeplayApis.start(difficulty, playerName);

		if (!response.ok) {
			throw new Error(`Failed to start freeplay: ${data.error || 'Unknown error'}`);
		}

		// update store state directly
		gameState.set({
			currentSession: data.gameSession,
			mapData: data.mapData.mainMap,
			mirroredMapData: data.mapData.mirroredMap,
			currentPosition: data.gameSession.currentPosition,
			gameMode: 'FREEPLAY',
			status: data.gameSession.status,
			timeLeft: data.gameSession.timeLimit,
			selectedHelper: null
		});

		// reset helpers
		helpers.set({
			hammer: { available: 1, used: 0, obstacle: 'wall' },
			axe: { available: 1, used: 0, obstacle: 'tree' },
			sickle: { available: 1, used: 0, obstacle: 'grass' }
		});

		return data;
	},

	async startStory(level = 1, playerName = null) {
		const { response, data } = await storyApis.start(level, playerName);

		if (!response.ok) {
			throw new Error(`Failed to start story: ${data.error || 'Unknown error'}`);
		}

		// update store state directly
		gameState.set({
			currentSession: data.gameSession,
			mapData: data.mapData.mainMap,
			mirroredMapData: data.mapData.mirroredMap,
			currentPosition: data.gameSession.currentPosition,
			gameMode: 'STORY',
			status: data.gameSession.status,
			timeLeft: null, // no timer for story mode
			selectedHelper: null
		});

		// reset helpers
		helpers.set({
			hammer: { available: 1, used: 0, obstacle: 'wall' },
			axe: { available: 1, used: 0, obstacle: 'tree' },
			sickle: { available: 1, used: 0, obstacle: 'grass' }
		});

		return data;
	},

	async makeMove(direction, gameSessionId) {
		const { response, data } = await gameApis.move(gameSessionId, direction);

		if (response.ok) {
			// successful move - update state
			gameState.update((state) => ({
				...state,
				currentSession: data.gameSession,
				currentPosition: data.gameSession.currentPosition || data.newPosition,
				status: data.gameSession.status
			}));

			// handle freeplay puzzle completion - new puzzle generated
			if (data.nextPuzzle) {
				gameState.update((state) => ({
					...state,
					mapData: data.mapData.mainMap,
					mirroredMapData: data.mapData.mirroredMap
				}));

				// reset helpers for new puzzle
				helpers.set({
					hammer: { available: 1, used: 0, obstacle: 'wall' },
					axe: { available: 1, used: 0, obstacle: 'tree' },
					sickle: { available: 1, used: 0, obstacle: 'grass' }
				});
			}

			return { success: true, data };
		} else if (response.status === 400) {
			// game event (collision, boundary, etc.)
			if (data.gameSession) {
				gameState.update((state) => ({
					...state,
					currentSession: data.gameSession
				}));
			}
			return { success: false, reason: data.error, collision: data.collision };
		} else {
			// server error
			throw new Error(`Move failed: ${data.error || 'Server error'}`);
		}
	},

	// helper method to update selected helper
	setSelectedHelper(helper) {
		gameState.update((state) => ({
			...state,
			selectedHelper: helper
		}));
	},

	// timer management for freeplay
	startTimer() {
		const timer = setInterval(() => {
			gameState.update((state) => {
				if (state.timeLeft <= 1) {
					clearInterval(timer);
					return { ...state, timeLeft: 0, status: 'TIME_UP' };
				}
				return { ...state, timeLeft: state.timeLeft - 1 };
			});
		}, 1000);

		return timer;
	}
};
