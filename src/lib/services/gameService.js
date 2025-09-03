// src/lib/services/gameService.js

import { get } from 'svelte/store';
import { browser } from '$app/environment';

import {
	storyProgress,
	authService,
	sessionService,
	gameplayService,
	leaderboardService,
	userState
} from '$lib';

export const gameService = {
	// auth
	signup: authService.signup.bind(authService),
	signin: authService.signin.bind(authService),
	signout: authService.signout.bind(authService),

	// session
	startFreeplay: sessionService.startFreeplay.bind(sessionService),
	startStory: sessionService.startStory.bind(sessionService),

	// gameplay
	makeMove: gameplayService.makeMove.bind(gameplayService),
	setSelectedHelper: gameplayService.setSelectedHelper.bind(gameplayService),
	endGame: gameplayService.endGame.bind(gameplayService),

	// leaderboard
	loadLeaderboard: leaderboardService.loadLeaderboard.bind(leaderboardService),

	// utility
	getAvailableLevels() {
		const $userState = get(userState);
		const $storyProgress = get(storyProgress);

		if (!$userState.isLoggedIn) {
			return [1, 2, 3];
		}

		return Array.from({ length: $storyProgress.highestUnlocked }, (_, i) => i + 1);
	},

	async initialize() {
		try {
			await authService.initializeAuth();
			await leaderboardService.loadLeaderboard('freeplay');
		} catch (error) {
			console.error('Game service initialization failed:', error);
		}
	}
};
