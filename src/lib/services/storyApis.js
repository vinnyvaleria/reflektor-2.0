// src/lib/services/storyApis.js

import { get } from 'svelte/store';

import {
	userState,
	getAuthHeaders,
	addUserIdToBody,
	apiPost,
	getCurrentUserId,
	apiGet
} from '$lib';

export const storyApis = {
	async start(level, playerName = null, resumeSession = false) {
		const body = addUserIdToBody({
			level,
			playerName,
			resumeSession
		});
		return await apiPost('/api/story/start', body, 'Failed to start story mode');
	},

	async getProgress() {
		const userId = getCurrentUserId();
		return await apiGet('/api/story/progress', { userId }, 'Failed to get story progress');
	}
};
