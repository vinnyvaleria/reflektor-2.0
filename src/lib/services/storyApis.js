// src/lib/services/storyApis.js

import { get } from 'svelte/store';
import { userState } from '$lib/stores/gameStore.js';
import { getAuthHeaders } from '$lib/utils/getAuthHeaders.js';

export const storyApis = {
	async start(level, playerName = null, resumeSession = false) {
		const $userState = get(userState);

		const response = await fetch('/api/story/start', {
			method: 'POST',
			headers: getAuthHeaders(),
			body: JSON.stringify({
				level,
				playerName,
				userId: $userState.user?.id,
				resumeSession
			})
		});

		const data = await response.json();

		if (response.ok) {
			return { success: true, data };
		} else {
			throw new Error(data.error || 'Failed to start story mode');
		}
	},

	async getProgress() {
		const $userState = get(userState);

		const response = await fetch(`/api/story/start?userId=${$userState.user?.id || ''}`, {
			headers: getAuthHeaders()
		});

		const data = await response.json();
		return response.ok ? { success: true, data } : { success: false, reason: data.error };
	}
};
