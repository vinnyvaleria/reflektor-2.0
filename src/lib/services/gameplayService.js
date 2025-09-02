// src/lib/services/gameplayService.js

import { get } from 'svelte/store';

import {
	gameState,
	helpers,
	userState,
	gameApis,
	progressService,
	leaderboardService,
	sessionService
} from '$lib';

export const gameplayService = {
	async makeMove(direction, helperTool = null) {
		try {
			const $gameState = get(gameState);

			if (!$gameState.currentSession) {
				throw new Error('No active game session');
			}

			const result = await gameApis.move($gameState.currentSession.id, direction, helperTool);

			if (result.success) {
				gameState.update((state) => ({
					...state,
					currentSession: result.data.gameSession,
					currentPosition: result.data.gameSession?.currentPosition || result.data.newPosition,
					status: result.data.gameSession?.status || state.status,
					currentScore: result.data.score || state.currentScore
				}));

				if (result.data.obstacleRemoved && helperTool) {
					helpers.update((h) => ({
						...h,
						[helperTool]: { ...h[helperTool], used: h[helperTool].used + 1 }
					}));
				}

				if (result.data.nextPuzzle) {
					gameState.update((state) => ({
						...state,
						mapData: result.data.mapData.mainMap,
						mirroredMapData: result.data.mapData.mirroredMap,
						levelMetadata: result.data.mapData.metadata
					}));
					sessionService.resetHelpers();
				}

				if (result.data.storyCompleted) {
					gameState.update((state) => ({
						...state,
						status: 'COMPLETED',
						completionStats: result.data.stats
					}));

					if (get(userState).isLoggedIn) {
						await progressService.loadUserProgress(get(userState).user.id);
					} else {
						progressService.updateGuestStoryProgress(result.data.stats);
					}

					await leaderboardService.submitScore($gameState.currentSession.id);
				}

				return { success: true, data: result.data };
			} else {
				if (result.data?.gameSession) {
					gameState.update((state) => ({
						...state,
						currentSession: result.data.gameSession
					}));
				}

				return {
					success: false,
					collision: result.collision,
					reason: result.reason,
					suggestion: result.suggestion
				};
			}
		} catch (error) {
			console.error('Move failed:', error);
			throw error;
		}
	},

	setSelectedHelper(helper) {
		const $helpers = get(helpers);

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

			gameState.update((state) => ({
				...state,
				status: reason,
				timeLeft: reason === 'TIME_UP' ? 0 : state.timeLeft
			}));

			if (reason === 'COMPLETED' && $gameState.currentSession.score > 0) {
				await leaderboardService.submitScore($gameState.currentSession.id);
			}

			const $userState = get(userState);
			if ($userState.isLoggedIn && $gameState.gameMode === 'FREEPLAY') {
				await progressService.loadUserProgress($userState.user.id);
			}
		} catch (error) {
			console.error('End game failed:', error);
		}
	}
};

// listen for timer events to avoid circular dependency
if (typeof window !== 'undefined') {
	window.addEventListener('game:timeUp', async (event) => {
		await gameplayService.endGame(event.detail.reason);
	});
}
