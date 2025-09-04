// src/lib/services/freeplayApis.js

import { get } from 'svelte/store';

import { userState, getAuthHeaders, addUserIdToBody, apiGet, apiPost } from '$lib';

export const freeplayApis = {
	async start(difficulty, playerName = null) {
		const $userState = get(userState);
		const body = addUserIdToBody({
			difficulty,
			playerName
		});

		return await apiPost('/api/freeplay/start', body, 'Failed to start freeplay');
	},

	async getActiveSession() {
		const $userState = get(userState);

		if (!$userState.user?.id) return { success: false, reason: 'No user logged in' };

		const userId = $userState.user.id;
		return await apiGet('/api/freeplay/start', { userId }, 'Get active session failed');
	}
};
