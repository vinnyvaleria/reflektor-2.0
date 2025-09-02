// src/lib/services/sessionService.js

import { get } from 'svelte/store';

import { gameState, helpers, userState, freeplayApis, storyApis, timerService } from '$lib';

export const sessionService = {
	async startFreeplay(difficulty = 'EASY', playerName = null) {
		try {
			const $userState = get(userState);

			if (!$userState.isLoggedIn && !playerName) {
				throw new Error('Player name is required for guest players');
			}

			const result = await freeplayApis.start(difficulty, playerName);

			gameState.set({
				currentSession: result.data.gameSession,
				mapData: result.data.mapData.mainMap,
				mirroredMapData: result.data.mapData.mirroredMap,
				currentPosition: result.data.gameSession.currentPosition,
				gameMode: 'FREEPLAY',
				status: result.data.gameSession.status,
				timeLeft: result.data.gameSession.timeLimit,
				selectedHelper: null,
				currentScore: 0,
				levelMetadata: result.data.mapData.metadata,
				gameStartTime: new Date(),
				completionStats: null
			});

			this.resetHelpers();
			timerService.start(result.data.gameSession.timeLimit);

			return result.data;
		} catch (error) {
			console.error('Start freeplay failed:', error);
			throw error;
		}
	},

	async startStory(level = 1, playerName = null, resumeSession = false) {
		try {
			const $userState = get(userState);

			if (!$userState.isLoggedIn && level > 3) {
				throw new Error('Create an account to access levels beyond 3');
			}

			if (!$userState.isLoggedIn && !playerName) {
				throw new Error('Player name is required for guest players');
			}

			const result = await storyApis.start(level, playerName, resumeSession);

			gameState.set({
				currentSession: result.data.gameSession,
				mapData: result.data.mapData.mainMap,
				mirroredMapData: result.data.mapData.mirroredMap,
				currentPosition: result.data.gameSession.currentPosition,
				gameMode: 'STORY',
				status: result.data.gameSession.status,
				timeLeft: null,
				selectedHelper: null,
				currentScore: 0,
				levelMetadata: result.data.mapData.metadata,
				gameStartTime: result.data.resumed
					? new Date(result.data.gameSession.startTime)
					: new Date(),
				completionStats: null
			});

			this.resetHelpers();
			return result.data;
		} catch (error) {
			console.error('Start story failed:', error);
			throw error;
		}
	},

	resetHelpers() {
		helpers.set({
			hammer: { available: 1, used: 0, obstacle: 'wall' },
			axe: { available: 1, used: 0, obstacle: 'tree' },
			sickle: { available: 1, used: 0, obstacle: 'grass' }
		});
	}
};
