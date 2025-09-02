// src/lib/services/progressApis.js

import { getAuthHeaders } from '$lib';

export const progressApis = {
	async getUserProgress(userId) {
		const response = await fetch(`/api/user/progress?userId=${userId}`, {
			headers: getAuthHeaders()
		});

		const data = await response.json();

		if (response.ok) {
			return { success: true, data };
		} else {
			throw new Error(data.error || 'Failed to get user progress');
		}
	},

	async resetStoryProgress(userId) {
		const response = await fetch('/api/user/progress', {
			method: 'DELETE',
			headers: getAuthHeaders(),
			body: JSON.stringify({ userId, confirmReset: true })
		});

		const data = await response.json();

		if (response.ok) {
			return { success: true, data };
		} else {
			throw new Error(data.error || 'Failed to reset progress');
		}
	},

	async syncBrowserProgress(userId, browserProgress) {
		const response = await fetch('/api/user/progress', {
			method: 'PUT',
			headers: getAuthHeaders(),
			body: JSON.stringify({ userId, browserProgress })
		});

		const data = await response.json();

		if (response.ok) {
			return { success: true, data };
		} else {
			throw new Error(data.error || 'Failed to sync progress');
		}
	}
};
