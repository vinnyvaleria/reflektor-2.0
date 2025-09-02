// src/lib/services/authService.js

import { browser } from '$app/environment';
import { userState, storyProgress, clearGameStorage, authApis, progressService } from '$lib';

export const authService = {
	async signup(username, password, email = null, displayName = null) {
		try {
			userState.update((state) => ({ ...state, loading: true }));

			const result = await authApis.signup(username, password, email, displayName);
			await this.signin(username, password);

			return result;
		} catch (error) {
			userState.update((state) => ({ ...state, loading: false }));
			throw error;
		}
	},

	async signin(username, password, rememberMe = false) {
		try {
			userState.update((state) => ({ ...state, loading: true }));

			const result = await authApis.signin(username, password, rememberMe);

			userState.set({
				isLoggedIn: true,
				user: result.user,
				token: result.token,
				loading: false
			});

			await progressService.loadUserProgress(result.user.id);
			await progressService.syncBrowserProgressToAccount(result.user.id);

			return result;
		} catch (error) {
			userState.update((state) => ({ ...state, loading: false }));
			throw error;
		}
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

		try {
			const token = localStorage.getItem('reflektor_user_token');
			if (!token) return;

			userState.update((state) => ({ ...state, loading: true }));
			const result = await authApis.verifyToken(token);

			if (result.success) {
				userState.set({
					isLoggedIn: true,
					user: result.user,
					token: token,
					loading: false
				});

				await progressService.loadUserProgress(result.user.id);
			} else {
				localStorage.removeItem('reflektor_user_token');
				userState.update((state) => ({ ...state, loading: false }));
			}
		} catch (error) {
			console.error('Auth initialization failed:', error);
			userState.update((state) => ({ ...state, loading: false }));
		}
	}
};
