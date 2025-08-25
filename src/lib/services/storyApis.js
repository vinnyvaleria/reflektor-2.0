// src/lib/services/storyApis.js

export const storyApis = {
	async start(level, playerName) {
		const response = await fetch('/api/story/start', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ level, playerName })
		});

		const data = await response.json();
		return { response, data };
	}
};
