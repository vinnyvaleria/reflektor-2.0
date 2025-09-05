// src/lib/utils/apiUtils.js
// refactored api calls

import { get } from 'svelte/store';

import { userState, getAuthHeaders } from '$lib';

export async function apiCall(url, options = {}, errorMessage = 'API call failed') {
	try {
		const response = await fetch(url, {
			headers: getAuthHeaders(),
			...options
		});

		const data = await response.json();

		if (response.ok) {
			return { success: true, data };
		} else {
			throw new Error(data.error || errorMessage);
		}
	} catch (error) {
		console.error(`API Error for ${url}:`, error);
		throw error;
	}
}

export async function apiPost(url, body, errorMessage = 'POST request failed') {
	return await apiCall(
		url,
		{
			method: 'POST',
			body: JSON.stringify(body)
		},
		errorMessage
	);
}

export async function apiGet(url, params = {}, errorMessage = 'GET request failed') {
	const queryString = new URLSearchParams(params).toString();
	const fullUrl = queryString ? `${url}?${queryString}` : url;

	return await apiCall(fullUrl, { method: 'GET' }, errorMessage);
}

export async function apiPut(url, body, errorMessage = 'PUT request failed') {
	return await apiCall(
		url,
		{
			method: 'PUT',
			body: JSON.stringify(body)
		},
		errorMessage
	);
}

export async function apiDelete(url, body = null, errorMessage = 'DELETE request failed') {
	const options = { method: 'DELETE' };
	if (body) {
		options.body = JSON.stringify(body);
	}

	return await apiCall(url, options, errorMessage);
}

export function getCurrentUserId() {
	const $userState = get(userState);
	return $userState.user?.id || null;
}

export function getCurrentUser() {
	return get(userState);
}

export function addUserIdToBody(body = {}) {
	const userId = getCurrentUserId();
	return userId ? { ...body, userId } : body;
}
