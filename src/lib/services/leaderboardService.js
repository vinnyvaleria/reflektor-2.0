// src/lib/services/leaderboardService.js
// Consolidated leaderboard service with API calls

import { get } from 'svelte/store';
import { leaderboardState, userState, gameState, withLoadingState, apiPost, apiGet } from '$lib';

// API Functions
const leaderboardApi = {
	async getLeaderboard(type = 'freeplay', difficulty = null, limit = 50) {
		const params = { type, limit: limit.toString() };
		if (difficulty) params.difficulty = difficulty;

		return await apiGet('/api/leaderboard', params, 'Failed to get leaderboard');
	},

	async submitScore(gameSessionId) {
		const $userState = get(userState);
		const body = { 
			gameSessionId,
			userId: $userState.user?.id || null 
		};

		return await apiPost('/api/leaderboard', body, 'Failed to submit score');
	}
};

// Service Functions
export const leaderboardService = {
	async loadLeaderboard(type = 'freeplay', difficulty = null) {
		return withLoadingState(leaderboardState, async () => {
			const result = await leaderboardApi.getLeaderboard(type, difficulty);

			if (result.success) {
				leaderboardState.update((state) => ({
					...state,
					[type]: result.data.leaderboard,
					lastUpdated: new Date()
				}));

				const $userState = get(userState);
				if ($userState.user) {
					const userRank =
						result.data.leaderboard.findIndex(
							(entry) =>
								entry.playerName === ($userState.user.displayName || $userState.user.username)
						) + 1;
					leaderboardState.update((state) => ({
						...state,
						userRank: userRank || null
					}));
				}
			}

			return result.data;
		});
	},

	async submitScore(gameSessionId) {
		try {
			const result = await leaderboardApi.submitScore(gameSessionId);
			const $gameState = get(gameState);

			// Reload leaderboard after submission
			if ($gameState.gameMode === 'FREEPLAY') {
				await this.loadLeaderboard('freeplay', $gameState.currentSession?.difficulty);
			} else {
				await this.loadLeaderboard('story');
			}

			return result;
		} catch (error) {
			console.error('Failed to submit to leaderboard:', error);
			throw error;
		}
	},

	async getUserRank(type = 'freeplay', playerName) {
		const $leaderboardState = get(leaderboardState);
		const leaderboard = $leaderboardState[type] || [];
		
		const rank = leaderboard.findIndex(entry => entry.playerName === playerName) + 1;
		return rank || null;
	},

	clearLeaderboard() {
		leaderboardState.set({
			freeplay: {},
			story: {},
			loading: false,
			lastUpdated: null
		});
	}
};