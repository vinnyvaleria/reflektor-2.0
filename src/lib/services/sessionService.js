// src/lib/services/sessionService.js
// Consolidated session service for both freeplay and story modes

import { get } from 'svelte/store';
import {
	gameState,
	helpers,
	userState,
	timerService,
	apiPost,
	apiGet,
	getCurrentUserId
} from '$lib';

// API Functions
const sessionApi = {
	async startFreeplay(difficulty, playerName = null) {
		const userId = getCurrentUserId();
		const body = {
			difficulty,
			timeLimit: 180,
			playerName: playerName || 'Guest', // Default to 'Guest' if null
			userId
		};
		return await apiPost('/api/freeplay/start', body, 'Failed to start freeplay');
	},

	async startStory(level, playerName = null, resumeSession = false) {
		const userId = getCurrentUserId();
		const body = {
			level,
			playerName: playerName || 'Guest', // Default to 'Guest' if null
			userId,
			resumeSession
		};
		return await apiPost('/api/story/start', body, 'Failed to start story mode');
	},

	async getActiveSession(gameMode = 'FREEPLAY') {
		const userId = getCurrentUserId();
		if (!userId) return { success: false, reason: 'No user logged in' };

		const endpoint = gameMode === 'FREEPLAY' ? '/api/freeplay/start' : '/api/story/start';
		return await apiGet(endpoint, { userId }, 'Get active session failed');
	},

	async getStoryProgress() {
		const userId = getCurrentUserId();
		return await apiGet('/api/story/progress', { userId }, 'Failed to get story progress');
	}
};

// Service Functions
export const sessionService = {
	async startFreeplay(difficulty = 'EASY', playerName = null) {
		try {
			const $userState = get(userState);

			// Remove validation - allow null playerName for guests
			// Backend will handle 'Guest' as default

			const result = await sessionApi.startFreeplay(difficulty, playerName);

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

			// Remove validation - allow null playerName for guests
			// Backend will handle 'Guest' as default

			const result = await sessionApi.startStory(level, playerName, resumeSession);

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

	async resumeSession(gameMode = 'FREEPLAY') {
		try {
			const result = await sessionApi.getActiveSession(gameMode);

			if (result.success && result.data.gameSession) {
				const session = result.data.gameSession;

				gameState.update((state) => ({
					...state,
					currentSession: session,
					mapData: session.currentPuzzle?.mainMap,
					mirroredMapData: session.currentPuzzle?.mirroredMap,
					currentPosition: session.currentPosition,
					gameMode: session.gameMode,
					status: session.status,
					timeLeft: result.data.timeRemaining || null
				}));

				if (gameMode === 'FREEPLAY' && result.data.timeRemaining > 0) {
					timerService.start(result.data.timeRemaining);
				}

				return true;
			}

			return false;
		} catch (error) {
			console.error('Resume session failed:', error);
			return false;
		}
	},

	async abandonSession() {
		const $gameState = get(gameState);

		if ($gameState.currentSession) {
			timerService.stop();

			gameState.update((state) => ({
				...state,
				status: 'ABANDONED',
				currentSession: null
			}));
		}
	},

	resetHelpers() {
		helpers.set({
			hammer: { available: 1, used: 0, obstacle: 'wall' },
			axe: { available: 1, used: 0, obstacle: 'tree' },
			sickle: { available: 1, used: 0, obstacle: 'grass' }
		});
	},

	async getAvailableStoryLevels() {
		try {
			const result = await sessionApi.getStoryProgress();

			if (result.success) {
				if (result.data.guestMode) {
					return [1, 2, 3];
				}
				return result.data.availableLevels || [1];
			}

			return [1];
		} catch (error) {
			console.error('Failed to get available levels:', error);
			return [1];
		}
	}
};
