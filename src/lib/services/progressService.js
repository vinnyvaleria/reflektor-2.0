// src/lib/services/progressService.js
// Consolidated progress service with API calls

import { get } from 'svelte/store';
import { browser } from '$app/environment';

import {
	storyProgress,
	saveGameToStorage,
	withLoadingState,
	getAuthHeaders,
	apiGet,
	apiDelete,
	apiPut
} from '$lib';

const progressApi = {
	async getUserProgress(userId) {
		return await apiGet('/api/user/progress', { userId }, 'Failed to get user progress');
	},

	async resetStoryProgress(userId) {
		const body = { userId, confirmReset: true };
		return await apiDelete('/api/user/progress', body, 'Failed to reset progress');
	},

	async syncBrowserProgress(userId, browserProgress) {
		const body = { userId, browserProgress };
		return await apiPut('/api/user/progress', body, 'Failed to sync progress');
	}
};

export const progressService = {
	async loadUserProgress(userId) {
		return withLoadingState(
			storyProgress,
			async () => {
				const result = await progressApi.getUserProgress(userId);

				if (result.success) {
					const progress = result.data.user.storyProgress || {};

					const progressData = {
						highestUnlocked: result.data.user.highestUnlocked,
						completedLevels: progress,
						totalStars: result.data.user.stats.totalStars,
						completionPercentage: result.data.user.stats.completionPercentage,
						averageTime: result.data.user.stats.averageTimePerLevel,
						lastPlayedLevel: Math.max(...Object.keys(progress).map((k) => parseInt(k)), 1)
					};

					storyProgress.update((state) => ({
						...state,
						...progressData
					}));

					return progressData;
				}
			},
			{
				onError: (error) => {
					// console.error('Failed to load user progress:', error);
				}
			}
		);
	},

	async resetStoryProgress(userId) {
		return withLoadingState(
			storyProgress,
			async () => {
				const result = await progressApi.resetStoryProgress(userId);

				if (result.success) {
					const resetData = {
						highestUnlocked: 1,
						completedLevels: {},
						totalStars: 0,
						completionPercentage: 0,
						averageTime: 0,
						lastPlayedLevel: 1
					};

					storyProgress.update((state) => ({
						...state,
						...resetData
					}));

					return result;
				}
			},
			{
				onError: (error) => {
					// console.error('Reset progress failed:', error);
				}
			}
		);
	},

	updateGuestStoryProgress(completionStats) {
		if (!browser) return;

		try {
			const $storyProgress = get(storyProgress);
			const level = completionStats.level.toString();

			const updatedLevels = {
				...$storyProgress.completedLevels,
				[level]: {
					completed: true,
					stars: completionStats.stars,
					bestSteps: completionStats.steps,
					bestTime: completionStats.timeTaken,
					completedAt: new Date().toISOString()
				}
			};

			storyProgress.update((state) => ({
				...state,
				completedLevels: updatedLevels,
				highestUnlocked: Math.min(completionStats.level + 1, 30),
				lastPlayedLevel: completionStats.level
			}));

			saveGameToStorage();
		} catch (error) {
			// console.error('Failed to update guest progress:', error);
		}
	},

	async syncBrowserProgressToAccount(userId) {
		if (!browser) return;

		try {
			const $storyProgress = get(storyProgress);

			if (Object.keys($storyProgress.completedLevels).length > 0) {
				await progressApi.syncBrowserProgress(userId, $storyProgress.completedLevels);
				await this.loadUserProgress(userId);
			}
		} catch (error) {
			// console.error('Failed to sync browser progress:', error);
		}
	}
};
