// src/lib/services/leaderboard.js

import { get } from 'svelte/store';

import { userState, getAuthHeaders } from '$lib';

export const leaderboardApis = {
	async getLeaderboard(type = 'freeplay', difficulty = null, limit = 50) {
		const params = new URLSearchParams({ type, limit: limit.toString() });
		if (difficulty) params.append('difficulty', difficulty);

		const response = await fetch(`/api/leaderboard?${params}`);
		const data = await response.json();

		if (response.ok) {
			return { success: true, data };
		} else {
			throw new Error(data.error || 'Failed to get leaderboard');
		}
	},

	async submitScore(gameSessionId) {
		const $userState = get(userState);

		const response = await fetch('/api/leaderboard', {
			method: 'POST',
			headers: getAuthHeaders(),
			body: JSON.stringify({
				gameSessionId,
				userId: $userState.user?.id
			})
		});

		const data = await response.json();

		if (response.ok) {
			return { success: true, data };
		} else {
			throw new Error(data.error || 'Failed to submit score');
		}
	}
};
