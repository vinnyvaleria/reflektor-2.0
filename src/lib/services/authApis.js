// src/lib/services/authApis.js

export const authApis = {
	async signup(username, password, email = null, displayName = null) {
		const response = await fetch('/api/auth/signup', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password, email, displayName })
		});

		const data = await response.json();

		if (response.ok) {
			return { success: true, user: data.user };
		} else {
			throw new Error(data.error || 'Signup failed');
		}
	},

	async signin(username, password, rememberMe = false) {
		const response = await fetch('/api/auth/signin', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password, rememberMe })
		});

		const data = await response.json();

		if (response.ok) {
			// store token in localStorage
			if (typeof window !== 'undefined') {
				localStorage.setItem('reflektor_user_token', data.token);
			}
			return { success: true, user: data.user, token: data.token };
		} else {
			throw new Error(data.error || 'Sign in failed');
		}
	},

	async verifyToken(token) {
		const response = await fetch('/api/auth/signin', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ token })
		});

		const data = await response.json();
		return response.ok ? { success: true, user: data.user } : { success: false };
	},

	async checkUsername(username) {
		const response = await fetch(`/api/auth/signup?username=${encodeURIComponent(username)}`);
		const data = await response.json();
		return data.available;
	}
};
