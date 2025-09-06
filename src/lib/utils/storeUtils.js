// src/lib/utils/storeUtils.js
// shared utilities for consistent store management

import { get } from 'svelte/store';

export async function withLoadingState(store, asyncOperation, options = {}) {
	const {
		loadingKey = 'loading',
		preserveState = true,
		onSuccess = null,
		onError = null
	} = options;

	try {
		// set loading state
		store.update((state) => ({
			...(preserveState ? state : {}),
			[loadingKey]: true
		}));

		// execute async operation
		const result = await asyncOperation();

		// clear loading state
		store.update((state) => ({
			...state,
			[loadingKey]: false
		}));

		// call success callback if provided
		if (onSuccess) {
			onSuccess(result, store);
		}

		return result;
	} catch (error) {
		// clear loading state on error
		store.update((state) => ({
			...state,
			[loadingKey]: false
		}));

		// call error callback if provided
		if (onError) {
			onError(error, store);
		} else {
			// console.error('Async operation failed:', error);
		}

		throw error;
	}
}

export function updateNestedStore(store, path, value) {
	const keys = path.split('.');

	store.update((state) => {
		const newState = { ...state };
		let current = newState;

		// navigate to parent of target key
		for (let i = 0; i < keys.length - 1; i++) {
			const key = keys[i];
			if (current[key] === undefined) {
				current[key] = {};
			} else {
				current[key] = { ...current[key] };
			}
			current = current[key];
		}

		// set the final value
		current[keys[keys.length - 1]] = value;
		return newState;
	});
}

export function incrementStoreValue(store, path, amount = 1) {
	const keys = path.split('.');

	store.update((state) => {
		const newState = { ...state };
		let current = newState;

		// navigate to parent
		for (let i = 0; i < keys.length - 1; i++) {
			const key = keys[i];
			current[key] = { ...current[key] };
			current = current[key];
		}

		const finalKey = keys[keys.length - 1];
		current[finalKey] = (current[finalKey] || 0) + amount;

		return newState;
	});
}

export function resetStore(store, initialState) {
	store.set({ ...initialState });
}

export function mergeStoreState(store, partialState) {
	store.update((state) => ({
		...state,
		...partialState
	}));
}

export function getStoreValue(store) {
	return get(store);
}

export function updateStoreArray(store, arrayPath, operation, item, findFn = null) {
	const keys = arrayPath.split('.');

	store.update((state) => {
		const newState = { ...state };
		let current = newState;

		// navigate to parent of array
		for (let i = 0; i < keys.length - 1; i++) {
			const key = keys[i];
			current[key] = { ...current[key] };
			current = current[key];
		}

		const arrayKey = keys[keys.length - 1];
		const currentArray = current[arrayKey] || [];

		switch (operation) {
			case 'add':
				current[arrayKey] = [...currentArray, item];
				break;

			case 'remove':
				if (findFn) {
					current[arrayKey] = currentArray.filter((existingItem) => !findFn(existingItem));
				} else if (typeof item === 'number') {
					current[arrayKey] = currentArray.filter((_, index) => index !== item);
				}
				break;

			case 'update':
				if (findFn) {
					current[arrayKey] = currentArray.map((existingItem) =>
						findFn(existingItem) ? { ...existingItem, ...item } : existingItem
					);
				}
				break;
		}

		return newState;
	});
}
