// src/lib/services/gameService.js

import { get } from 'svelte/store';
import { browser } from '$app/environment';

import {
	gameState,
	storyProgress,
	helpers,
	loadGameFromStorage,
	authService,
	sessionService,
	gameplayService,
	leaderboardService
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

	isLevelCompleted(level) {
		const $storyProgress = get(storyProgress);
		return $storyProgress.completedLevels[level.toString()]?.completed || false;
	},

	getLevelStats(level) {
		const $storyProgress = get(storyProgress);
		return $storyProgress.completedLevels[level.toString()] || null;
	},

	async initialize() {
		try {
			await authService.initializeAuth();

			const $userState = get(userState);
			if (!$userState.isLoggedIn) {
				const savedGame = loadGameFromStorage();
				if (savedGame) {
					gameState.set(savedGame.gameState);
					storyProgress.set(savedGame.storyProgress);
					helpers.set(savedGame.helpers);
				}
			}

			await leaderboardService.loadLeaderboard('freeplay');
		} catch (error) {
			console.error('Game service initialization failed:', error);
		}
	}
};
