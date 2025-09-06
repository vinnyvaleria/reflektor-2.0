// src/lib/services/storageService.js

import { browser } from '$app/environment';

const STORAGE_KEYS = {
	GAME_STATE: 'reflektor_game_state',
	STORY_PROGRESS: 'reflektor_story_progress',
	USER_TOKEN: 'reflektor_user_token',
	SETTINGS: 'reflektor_settings'
};

export const storageService = {
	saveGameState(gameState, storyProgress, helpers) {
		if (!browser) return false;

		try {
			const gameData = {
				gameState,
				storyProgress,
				helpers,
				savedAt: new Date().toISOString(),
				version: '2.0' // for future migration compatibility - in case more versions done
			};

			localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(gameData));
			return true;
		} catch (error) {
			// console.warn('Failed to save game state:', error);
			return false;
		}
	},

	loadGameState() {
		if (!browser) return null;

		try {
			const saved = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
			if (!saved) return null;

			const parsed = JSON.parse(saved);

			// check if data is not too old (48 hours for guest sessions)
			const savedAt = new Date(parsed.savedAt);
			const now = new Date();
			const hoursDiff = (now - savedAt) / (1000 * 60 * 60);

			if (hoursDiff > 48) {
				this.clearGameState();
				return null;
			}

			// version check for future compatibility
			if (parsed.version !== '2.0') {
				// console.warn('Game data version mismatch, clearing storage');
				this.clearGameState();
				return null;
			}

			return parsed;
		} catch (error) {
			// console.warn('Failed to load game state:', error);
			this.clearGameState();
			return null;
		}
	},

	clearGameState() {
		if (!browser) return;

		try {
			localStorage.removeItem(STORAGE_KEYS.GAME_STATE);
		} catch (error) {
			// console.warn('Failed to clear game state:', error);
		}
	},

	saveStoryProgress(progressData) {
		if (!browser) return false;

		try {
			const storyData = {
				...progressData,
				savedAt: new Date().toISOString(),
				version: '2.0'
			};

			localStorage.setItem(STORAGE_KEYS.STORY_PROGRESS, JSON.stringify(storyData));
			return true;
		} catch (error) {
			// console.warn('Failed to save story progress:', error);
			return false;
		}
	},

	loadStoryProgress() {
		if (!browser) return null;

		try {
			const saved = localStorage.getItem(STORAGE_KEYS.STORY_PROGRESS);
			if (!saved) return null;

			const parsed = JSON.parse(saved);

			// version compatibility check
			if (parsed.version !== '2.0') {
				this.clearStoryProgress();
				return null;
			}

			return parsed;
		} catch (error) {
			// console.warn('Failed to load story progress:', error);
			this.clearStoryProgress();
			return null;
		}
	},

	clearStoryProgress() {
		if (!browser) return;

		try {
			localStorage.removeItem(STORAGE_KEYS.STORY_PROGRESS);
		} catch (error) {
			// console.warn('Failed to clear story progress:', error);
		}
	},

	saveUserToken(token) {
		if (!browser) return false;

		try {
			localStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
			return true;
		} catch (error) {
			// console.warn('Failed to save user token:', error);
			return false;
		}
	},

	getUserToken() {
		if (!browser) return null;

		try {
			return localStorage.getItem(STORAGE_KEYS.USER_TOKEN);
		} catch (error) {
			// console.warn('Failed to get user token:', error);
			return null;
		}
	},

	clearUserToken() {
		if (!browser) return;

		try {
			localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
		} catch (error) {
			// console.warn('Failed to clear user token:', error);
		}
	},

	saveSettings(settings) {
		if (!browser) return false;

		try {
			localStorage.setItem(
				STORAGE_KEYS.SETTINGS,
				JSON.stringify({
					...settings,
					savedAt: new Date().toISOString()
				})
			);
			return true;
		} catch (error) {
			// console.warn('Failed to save settings:', error);
			return false;
		}
	},

	loadSettings() {
		if (!browser) return null;

		try {
			const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
			return saved ? JSON.parse(saved) : null;
		} catch (error) {
			// console.warn('Failed to load settings:', error);
			return null;
		}
	},

	// clear all stored data (for reset/logout)
	clearAll() {
		if (!browser) return;

		Object.values(STORAGE_KEYS).forEach((key) => {
			try {
				localStorage.removeItem(key);
			} catch (error) {
				// console.warn(`Failed to clear ${key}:`, error);
			}
		});
	},

	// get storage usage info
	getStorageInfo() {
		if (!browser) return null;

		try {
			const keys = Object.values(STORAGE_KEYS);
			const info = {};

			keys.forEach((key) => {
				const data = localStorage.getItem(key);
				info[key] = {
					exists: !!data,
					size: data ? data.length : 0,
					sizeKB: data ? Math.round((data.length / 1024) * 100) / 100 : 0
				};
			});

			return info;
		} catch (error) {
			// console.warn('Failed to get storage info:', error);
			return null;
		}
	},

	// check if storage is available
	isStorageAvailable() {
		if (!browser) return false;

		try {
			const test = '__storage_test__';
			localStorage.setItem(test, test);
			localStorage.removeItem(test);
			return true;
		} catch (error) {
			return false;
		}
	}
};
