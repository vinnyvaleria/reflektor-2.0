// src/lib/services/freeplayApis.js

export const freeplayApis = {
	async start(difficulty, playerName) {
		const response = await fetch('/api/freeplay/start', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ difficulty, playerName })
		});

		const data = await response.json();
		return { response, data };
	}
};
