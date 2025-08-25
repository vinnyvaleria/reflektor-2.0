// src/lib/stores/gameStore.js
// https://svelte.dev/docs/svelte/svelte-store

import { writable, derived } from 'svelte/store';

// main game state - holds current session data
export const gameState = writable({
	currentSession: null, // current game session from database
	mapData: null, // current puzzle main grid
	mirroredMapData: null, // current puzzle mirrored grid
	currentPosition: { row: 0, col: 0, mirroredCol: 0 }, // player positions
	gameMode: null, // 'FREEPLAY' or 'STORY'
	status: 'PLAYING', // current game status
	timeLeft: null, // remaining time for freeplay (seconds)
	selectedHelper: null // currently selected helper tool
});

// helper tools state - tracks usage and availability
export const helpers = writable({
	hammer: { available: 1, used: 0, obstacle: 'wall' },
	axe: { available: 1, used: 0, obstacle: 'tree' },
	sickle: { available: 1, used: 0, obstacle: 'grass' }
});

// derived store for timer display (converts seconds to mm:ss format)
export const timeDisplay = derived(gameState, ($gameState) => {
	if (!$gameState.timeLeft) return null;
	const minutes = Math.floor($gameState.timeLeft / 60);
	const seconds = $gameState.timeLeft % 60;
	return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// game actions - functions to interact with the game
export const gameStateActions = {
	setGameSession(sessionData, mapData) {
		gameState.set({
			currentSession: sessionData.gameSession,
			mapData: mapData.mainMap,
			mirroredMapData: mapData.mirroredMap,
			currentPosition: sessionData.gameSession.currentPosition,
			gameMode: sessionData.gameSession.gameMode,
			status: sessionData.gameSession.status,
			timeLeft: sessionData.gameSession.timeLimit || null,
			selectedHelper: null
		});
	},

	updatePosition(newPosition, sessionData) {
		gameState.update((state) => ({
			...state,
			currentSession: sessionData,
			currentPosition: newPosition,
			status: sessionData.status
		}));
	},

	updateTimeLeft(timeLeft) {
		gameState.update((state) => ({ ...state, timeLeft }));
	},

	resetHelpers() {
		helpers.set({
			hammer: { available: 1, used: 0, obstacle: 'wall' },
			axe: { available: 1, used: 0, obstacle: 'tree' },
			sickle: { available: 1, used: 0, obstacle: 'grass' }
		});
	}
};
