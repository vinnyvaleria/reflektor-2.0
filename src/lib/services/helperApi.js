// src/lib/services/helperApis.js

import { get } from 'svelte/store';

import { userState, getAuthHeaders } from '$lib';

export const helperApis = {
	async useHelper(gameSessionId, helperType, targetRow, targetCol, gridType) {
		const $userState = get(userState);

		const response = await fetch('/api/game/helper', {
			method: 'POST',
			headers: getAuthHeaders(),
			body: JSON.stringify({
				gameSessionId,
				helperType,
				targetRow,
				targetCol,
				gridType,
				userId: $userState.user?.id
			})
		});

		const data = await response.json();

		if (response.ok) {
			return { success: true, data };
		} else {
			throw new Error(data.error || 'Failed to use helper tool');
		}
	},

	async getHelperUsage(gameSessionId) {
		const params = new URLSearchParams({ gameSessionId });

		const response = await fetch(`/api/game/helper/usage?${params}`, {
			headers: getAuthHeaders()
		});

		const data = await response.json();

		if (response.ok) {
			return { success: true, data };
		} else {
			throw new Error(data.error || 'Failed to get helper usage');
		}
	},

	async resetHelperUsage(gameSessionId) {
		const $userState = get(userState);

		const response = await fetch('/api/game/helper/reset', {
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
			throw new Error(data.error || 'Failed to reset helper usage');
		}
	}
};
