// src/lib/services/leaderboardService.js

import { get } from 'svelte/store';

import { leaderboardState, userState, gameState, leaderboardApis, withLoadingState } from '$lib';

export const leaderboardService = {
	async loadLeaderboard(type = 'freeplay', difficulty = null) {
		return withLoadingState(leaderboardState, async () => {
			const result = await leaderboardApis.getLeaderboard(type, difficulty);

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
			const result = await leaderboardApis.submitScore(gameSessionId);
			const $gameState = get(gameState);

			if ($gameState.gameMode === 'FREEPLAY') {
				await this.loadLeaderboard('freeplay', $gameState.currentSession?.difficulty);
			} else {
				await this.loadLeaderboard('story');
			}

			return result;
		} catch (error) {
			console.error('Failed to submit to leaderboard:', error);
		}
	}
};
