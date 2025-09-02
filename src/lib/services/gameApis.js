// src/lib/services/gameApis.js

import { getAuthHeaders, apiPost } from '$lib';

export const gameApis = {
	async move(gameSessionId, direction, helperTool = null) {
		const body = { gameSessionId, direction, helperTool };

		const response = apiPost('/api/game/move', body, 'Game movement fails');

		if (response.success) {
			return { success: true, data: response.data };
		} else {
			// return detailed error info for collision handling
			return {
				success: false,
				data: response.data,
				collision: response.data.collision,
				reason: response.data.error,
				suggestion: response.suggestion
			};
		}
	}
};
