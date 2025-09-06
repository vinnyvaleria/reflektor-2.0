// src/lib/stores/gameStore.js
// https://svelte.dev/docs/svelte/svelte-store

import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';

// load user data from DB and sync to stores
export function syncUserDataFromDB(userData) {
	if (!userData) return;

	// update user state
	userState.update((state) => ({
		...state,
		user: {
			id: userData.id,
			username: userData.username,
			email: userData.email,
			displayName: userData.displayName,
			avatar: userData.avatar,
			// db fields that might be useful
			highestUnlocked: userData.highestUnlocked,
			bestFreeplayScore: userData.bestFreeplayScore,
			totalFreeplayWins: userData.totalFreeplayWins
		}
	}));

	// update story progress from DB
	if (userData.storyProgress) {
		storyProgress.update((state) => ({
			...state,
			completedLevels: userData.storyProgress,
			totalStars: Object.values(userData.storyProgress || {}).reduce(
				(sum, level) => sum + (level.stars || 0),
				0
			)
		}));
	}
}

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
	levelMetadata: null, // current level info for story mode
	completionStats: null, // stats when level/session completes
	pauseDuration: 0, // total pause time for accurate timing
	sessionStats: {
		startTime: null, // track session duration
		endTime: null,
		totalMoves: 0,
		puzzlesCompleted: 0,
		roundsUsed: 0,
		helpersUsed: {},
		score: 0 // real-time score for freeplay
	}
});

// user authentication state
export const userState = writable({
	isLoggedIn: false,
	user: null,
	token: null,
	loading: false
});

// helper tools state - tracks usage and availability
export const helpers = writable({
	hammer: { available: 1, used: 0, obstacle: 'wall' },
	axe: { available: 1, used: 0, obstacle: 'tree' },
	sickle: { available: 1, used: 0, obstacle: 'grass' }
});

// story mode progress state
export const storyProgress = writable({
	currentLevel: 1,
	completedLevels: {}, // { "1": { stars: 3, bestSteps: 8, bestTime: 25, completed: true } }
	totalStars: 0,
	completionPercentage: 0,
	averageTime: 0
});

// leaderboard state - only store top 10 for each mode
export const leaderboardState = writable({
	freeplay: {}, // { "1" : {displayName: Name, score: 500} }
	story: {}, // { "1" : {displayName: Name, averageTime: 25, levelsUnlocked: 5} }
	loading: false,
	lastUpdated: null
});

// to display existing message (error, warning, info)
export const errorState = writable({
	message: null,
	type: null, // 'error', 'warning', 'info'
	timestamp: null
});

// derive highest unlocked level
export const highestUnlockedLevel = derived(storyProgress, ($storyProgress) => {
	const completed = Object.keys($storyProgress.completedLevels || {})
		.map(Number)
		.filter((level) => $storyProgress.completedLevels[level].completed);

	return completed.length > 0 ? Math.max(...completed) + 1 : 1;
});

// derived store for timer display (converts seconds to mm:ss format)
export const timeDisplay = derived(gameState, ($gameState) => {
	// story mode - count up from start time
	if ($gameState.gameMode === 'STORY' && $gameState.sessionStats?.startTime) {
		const start = new Date($gameState.sessionStats.startTime).getTime();
		const end = $gameState.sessionStats.endTime
			? new Date($gameState.sessionStats.endTime).getTime()
			: Date.now();
		const elapsed = Math.floor((end - start - $gameState.pauseDuration) / 1000);
		const minutes = Math.floor(elapsed / 60);
		const seconds = elapsed % 60;
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}

	// freeplay mode - count down
	if ($gameState.gameMode === 'FREEPLAY' && $gameState.timeLeft !== null) {
		const minutes = Math.floor($gameState.timeLeft / 60);
		const seconds = $gameState.timeLeft % 60;
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}

	return '0:00';
});

// storing time in completedLevels when level completes:
export function completeStoryLevel(level, stars, steps) {
	const $gameState = get(gameState);
	const start = new Date($gameState.sessionStats.startTime).getTime();
	const end = $gameState.sessionStats.endTime
		? new Date($gameState.sessionStats.endTime).getTime()
		: Date.now();
	const elapsed = Math.floor((end - start - $gameState.pauseDuration) / 1000);

	storyProgress.update((state) => ({
		...state,
		completedLevels: {
			...state.completedLevels,
			[level]: {
				completed: true,
				stars,
				bestSteps: steps,
				bestTime: elapsed,
				completedAt: new Date().toISOString()
			}
		}
	}));
}

// helper availability check
export const helpersAvailable = derived(helpers, ($helpers) => {
	return Object.entries($helpers).reduce((available, [tool, data]) => {
		available[tool] = data.available > data.used;
		return available;
	}, {});
});

// user's current game status
export const userGameStatus = derived(
	[userState, gameState, storyProgress, highestUnlockedLevel],
	([$userState, $gameState, $storyProgress, $highestUnlockedLevel]) => {
		return {
			isGuest: !$userState.isLoggedIn,
			canAccessLevel: (level) => {
				if (!$userState.isLoggedIn) return level <= 3; // guests limited to first 3 levels
				return level <= $highestUnlockedLevel;
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

// sorted leaderboard for display from lowest rank to highest
export const sortedLeaderboard = derived(leaderboardState, ($leaderboardState) => {
	return {
		// freeplay: Sort by score (highest first)
		freeplay: Object.entries($leaderboardState.freeplay)
			.map(([key, data]) => ({ ...data }))
			.sort((a, b) => b.score - a.score) // Higher score = better rank
			.map((entry, index) => ({ rank: index + 1, ...entry })),

		// story: Sort by average time (lowest first)
		story: Object.entries($leaderboardState.story)
			.map(([key, data]) => ({ ...data }))
			.sort((a, b) => a.averageTime - b.averageTime) // Lower time = better rank
			.map((entry, index) => ({ rank: index + 1, ...entry }))
	};
});

// sync function to prepare data for User model
export function prepareUserDataForDB() {
	const $storyProgress = get(storyProgress);
	const $userState = get(userState);
	const $highestUnlocked = get(highestUnlockedLevel);

	const completed = Object.values($storyProgress.completedLevels || {}).filter((l) => l.completed);

	const totalTime = completed.reduce((sum, level) => sum + (level.bestTime || 0), 0);
	const avgTime = completed.length > 0 ? totalTime / completed.length : null;

	return {
		storyProgress: $storyProgress.completedLevels, // JSON field
		highestUnlocked: $highestUnlocked,
		totalStoryLevelsCompleted: completed.length,
		averageStoryCompletionTime: avgTime,
		totalStoryTime: totalTime
	};
}

// sync function to prepare data for GameSession model
export function prepareSessionDataForDB() {
	const $gameState = get(gameState);
	const $helpers = get(helpers);

	// convert helpers to match DB helperUsage format
	const helperUsage = Object.entries($gameState.sessionStats.helpersUsed || {}).map(
		([type, uses]) => ({
			type,
			count: uses,
			timestamp: new Date().toISOString()
		})
	);

	return {
		puzzlesCompleted: $gameState.sessionStats.puzzlesCompleted,
		totalSteps: $gameState.sessionStats.totalMoves,
		roundsUsed: $gameState.sessionStats.roundsUsed,
		score: $gameState.sessionStats.score,
		currentPuzzle: {
			mainMap: $gameState.mapData,
			mirroredMap: $gameState.mirroredMapData,
			metadata: $gameState.levelMetadata
		},
		currentPosition: $gameState.currentPosition,
		helperUsage: helperUsage
	};
}

// calculate and update completionPercentage whenever completedLevels changes
storyProgress.subscribe(($storyProgress) => {
	const completed = Object.values($storyProgress.completedLevels || {}).filter(
		(l) => l.completed
	).length;

	const percentage = Math.round((completed / 30) * 100);

	// only update if different to avoid infinite loop
	if ($storyProgress.completionPercentage !== percentage) {
		storyProgress.update((state) => ({
			...state,
			completionPercentage: percentage
		}));
	}
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
		// console.warn('Failed to save game to storage:', error);
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
		// console.warn('Failed to load game from storage:', error);
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
		// console.warn('Failed to clear game storage:', error);
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
