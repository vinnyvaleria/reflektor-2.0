// src/lib/services/gameApis.js

import { getAuthHeaders } from '$lib';

export const gameApis = {
	async move(gameSessionId, direction, helperTool = null) {
		const response = await fetch('/api/game/move', {
			method: 'POST',
			headers: getAuthHeaders(),
			body: JSON.stringify({ gameSessionId, direction, helperTool })
		});

		const data = await response.json();

		if (response.ok) {
			return { success: true, data };
		} else {
			// return detailed error info for collision handling
			return {
				success: false,
				data,
				collision: data.collision,
				reason: data.error,
				suggestion: data.suggestion
			};
		}
	}
};
