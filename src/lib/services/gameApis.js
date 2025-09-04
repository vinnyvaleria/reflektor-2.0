// src/lib/services/gameApis.js

import { getAuthHeaders, apiPost } from '$lib';

export const gameApis = {
	async move(gameSessionId, direction, helperTool = null) {
		const body = { gameSessionId, direction, helperTool };

		console.log('🎮 Making move:', { gameSessionId, direction, helperTool });

		try {
			const response = await apiPost('/api/game/move', body, 'Game movement fails');

			console.log('📡 API Response:', response);

			if (response.success) {
				console.log('✅ Move successful:', response.data);
				return { success: true, data: response.data };
			} else {
				console.log('❌ Move failed:', response);
				return {
					success: false,
					data: response.data,
					collision: response.data?.collision,
					reason: response.data?.error,
					suggestion: response.data?.suggestion
				};
			}
		} catch (error) {
			console.error('💥 API Error:', error);
			return {
				success: false,
				data: null,
				collision: false,
				reason: error.message || 'Move failed',
				suggestion: 'Try again'
			};
		}
	}
};
