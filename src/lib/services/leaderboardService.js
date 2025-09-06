// src/lib/services/leaderboardService.js

import { get } from 'svelte/store';
import { leaderboardState, apiGet, apiPost } from '$lib';

const leaderboardApi = {
	async fetchLeaderboard(type = 'freeplay') {
		const endpoint = `/api/leaderboard?type=${type}`;
		return await apiGet(endpoint, {}, 'Failed to load leaderboard');
	},

	async submitScore(gameSessionId) {
		return await apiPost('/api/leaderboard', { gameSessionId }, 'Failed to submit score');
	}
};

export const leaderboardService = {
	async loadLeaderboard(type = 'freeplay') {
		try {
			// console.log('[LeaderboardService] Loading leaderboard:', type);

			const result = await leaderboardApi.fetchLeaderboard(type);

			// console.log('[LeaderboardService] API Response:', result);

			// The API returns data in the 'leaderboard' property
			const leaderboardData = result.leaderboard || [];

			// console.log('[LeaderboardService] Leaderboard entries:', {
				type: type,
				count: leaderboardData.length,
				data: leaderboardData
			});

			// Update the store based on type
			if (type === 'freeplay') {
				leaderboardState.update((state) => ({
					...state,
					freeplay: leaderboardData,
					lastUpdated: new Date().toISOString()
				}));
			} else if (type === 'story') {
				leaderboardState.update((state) => ({
					...state,
					story: leaderboardData,
					lastUpdated: new Date().toISOString()
				}));
			}

			// Verify the update
			const currentState = get(leaderboardState);
			// console.log('[LeaderboardService] Store updated:', {
				freeplayCount: currentState.freeplay.length,
				storyCount: currentState.story.length,
				lastUpdated: currentState.lastUpdated
			});

			return leaderboardData;
		} catch (error) {
			// console.error('[LeaderboardService] Load failed:', error);
			throw error;
		}
	},

	async submitScore(gameSessionId) {
		try {
			if (!gameSessionId) {
				// console.warn('[LeaderboardService] No session ID provided for score submission');
				return;
			}

			// console.log('[LeaderboardService] Submitting score for session:', gameSessionId);

			const result = await leaderboardApi.submitScore(gameSessionId);

			// console.log('[LeaderboardService] Submit response:', result);

			// Reload leaderboard after submission
			// Determine which type to reload based on current game mode
			const gameState = await import('$lib').then((m) => get(m.gameState));
			const leaderboardType = gameState.gameMode === 'STORY' ? 'story' : 'freeplay';

			await this.loadLeaderboard(leaderboardType);

			return result;
		} catch (error) {
			// console.error('[LeaderboardService] Submit failed:', error);
			// Don't throw - score submission failure shouldn't break the game
		}
	},

	clearLeaderboard() {
		leaderboardState.set({
			freeplay: [],
			story: [],
			lastUpdated: null
		});
	}
};
