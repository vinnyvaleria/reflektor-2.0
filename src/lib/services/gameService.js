// src/lib/services/gameService.js

import { get } from 'svelte/store';
import { storyProgress, userState } from '$lib';

export const gameService = {
	// auth
	signup: (...args) => import('$lib').then((m) => m.authService.signup(...args)),
	signin: (...args) => import('$lib').then((m) => m.authService.signin(...args)),
	signout: (...args) => import('$lib').then((m) => m.authService.signout(...args)),

	// session
	startFreeplay: (...args) => import('$lib').then((m) => m.sessionService.startFreeplay(...args)),
	startStory: (...args) => import('$lib').then((m) => m.sessionService.startStory(...args)),

	// gameplay
	makeMove: (...args) => import('$lib').then((m) => m.gameplayService.makeMove(...args)),
	setSelectedHelper: (...args) =>
		import('$lib').then((m) => m.gameplayService.setSelectedHelper(...args)),
	endGame: (...args) => import('$lib').then((m) => m.gameplayService.endGame(...args)),

	// leaderboard
	loadLeaderboard: (...args) =>
		import('$lib').then((m) => m.leaderboardService.loadLeaderboard(...args)),

	// utility
	getAvailableLevels() {
		const $userState = get(userState);
		const $storyProgress = get(storyProgress);

		if (!$userState.isLoggedIn) return [1, 2, 3];
		return Array.from({ length: $storyProgress.highestUnlocked }, (_, i) => i + 1);
	},

	async initialize() {
		try {
			const { authService, leaderboardService } = await import('$lib');
			await authService.initializeAuth();
			await leaderboardService.loadLeaderboard('freeplay');
		} catch (error) {
			// console.error('Game service initialization failed:', error);
		}
	}
};
