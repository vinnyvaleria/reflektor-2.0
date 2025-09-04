// src/lib/services/helperApis.js

import { get } from 'svelte/store';

import { apiPost, apiGet, addUserIdToBody } from '$lib';

export const helperApis = {
	// use a helper tool to remove an obstacle
	async useHelper(gameSessionId, helperType, targetRow, targetCol, gridType) {
		const body = addUserIdToBody({
			gameSessionId,
			helperType,
			targetRow,
			targetCol,
			gridType
		});

		return await apiPost('/api/game/helper', body, 'Failed to use helper tool');
	},

	// get helper usage statistics for a game session
	async getHelperUsage(gameSessionId) {
		return await apiGet('/api/game/helper/usage', { gameSessionId }, 'Failed to get helper usage');
	},

	// reset helper usage for a game session (admin/debug function)
	async resetHelperUsage(gameSessionId) {
		const body = addUserIdToBody({ gameSessionId });
		return await apiPost('/api/game/helper/reset', body, 'Failed to reset helper usage');
	}
};
