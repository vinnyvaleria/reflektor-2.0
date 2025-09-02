// src/lib/utils/getAuthHeaders.js

import { get } from 'svelte/store';
import { userState } from '$lib';

// helper function to get auth headers
export function getAuthHeaders() {
	const $userState = get(userState);
	const headers = { 'Content-Type': 'application/json' };

	if ($userState.token) {
		headers['Authorization'] = `Bearer ${$userState.token}`;
	}

	return headers;
}
