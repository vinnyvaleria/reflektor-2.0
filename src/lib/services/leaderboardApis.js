// src/lib/services/leaderboard.js

import { get } from 'svelte/store';

import { userState, getAuthHeaders, addUserIdToBody, apiPost, apiGet } from '$lib';

export const leaderboardApis = {
	async getLeaderboard(type = 'freeplay', difficulty = null, limit = 50) {
		const params = { type, limit: limit.toString() };
		if (difficulty) params.difficulty = difficulty;

		return await apiGet('/api/leaderboard', params, 'Failed to get leaderboard');
	},

	async submitScore(gameSessionId) {
		const $userState = get(userState);
		const body = addUserIdToBody({ gameSessionId });

		return await apiPost('/api/leaderboard', body, 'Failed to submit score');
	}
};
