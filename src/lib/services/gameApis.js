// src/lib/services/gameApis.js

export const gameApis = {
	async move(gameSessionId, direction) {
		const response = await fetch('/api/game/move', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ gameSessionId, direction })
		});

		const data = await response.json();
		return { response, data };
	}
};
