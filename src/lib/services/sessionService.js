// src/lib/services/sessionService.js

import { get } from 'svelte/store';
import {
	gameState,
	userState,
	helpers,
	timerService,
	apiPost,
	apiGet,
	getCurrentUserId
} from '$lib';

// API endpoints
const sessionApi = {
	async startFreeplay(difficulty = 'EASY', playerName = null) {
		const userId = getCurrentUserId();
		const body = {
			difficulty,
			timeLimit: 180,
			playerName: playerName || null,
			userId: userId || null
		};

		return await apiPost('/api/freeplay/start', body, 'Start freeplay failed');
	},

	async startStory(level = 1, playerName = null, resumeSession = false) {
		const userId = getCurrentUserId();
		const body = {
			level,
			playerName: playerName || null,
			userId: userId || null,
			resumeSession
		};

		return await apiPost('/api/story/start', body, 'Start story failed');
	},

	async getActiveSession(gameMode = 'FREEPLAY') {
		const userId = getCurrentUserId();
		const endpoint = gameMode === 'FREEPLAY' ? '/api/freeplay/active' : '/api/story/active';
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

			if (!$userState.isLoggedIn && !playerName) {
				throw new Error('Player name is required for guest players');
			}

			console.log('[SessionService] Starting freeplay:', { difficulty, playerName });

			const result = await sessionApi.startFreeplay(difficulty, playerName);

			console.log('[SessionService] API Response received:', {
				success: result.success,
				hasGameSession: !!result.data?.gameSession,
				hasMapData: !!result.data?.mapData
			});

			if (!result.success) {
				throw new Error(result.error || 'Failed to start freeplay');
			}

			// The API returns the exact structure we need
			const { gameSession, mapData } = result.data;

			if (!gameSession || !mapData) {
				console.error('[SessionService] Missing data:', {
					gameSession: !!gameSession,
					mapData: !!mapData
				});
				throw new Error('Invalid response from server');
			}

			// Extract the arrays from mapData object
			if (!mapData.mainMap || !mapData.mirroredMap) {
				console.error('[SessionService] Missing map arrays:', {
					mainMap: !!mapData.mainMap,
					mirroredMap: !!mapData.mirroredMap
				});
				throw new Error('Invalid map data structure');
			}

			// Create the new state
			const newState = {
				currentSession: gameSession,
				mapData: mapData.mainMap, // Extract the array
				mirroredMapData: mapData.mirroredMap, // Extract the array
				currentPosition: gameSession.currentPosition || { row: 0, col: 0, mirroredCol: 0 },
				gameMode: 'FREEPLAY',
				status: gameSession.status || 'PLAYING',
				timeLeft: gameSession.timeLimit,
				selectedHelper: null,
				currentScore: gameSession.score || 0,
				levelMetadata: mapData.metadata || null,
				pauseDuration: 0,
				sessionStats: {
					startTime: new Date(),
					endTime: null,
					totalMoves: 0,
					puzzlesCompleted: 0,
					roundsUsed: 0,
					helpersUsed: {},
					score: 0
				},
				completionStats: null
			};

			console.log('[SessionService] Setting game state:', {
				mapDataLength: newState.mapData?.length,
				mirroredDataLength: newState.mirroredMapData?.length,
				position: newState.currentPosition,
				status: newState.status
			});

			// Set the state
			gameState.set(newState);

			// Verify it was set
			const verifyState = get(gameState);
			console.log('[SessionService] State verification:', {
				hasMapData: !!verifyState.mapData,
				hasMirroredData: !!verifyState.mirroredMapData,
				position: verifyState.currentPosition
			});

			// Reset helpers
			this.resetHelpers();

			// Start timer if time limit exists
			if (gameSession.timeLimit) {
				timerService.start(gameSession.timeLimit);
			}

			console.log('[SessionService] Freeplay started successfully');
			return result.data;
		} catch (error) {
			console.error('[SessionService] Start freeplay failed:', error);
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

			console.log('[SessionService] Starting story level:', { level, playerName });

			const result = await sessionApi.startStory(level, playerName, resumeSession);

			if (!result.success) {
				throw new Error(result.error || 'Failed to start story');
			}

			// The API returns the exact structure we need
			const { gameSession, mapData } = result.data;

			if (!gameSession || !mapData) {
				throw new Error('Invalid response from server');
			}

			// Extract the arrays from mapData object
			if (!mapData.mainMap || !mapData.mirroredMap) {
				throw new Error('Invalid map data structure');
			}

			// Create the new state
			const newState = {
				currentSession: gameSession,
				mapData: mapData.mainMap, // Extract the array
				mirroredMapData: mapData.mirroredMap, // Extract the array
				currentPosition: gameSession.currentPosition || { row: 0, col: 0, mirroredCol: 0 },
				gameMode: 'STORY',
				status: gameSession.status || 'PLAYING',
				timeLeft: null,
				selectedHelper: null,
				currentScore: 0,
				levelMetadata: mapData.metadata || null,
				pauseDuration: 0,
				sessionStats: {
					startTime: result.data.resumed ? new Date(gameSession.startTime) : new Date(),
					endTime: null,
					totalMoves: 0,
					puzzlesCompleted: 0,
					roundsUsed: 0,
					helpersUsed: {},
					score: 0
				},
				completionStats: null
			};

			console.log('[SessionService] Setting game state:', {
				mapDataLength: newState.mapData?.length,
				mirroredDataLength: newState.mirroredMapData?.length,
				position: newState.currentPosition,
				status: newState.status
			});

			// Set the state
			gameState.set(newState);

			// Reset helpers
			this.resetHelpers();

			console.log('[SessionService] Story started successfully');
			return result.data;
		} catch (error) {
			console.error('[SessionService] Start story failed:', error);
			throw error;
		}
	},

	async resumeSession(gameMode = 'FREEPLAY') {
		try {
			const result = await sessionApi.getActiveSession(gameMode);

			if (result.success && result.data.gameSession) {
				const session = result.data.gameSession;

				console.log('[SessionService] Resuming session:', session);

				// Extract maps from currentPuzzle
				const currentPuzzle = session.currentPuzzle || {};

				gameState.update((state) => ({
					...state,
					currentSession: session,
					mapData: currentPuzzle.mainMap || null,
					mirroredMapData: currentPuzzle.mirroredMap || null,
					currentPosition: session.currentPosition || { row: 0, col: 0, mirroredCol: 0 },
					gameMode: session.gameMode,
					status: session.status,
					timeLeft: result.data.timeRemaining || null,
					levelMetadata: currentPuzzle.metadata || null
				}));

				if (gameMode === 'FREEPLAY' && result.data.timeRemaining > 0) {
					timerService.start(result.data.timeRemaining);
				}

				return true;
			}

			return false;
		} catch (error) {
			console.error('[SessionService] Resume session failed:', error);
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
		console.log('[SessionService] Resetting helpers');
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
			console.error('[SessionService] Failed to get available levels:', error);
			return [1];
		}
	}
};
