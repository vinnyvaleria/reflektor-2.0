// src/lib/services/progressApis.js

import { getAuthHeaders, apiGet, apiDelete, apiPut } from '$lib';

export const progressApis = {
	async getUserProgress(userId) {
		return await apiGet('/api/user/progress', { userId }, 'Failed to get user progress');
	},

	async resetStoryProgress(userId) {
		const body = { userId, confirmReset: true };
		return await apiDelete('/api/user/progress', body, 'Failed to reset progress');
	},

	async syncBrowserProgress(userId, browserProgress) {
		const body = { userId, browserProgress };
		return await apiPut('/api/user/progress', body, 'Failed to sync progress');
	}
};
