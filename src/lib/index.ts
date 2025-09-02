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

// API Services (usually not imported directly by components)
export { authApis } from './services/authApis.js';
export { freeplayApis } from './services/freeplayApis.js';
export { storyApis } from './services/storyApis.js';
export { gameApis } from './services/gameApis.js';
export { progressApis } from './services/progressApis.js';
export { leaderboardApis } from './services/leaderboardApis.js';
export { helperApis } from './services/helperApi.js';

// ===========================
// STORES - State management
// ===========================
export {
	gameState,
	userState,
	helpers,
	storyProgress,
	leaderboardState,
	timeDisplay,
	helpersAvailable,
	userGameStatus,
	storyStats,
	saveGameToStorage,
	loadGameFromStorage,
	clearGameStorage
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
	HELPER_TOOLS: {
		hammer: { obstacle: 'wall', icon: '🔨' },
		axe: { obstacle: 'tree', icon: '🪓' },
		sickle: { obstacle: 'grass', icon: '🗡️' }
	}
} as const;
