// src/lib/services/gameplayService.js

import { get } from 'svelte/store';

import {
	gameState,
	helpers,
	userState,
	progressService,
	leaderboardService,
	sessionService,
	getAuthHeaders,
	apiPost
} from '$lib';

const gameplayApi = {
	async move(gameSessionId, direction, helperTool = null) {
		const body = { gameSessionId, direction, helperTool };

		console.log('Making move:', { gameSessionId, direction, helperTool });

		try {
			const response = await apiPost('/api/game/move', body, 'Game movement fails');

			console.log('API Response:', response);

			// FIX: The response has double-nested data structure
			// response.data.data contains the actual game data
			if (response.success && response.data) {
				// Extract the actual data from the double-nested structure
				const actualData = response.data.data || response.data;
				console.log('Move successful, actual data:', actualData);
				return { success: true, data: actualData };
			} else {
				console.log('Move failed:', response);
				return {
					success: false,
					data: response.data?.data || response.data,
					collision: response.collision || response.data?.collision,
					reason: response.error || response.data?.error,
					suggestion: response.suggestion || response.data?.suggestion
				};
			}
		} catch (error) {
			console.error('🔥 API Error:', error);
			return {
				success: false,
				data: null,
				collision: false,
				reason: error.message || 'Move failed',
				suggestion: 'Try again'
			};
		}
	}
};

export const gameplayService = {
	async makeMove(direction, helperTool = null) {
		try {
			const $gameState = get(gameState);

			if (!$gameState.currentSession) {
				throw new Error('No active game session');
			}

			// Check if game is already completed
			if ($gameState.status !== 'PLAYING') {
				console.log('Game is not active, cannot move. Current status:', $gameState.status);
				return { success: false, reason: 'Game is not active' };
			}

			console.log('Making move:', {
				sessionId: $gameState.currentSession.id,
				direction,
				currentPos: $gameState.currentPosition
			});

			const result = await gameplayApi.move($gameState.currentSession.id, direction, helperTool);

			if (result.success) {
				const data = result.data;

				// Now data should have the correct structure
				console.log('Move data received:', {
					hasGameSession: !!data.gameSession,
					hasNewPosition: !!data.newPosition,
					hasMapData: !!data.mapData,
					hasMirroredMapData: !!data.mirroredMapData
				});

				// Update the game state with the new data
				gameState.update((state) => ({
					...state,
					currentSession: data.gameSession || state.currentSession,
					currentPosition: data.newPosition || state.currentPosition,
					mapData: data.mapData || state.mapData,
					mirroredMapData: data.mirroredMapData || state.mirroredMapData,
					status: data.gameSession?.status || state.status,
					currentScore: data.gameSession?.score || state.currentScore,
					levelMetadata: data.gameSession?.currentPuzzle?.metadata || state.levelMetadata
				}));

				console.log('Position updated to:', data.newPosition);
				console.log('Goal reached:', data.goalReached);
				console.log('Current game status:', get(gameState).status);

				// Handle obstacle removal with helper
				if (data.obstacleRemoved && helperTool) {
					helpers.update((h) => ({
						...h,
						[helperTool]: {
							...h[helperTool],
							used: h[helperTool].used + 1
						}
					}));
				}

				// Handle next puzzle in freeplay
				if (data.nextPuzzle) {
					console.log(`Puzzle completed! Total: ${data.gameSession.puzzlesCompleted}`);

					// Reset helpers for new puzzle
					sessionService.resetHelpers();

					// Update game state with new puzzle data
					gameState.update((state) => ({
						...state,
						selectedHelper: null, // Clear selected helper
						status: 'PLAYING' // Ensure status is PLAYING for new puzzle
					}));
				}

				// Handle story mode completion
				if (data.storyCompleted) {
					console.log('Story level completed!', data.stats);

					gameState.update((state) => ({
						...state,
						status: 'COMPLETED',
						completionStats: data.stats
					}));

					// Update progress
					if (get(userState).isLoggedIn) {
						await progressService.loadUserProgress(get(userState).user.id);
					} else {
						progressService.updateGuestStoryProgress(data.stats);
					}

					// Submit to leaderboard if score exists
					if ($gameState.currentSession.id) {
						await leaderboardService.submitScore($gameState.currentSession.id);
					}
				}

				// Handle goal reached but not yet completed (waiting for backend confirmation)
				if (data.goalReached && !data.nextPuzzle && !data.storyCompleted) {
					console.log('Goal reached! Waiting for completion confirmation...');

					// Update status to prevent further moves
					gameState.update((state) => ({
						...state,
						status: data.gameSession?.status === 'COMPLETED' ? 'COMPLETED' : 'GOAL_REACHED'
					}));
				}

				return { success: true, data: data };
			} else {
				// Move failed (collision)
				console.log('Move failed:', result.reason);

				// Still update session info if provided
				if (result.data?.gameSession) {
					gameState.update((state) => ({
						...state,
						currentSession: result.data.gameSession,
						// Keep current position and maps on collision
						currentPosition: state.currentPosition,
						mapData: state.mapData,
						mirroredMapData: state.mirroredMapData,
						// Update status if backend says game ended
						status: result.data.gameSession?.status || state.status
					}));
				}

				return {
					success: false,
					collision: result.collision,
					reason: result.reason || result.error,
					suggestion: result.suggestion,
					data: result.data
				};
			}
		} catch (error) {
			console.error('Move failed:', error);
			throw error;
		}
	},

	setSelectedHelper(helper) {
		const $helpers = get(helpers);
		const $gameState = get(gameState);

		// Don't allow helper selection if game is not active
		if ($gameState.status !== 'PLAYING') {
			console.log('Cannot select helper - game is not active');
			return;
		}

		if (!helper) {
			// Clear selection
			gameState.update((state) => ({
				...state,
				selectedHelper: null
			}));
			return;
		}

		if ($helpers[helper] && $helpers[helper].available > $helpers[helper].used) {
			gameState.update((state) => ({
				...state,
				selectedHelper: state.selectedHelper === helper ? null : helper
			}));
		} else {
			throw new Error(`${helper} is not available`);
		}
	},

	async endGame(reason = 'COMPLETED') {
		try {
			const $gameState = get(gameState);

			if (!$gameState.currentSession) return;

			// Update local status
			gameState.update((state) => ({
				...state,
				status: reason,
				timeLeft: reason === 'TIME_UP' ? 0 : state.timeLeft
			}));

			// Update the backend session status
			try {
				const response = await apiPost('/api/game/end', {
					gameSessionId: $gameState.currentSession.id,
					reason: reason
				});

				console.log('[GameplayService] Session ended:', response);
			} catch (error) {
				console.error('[GameplayService] Failed to update backend session status:', error);
			}

			// Submit score if game completed with score
			if ($gameState.currentSession.score > 0) {
				await leaderboardService.submitScore($gameState.currentSession.id);
			}

			// Update progress for logged-in users
			const $userState = get(userState);
			if ($userState.isLoggedIn && $gameState.gameMode === 'FREEPLAY') {
				await progressService.loadUserProgress($userState.user.id);
			}
		} catch (error) {
			console.error('End game failed:', error);
		}
	},

	resetGame() {
		// Clear game state but keep user info
		gameState.update((state) => ({
			...state,
			currentSession: null,
			mapData: null,
			mirroredMapData: null,
			currentPosition: { row: 0, col: 0, mirroredCol: 0 },
			status: 'PLAYING',
			timeLeft: null,
			selectedHelper: null,
			currentScore: 0,
			levelMetadata: null,
			completionStats: null
		}));

		// Reset helpers
		sessionService.resetHelpers();
	},

	// Helper function to check if move is allowed
	canMakeMove() {
		const $gameState = get(gameState);
		return $gameState.status === 'PLAYING' && $gameState.currentSession;
	}
};

// Listen for timer events
if (typeof window !== 'undefined') {
	window.addEventListener('game:timeUp', async (event) => {
		await gameplayService.endGame(event.detail.reason);
	});
}
