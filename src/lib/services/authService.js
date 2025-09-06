// src/lib/services/authService.js
// Consolidated authentication service with API calls

import { browser } from '$app/environment';
import { userState, clearGameStorage, withLoadingState, apiPost, apiGet, apiPut } from '$lib';

// API Functions
const authApi = {
	async signup(username, password, email = null, displayName = null) {
		const body = { username, password, email, displayName };
		return await apiPost('/api/auth/signup', body, 'Signup failed');
	},

	async signin(username, password, rememberMe = false) {
		const body = { username, password, rememberMe };

		const response = await apiPost('/api/auth/signin', body);

		if (response.success) {
			// Store token in localStorage
			if (typeof window !== 'undefined') {
				localStorage.setItem('reflektor_user_token', response.data.token);
			}
			return { success: true, user: response.data.user, token: response.data.token };
		} else {
			throw new Error(response.data.error || 'Sign in failed');
		}
	},

	async verifyToken(token) {
		return await apiPut('/api/auth/signin', { token });
	},

	async checkUsername(username) {
		const response = await apiGet(`/api/auth/signup`, { username }, 'Failed to check username');
		return response.data.available;
	}
};

// Service Functions
export const authService = {
	async signup(username, password, email = null, displayName = null) {
		return withLoadingState(userState, async () => {
			const result = await authApi.signup(username, password, email, displayName);
			// Auto sign in after signup
			await this.signin(username, password);
			return result;
		});
	},

	async signin(username, password, rememberMe = false) {
		return withLoadingState(userState, async () => {
			const result = await authApi.signin(username, password, rememberMe);

			// Update store
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

		if (browser) {
			localStorage.removeItem('reflektor_user_token');
		}
	},

	async initializeAuth() {
		if (!browser) return;

		const token = localStorage.getItem('reflektor_user_token');
		if (!token) return;

		return withLoadingState(
			userState,
			async () => {
				const result = await authApi.verifyToken(token);

				if (result.success) {
					userState.set({
						isLoggedIn: true,
						user: result.data.user,
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
					localStorage.removeItem('reflektor_user_token');
				}
			}
		);
	},

	async checkUsernameAvailability(username) {
		try {
			return await authApi.checkUsername(username);
		} catch (error) {
			console.error('Username check failed:', error);
			return false;
		}
	},

	isAuthenticated() {
		const $userState = get(userState);
		return $userState.isLoggedIn && $userState.user !== null;
	},

	getCurrentUser() {
		const $userState = get(userState);
		return $userState.user;
	}
};
