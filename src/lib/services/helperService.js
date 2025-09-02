// src/lib/services/helperService.js

import { get } from 'svelte/store';
import { helperState, gameState, helperApis } from '$lib';

// Helper tools configuration (matches your 3 obstacle types)
export const HELPER_CONFIG = {
	hammer: {
		name: 'Hammer',
		emoji: '🔨',
		description: 'Breaks walls',
		maxUses: 1,
		targetObstacles: ['wall'],
		color: 'bg-orange-500',
		keyboardShortcut: '1'
	},
	axe: {
		name: 'Axe',
		emoji: '🪓',
		description: 'Cuts down trees',
		maxUses: 1,
		targetObstacles: ['tree'],
		color: 'bg-amber-600',
		keyboardShortcut: '2'
	},
	sickle: {
		name: 'Sickle',
		emoji: '🗡️',
		description: 'Clears grass',
		maxUses: 1,
		targetObstacles: ['grass'],
		color: 'bg-green-500',
		keyboardShortcut: '3'
	}
};

export const helperService = {
	async useHelper(gameSessionId, helperType, targetRow, targetCol, gridType, obstacleCell) {
		try {
			// frontend validation first
			const validation = this.validateHelperTarget(helperType, obstacleCell);
			if (!validation.success) {
				throw new Error(validation.error);
			}

			// check if helper is available
			const $helperState = get(helperState);
			const helperUsage = $helperState.usage[helperType];
			if (helperUsage.used >= helperUsage.available) {
				throw new Error(`${HELPER_CONFIG[helperType].name} has already been used`);
			}

			// call the API through helperApis
			const result = await helperApis.useHelper(
				gameSessionId,
				helperType,
				targetRow,
				targetCol,
				gridType
			);

			if (result.success) {
				// update helper usage tracking
				helperState.update((state) => ({
					...state,
					usage: {
						...state.usage,
						[helperType]: {
							...state.usage[helperType],
							used: state.usage[helperType].used + 1
						}
					},
					selectedHelper: null // auto-deselect after use
				}));
			}

			return result.data;
		} catch (error) {
			console.error('Helper service error:', error);
			throw error;
		}
	},

	selectHelper(helperType) {
		// validate helper type if not null
		if (helperType && !HELPER_CONFIG[helperType]) {
			console.warn(`Invalid helper type: ${helperType}`);
			return;
		}

		helperState.update((state) => ({
			...state,
			selectedHelper: helperType
		}));
	},

	isHelperAvailable(helperType) {
		const $helperState = get(helperState);
		const helper = $helperState.usage[helperType];
		return helper && helper.used < helper.available;
	},

	resetHelpers(resetConfig = {}) {
		const defaultReset = {
			hammer: { used: 0, available: 1 },
			axe: { used: 0, available: 1 },
			sickle: { used: 0, available: 1 }
		};

		// merge with custom reset config if provided
		const resetState = { ...defaultReset, ...resetConfig };

		helperState.update((state) => ({
			...state,
			usage: resetState,
			selectedHelper: null
		}));
	},

	validateHelperTarget(helperType, obstacleCell) {
		const config = HELPER_CONFIG[helperType];
		if (!config) {
			return { success: false, error: `Invalid helper type: ${helperType}` };
		}

		// check if cell is an obstacle
		if (typeof obstacleCell === 'object' && obstacleCell.type === 1) {
			const obstacleType = obstacleCell.obstacle;

			// check if helper can target this obstacle type
			if (!config.targetObstacles.includes(obstacleType)) {
				return {
					success: false,
					error: `${config.name} cannot destroy ${obstacleType}. ${config.name} can only destroy ${config.targetObstacles[0]}.`
				};
			}

			return { success: true, obstacleType };
		} else if (obstacleCell === 1) {
			return {
				success: false,
				error: 'Cannot determine obstacle type. Please regenerate the map.'
			};
		} else {
			return { success: false, error: 'Target is not an obstacle.' };
		}
	},

	getHelperConfig(helperType) {
		return HELPER_CONFIG[helperType] || null;
	},

	getAvailableHelpers() {
		return Object.keys(HELPER_CONFIG);
	},

	handleHelperKeyboard(event) {
		const keyMap = {
			1: 'hammer',
			2: 'axe',
			3: 'sickle'
		};

		const helperType = keyMap[event.key];
		if (helperType) {
			event.preventDefault();
			this.selectHelper(helperType);

			// dispatch custom event for UI feedback
			document.dispatchEvent(
				new CustomEvent('helperSelected', {
					detail: { helperType }
				})
			);
		}
	},

	async loadHelperState(gameSessionId) {
		try {
			const result = await helperApis.getHelperUsage(gameSessionId);

			if (result.success) {
				const helperUsage = result.data.helperUsage || [];
				const usage = {
					hammer: { used: 0, available: 1 },
					axe: { used: 0, available: 1 },
					sickle: { used: 0, available: 1 }
				};

				// count usage from session data
				helperUsage.forEach((use) => {
					if (usage[use.type]) {
						usage[use.type].used += 1;
					}
				});

				helperState.update((state) => ({
					...state,
					usage,
					selectedHelper: null
				}));
			}
		} catch (error) {
			console.error('Failed to load helper state:', error);
			this.resetHelpers(); // fallback to reset
		}
	},

	async resetHelperUsageForSession(gameSessionId) {
		try {
			const result = await helperApis.resetHelperUsage(gameSessionId);

			if (result.success) {
				this.resetHelpers(); // update local state
			}

			return result;
		} catch (error) {
			console.error('Failed to reset helper usage:', error);
			throw error;
		}
	}
};
