// src/lib/index.ts

// ===========================
// SERVICES
// ===========================
export { gameService } from './services/gameService.js';
export { authService } from './services/authService.js';
export { sessionService } from './services/sessionService.js';
export { gameplayService } from './services/gameplayService.js';
export { progressService } from './services/progressService.js';
export { leaderboardService } from './services/leaderboardService.js';
export { timerService } from './services/timerService.js';
export { storageService } from './services/storageService.js';
export { helperService, HELPER_CONFIG } from './services/helperService.js';

// ===========================
// STORES - State management
// ===========================
export {
	gameState,
	userState,
	helpers,
	obstacleVisibilityStore,
	storyProgress,
	leaderboardState,
	errorState,
	timeDisplay,
	helpersAvailable,
	userGameStatus,
	storyStats,
	sortedLeaderboard,
	highestUnlockedLevel,
	saveGameToStorage,
	loadGameFromStorage,
	clearGameStorage,
	syncUserDataFromDB,
	completeStoryLevel,
	prepareUserDataForDB,
	prepareSessionDataForDB
} from './stores/gameStore.js';

// ===========================
// COMPONENTS
// ===========================
export { default as GameGrid } from './components/game/GameGrid.svelte';
export { default as GameControls } from './components/game/GameControls.svelte';
export { default as GameInfo } from './components/game/GameInfo.svelte';
export { default as GameTimer } from './components/game/GameTimer.svelte';
export { default as HelperTools } from './components/game/HelperTools.svelte';

// ===========================
// UTILITIES
// ===========================
export { getAuthHeaders } from './utils/getAuthHeaders.js';
export {
	apiCall,
	apiPost,
	apiGet,
	apiPut,
	apiDelete,
	getCurrentUserId,
	getCurrentUser,
	addUserIdToBody
} from './utils/apiUtils.js';
export {
	withLoadingState,
	updateNestedStore,
	incrementStoreValue,
	resetStore,
	mergeStoreState,
	getStoreValue,
	updateStoreArray
} from './utils/storeUtils.js';

// ===========================
// CONSTANTS - Game configuration
// ===========================
export const GAME_CONFIG = {
	FREEPLAY_TIME_LIMIT: 180, // 3 minutes
	MAX_STORY_LEVELS: 30,
	GUEST_LEVEL_LIMIT: 3,
	DIFFICULTY_GRID_SIZES: {
		EASY: 5,
		MEDIUM: 7,
		HARD: 9
	},
	OBSTACLE_TYPES: {
		WALL: { icon: '🧱', tool: 'hammer' },
		TREE: { icon: '🌳', tool: 'axe' },
		GRASS: { icon: '🌿', tool: 'sickle' }
	},
	SCORING: {
		BASE_PUZZLE_POINTS: 100,
		DIFFICULTY_MULTIPLIERS: {
			EASY: 1,
			MEDIUM: 1.5,
			HARD: 2
		},
		COLLISION_PENALTY: 10,
		TIME_BONUS_PER_SECOND: 2
	},
	STAR_REQUIREMENTS: {
		THREE_STARS: 'beat_both', // Beat time AND steps
		TWO_STARS: 'beat_one', // Beat time OR steps
		ONE_STAR: 'complete' // Just complete
	}
} as const;

// ===========================
// TYPE DEFINITIONS
// ===========================
export type GameMode = 'FREEPLAY' | 'STORY';
export type GameStatus = 'PLAYING' | 'COMPLETED' | 'TIME_UP' | 'PAUSED' | 'ABANDONED';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type HelperType = 'hammer' | 'axe' | 'sickle';
export type ObstacleType = 'wall' | 'tree' | 'grass';
export type GridType = 'main' | 'mirrored';

export interface Position {
	row: number;
	col: number;
	mirroredCol?: number;
}

export interface MapData {
	mainMap: any[][];
	mirroredMap: any[][];
	metadata: {
		size: number;
		difficulty?: Difficulty;
		level?: number;
		name?: string;
		description?: string;
		targetSteps?: number;
		targetTime?: number;
	};
}

export interface GameSession {
	id: string;
	gameMode: GameMode;
	status: GameStatus;
	difficulty?: Difficulty;
	storyLevel?: number;
	puzzlesCompleted: number;
	totalSteps: number;
	roundsUsed: number;
	score?: number;
	currentPuzzle: any;
	currentPosition: Position;
	startTime: Date;
	endTime?: Date;
	timeLimit?: number;
	helperUsage?: any[];
}

export interface User {
	id: string;
	username: string;
	email?: string;
	displayName?: string;
	highestUnlocked: number;
	storyProgress: Record<string, any>;
	bestFreeplayScore: number;
	totalFreeplayWins: number;
}

export interface LeaderboardEntry {
	rank: number;
	playerName: string;
	score?: number;
	puzzlesCompleted?: number;
	levelsCompleted?: number;
	averageTime?: number;
	totalStars?: number;
	accuracy?: string;
	difficulty?: Difficulty;
	completedAt?: string;
	isRegistered?: boolean;
}
