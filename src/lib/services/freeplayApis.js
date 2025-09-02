// src/lib/services/freeplayApis.js

import { get } from 'svelte/store';

import { userState, getAuthHeaders } from '$lib';

export const freeplayApis = {
	async start(difficulty, playerName = null) {
		const $userState = get(userState);

		const response = await fetch('/api/freeplay/start', {
			method: 'POST',
			headers: getAuthHeaders(),
			body: JSON.stringify({
				difficulty,
				playerName,
				userId: $userState.user?.id
			})
		});

		const data = await response.json();

		if (response.ok) {
			return { success: true, data };
		} else {
			throw new Error(data.error || 'Failed to start freeplay');
		}
	},

	async getActiveSession() {
		const $userState = get(userState);

		if (!$userState.user?.id) return { success: false, reason: 'No user logged in' };

		const response = await fetch(`/api/freeplay/start?userId=${$userState.user.id}`, {
			headers: getAuthHeaders()
		});

		const data = await response.json();
		return response.ok ? { success: true, data } : { success: false, reason: data.error };
	}
};
