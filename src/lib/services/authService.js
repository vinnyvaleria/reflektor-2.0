// src/lib/services/authService.js

import { browser } from '$app/environment';
import {
	userState,
	storyProgress,
	clearGameStorage,
	authApis,
	progressService,
	withLoadingState
} from '$lib';

export const authService = {
	async signup(username, password, email = null, displayName = null) {
		return withLoadingState(userState, async () => {
			const result = await authApis.signup(username, password, email, displayName);
			await this.signin(username, password);
			return result;
		});
	},

	async signin(username, password, rememberMe = false) {
		return withLoadingState(userState, async () => {
			const result = await authApis.signin(username, password, rememberMe);

			// update user state on success
			userState.update((state) => ({
				...state,
				isLoggedIn: true,
				user: result.user,
				token: result.token
			}));

			await progressService.loadUserProgress(result.user.id);
			await progressService.syncBrowserProgressToAccount(result.user.id);

			return result;
		});
	},

	async signout() {
		userState.set({
			isLoggedIn: false,
			user: null,
			token: null,
			loading: false
		});

		storyProgress.set({
			highestUnlocked: 1,
			completedLevels: {},
			totalStars: 0,
			completionPercentage: 0,
			averageTime: 0,
			lastPlayedLevel: 1
		});

		clearGameStorage();
	},

	async initializeAuth() {
		if (!browser) return;

		const token = localStorage.getItem('reflektor_user_token');
		if (!token) return;

		return withLoadingState(
			userState,
			async () => {
				const result = await authApis.verifyToken(token);

				if (result.success) {
					userState.update((state) => ({
						...state,
						isLoggedIn: true,
						user: result.user,
						token: token
					}));

					await progressService.loadUserProgress(result.user.id);
				} else {
					localStorage.removeItem('reflektor_user_token');
				}

				return result;
			},
			{
				onError: (error) => {
					console.error('Auth initialization failed:', error);
				}
			}
		);
	}
};
