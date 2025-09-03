// src/lib/services/authService.js

import { browser } from '$app/environment';

import { userState, clearGameStorage, authApis, withLoadingState } from '$lib';

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

			// update store instead as subscriptions will handle the rest
			userState.set({
				isLoggedIn: true,
				user: result.user,
				token: result.token,
				loading: false
			});

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
					userState.set({
						isLoggedIn: true,
						user: result.user,
						token: token,
						loading: false
					});
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
