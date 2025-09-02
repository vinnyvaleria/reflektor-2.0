// src/lib/services/progressService.js

import { get } from 'svelte/store';
import { browser } from '$app/environment';

import { storyProgress, saveGameToStorage, progressApis } from '$lib';

export const progressService = {
	async loadUserProgress(userId) {
		try {
			const result = await progressApis.getUserProgress(userId);

			if (result.success) {
				const progress = result.data.user.storyProgress || {};

				storyProgress.set({
					highestUnlocked: result.data.user.highestUnlocked,
					completedLevels: progress,
					totalStars: result.data.user.stats.totalStars,
					completionPercentage: result.data.user.stats.completionPercentage,
					averageTime: result.data.user.stats.averageTimePerLevel,
					lastPlayedLevel: Math.max(...Object.keys(progress).map((k) => parseInt(k)), 1)
				});
			}
		} catch (error) {
			console.error('Failed to load user progress:', error);
		}
	},

	async resetStoryProgress(userId) {
		try {
			const result = await progressApis.resetStoryProgress(userId);

			if (result.success) {
				storyProgress.set({
					highestUnlocked: 1,
					completedLevels: {},
					totalStars: 0,
					completionPercentage: 0,
					averageTime: 0,
					lastPlayedLevel: 1
				});
			}

			return result;
		} catch (error) {
			console.error('Reset progress failed:', error);
			throw error;
		}
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
			console.error('Failed to update guest progress:', error);
		}
	},

	async syncBrowserProgressToAccount(userId) {
		if (!browser) return;

		try {
			const $storyProgress = get(storyProgress);

			if (Object.keys($storyProgress.completedLevels).length > 0) {
				await progressApis.syncBrowserProgress(userId, $storyProgress.completedLevels);
				await this.loadUserProgress(userId);
			}
		} catch (error) {
			console.error('Failed to sync browser progress:', error);
		}
	}
};
