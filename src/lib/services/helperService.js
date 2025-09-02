// src/lib/services/helperService.js

import { get } from 'svelte/store';

import { helpers, gameState, helperApis, incrementStoreValue } from '$lib';

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

			// check if helper is available using existing helpers store
			const $helpers = get(helpers);
			const helperData = $helpers[helperType];
			if (helperData.used >= helperData.available) {
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
				// update helper usage tracking using existing helpers store
				helpers.update((state) => ({
					...state,
					[helperType]: {
						...state[helperType],
						used: state[helperType].used + 1
					}
				}));

				// clear selected helper from gameState
				gameState.update((state) => ({
					...state,
					selectedHelper: null
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

		// update gameState with selected helper (using existing pattern)
		gameState.update((state) => ({
			...state,
			selectedHelper: helperType
		}));
	},

	isHelperAvailable(helperType) {
		const $helpers = get(helpers);
		const helper = $helpers[helperType];
		return helper && helper.used < helper.available;
	},

	resetHelpers(resetConfig = {}) {
		const defaultReset = {
			hammer: { available: 1, used: 0, obstacle: 'wall' },
			axe: { available: 1, used: 0, obstacle: 'tree' },
			sickle: { available: 1, used: 0, obstacle: 'grass' }
		};

		// merge with custom reset config if provided
		const resetState = { ...defaultReset, ...resetConfig };

		helpers.set(resetState);

		// clear selected helper from gameState
		gameState.update((state) => ({
			...state,
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

	loadHelperState(gameSessionId) {
		// load helper usage from game session and update existing helpers store
		return helperApis
			.getHelperUsage(gameSessionId)
			.then((result) => {
				if (result.success) {
					const helperUsage = result.data.helperUsage || [];

					// reset to defaults first
					const usage = {
						hammer: { available: 1, used: 0, obstacle: 'wall' },
						axe: { available: 1, used: 0, obstacle: 'tree' },
						sickle: { available: 1, used: 0, obstacle: 'grass' }
					};

					// count usage from session data
					helperUsage.forEach((use) => {
						if (usage[use.type]) {
							usage[use.type].used += 1;
						}
					});

					helpers.set(usage);
				}
			})
			.catch((error) => {
				console.error('Failed to load helper state:', error);
				this.resetHelpers(); // fallback to reset
			});
	},

	async resetHelperUsageForSession(gameSessionId) {
		try {
			const result = await helperApis.resetHelperUsage(gameSessionId);

			if (result.success) {
				this.resetHelpers(); // update local state using existing pattern
			}

			return result;
		} catch (error) {
			console.error('Failed to reset helper usage:', error);
			throw error;
		}
	}
};
