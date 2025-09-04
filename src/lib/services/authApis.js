// src/lib/services/authApis.js

import { apiPost, apiGet, apiPut } from '$lib';

export const authApis = {
	async signup(username, password, email = null, displayName = null) {
		const body = { username, password, email, displayName };

		return await apiPost('/api/auth/signup', body, 'Signup failed');
	},

	async signin(username, password, rememberMe = false) {
		const body = { username, password, rememberMe };

		const response = await apiPost('/api/auth/signin', body);

		if (response.success) {
			// store token in localStorage
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
		const response = await apiGet(`/api/auth/signup`, { username }, 'Failed to find username');
		return response.data.available;
	}
};
