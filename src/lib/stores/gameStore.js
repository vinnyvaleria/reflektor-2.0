// src/lib/stores/gameStore.js
// https://svelte.dev/docs/svelte/svelte-store

import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

// user authentication state
export const userState = writable({
	isLoggedIn: false,
	user: null,
	token: null,
	loading: false
});

// main game state - holds current session data
export const gameState = writable({
	currentSession: null, // current game session from database
	mapData: null, // current puzzle main grid
	mirroredMapData: null, // current puzzle mirrored grid
	currentPosition: { row: 0, col: 0, mirroredCol: 0 }, // player positions
	gameMode: null, // 'FREEPLAY' or 'STORY'
	status: 'PLAYING', // current game status
	timeLeft: null, // remaining time for freeplay (seconds)
	selectedHelper: null, // currently selected helper tool
	currentScore: 0, // real-time score for freeplay
	levelMetadata: null, // current level info for story mode
	gameStartTime: null, // track session duration
	completionStats: null // stats when level/session completes
});

// helper tools state - tracks usage and availability
export const helpers = writable({
	hammer: { available: 1, used: 0, obstacle: 'wall' },
	axe: { available: 1, used: 0, obstacle: 'tree' },
	sickle: { available: 1, used: 0, obstacle: 'grass' }
});

// story mode progress state
export const storyProgress = writable({
	highestUnlocked: 1, // highest available level
	completedLevels: {}, // { "1": { stars: 3, bestSteps: 8, bestTime: 25, completed: true } }
	totalStars: 0,
	completionPercentage: 0,
	averageTime: 0,
	lastPlayedLevel: 1
});

// leaderboard state
export const leaderboardState = writable({
	freeplay: [],
	story: [],
	userRank: null,
	loading: false,
	lastUpdated: null
});

// derived store for timer display (converts seconds to mm:ss format)
export const timeDisplay = derived(gameState, ($gameState) => {
	if (!$gameState.timeLeft) return null;
	const minutes = Math.floor($gameState.timeLeft / 60);
	const seconds = $gameState.timeLeft % 60;
	return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// helper availability check
export const helpersAvailable = derived(helpers, ($helpers) => {
	return Object.entries($helpers).reduce((available, [tool, data]) => {
		available[tool] = data.available > data.used;
		return available;
	}, {});
});

// user's current game status
export const userGameStatus = derived(
	[userState, gameState, storyProgress],
	([$userState, $gameState, $storyProgress]) => {
		return {
			isGuest: !$userState.isLoggedIn,
			canAccessLevel: (level) => {
				if (!$userState.isLoggedIn) return level <= 3; // guests limited to first 3 levels
				return level <= $storyProgress.highestUnlocked;
			},
			currentSession: $gameState.currentSession,
			hasActiveGame: $gameState.status === 'PLAYING'
		};
	}
);

// story progress summary
export const storyStats = derived(storyProgress, ($storyProgress) => {
	const completed = Object.values($storyProgress.completedLevels || {});
	const totalLevels = 30;

	return {
		levelsCompleted: completed.filter((level) => level.completed).length,
		totalStars: completed.reduce((sum, level) => sum + (level.stars || 0), 0),
		averageStars:
			completed.length > 0
				? (
						completed.reduce((sum, level) => sum + (level.stars || 0), 0) / completed.length
					).toFixed(1)
				: 0,
		completionPercentage: Math.round(
			(completed.filter((l) => l.completed).length / totalLevels) * 100
		),
		perfectLevels: completed.filter((level) => level.stars === 3).length
	};
});

// BROWSER STORAGE HELPERS - for players who don't have an account

// save game state to localStorage
export function saveGameToStorage() {
	if (!browser) return;

	try {
		const $gameState = get(gameState);
		const $storyProgress = get(storyProgress);
		const $helpers = get(helpers);

		localStorage.setItem(
			'reflektor_game_state',
			JSON.stringify({
				gameState: $gameState,
				storyProgress: $storyProgress,
				helpers: $helpers,
				savedAt: new Date().toISOString()
			})
		);
		return true;
	} catch (error) {
		console.warn('Failed to save game to storage:', error);
		return false;
	}
}

// load game state from localStorage
export function loadGameFromStorage() {
	if (!browser) return null;

	try {
		const saved = localStorage.getItem('reflektor_game_state');
		if (!saved) return null;

		const parsed = JSON.parse(saved);

		// check if saved data is not too old (24 hours)
		const savedAt = new Date(parsed.savedAt);
		const now = new Date();
		const hoursDiff = (now - savedAt) / (1000 * 60 * 60);

		if (hoursDiff > 24) {
			localStorage.removeItem('reflektor_game_state');
			return null;
		}

		return parsed;
	} catch (error) {
		console.warn('Failed to load game from storage:', error);
		localStorage.removeItem('reflektor_game_state');
		return null;
	}
}

// clear stored game data
export function clearGameStorage() {
	if (!browser) return;

	try {
		localStorage.removeItem('reflektor_game_state');
		localStorage.removeItem('reflektor_user_token');
	} catch (error) {
		console.warn('Failed to clear game storage:', error);
	}
}

// save game state whenever it changes (for guests)
gameState.subscribe(($gameState) => {
	// Only auto-save for active games
	if ($gameState.currentSession && $gameState.status === 'PLAYING') {
		saveGameToStorage();
	}
});

// initialize store from browser storage on startup
if (browser) {
	const savedData = loadGameFromStorage();
	if (savedData) {
		gameState.set(savedData.gameState);
		storyProgress.set(savedData.storyProgress);
		helpers.set(savedData.helpers);
	}
}
