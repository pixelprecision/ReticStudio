// resources/js/admin/src/hooks/useLocalStorage.js
import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue) => {
	// State to store our value
	const [storedValue, setStoredValue] = useState(() => {
		try {
			// Get from local storage by key
			const item = window.localStorage.getItem(key);
			// Parse stored json or if none return initialValue
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			console.error(`Error reading localStorage key "${key}":`, error);
			return initialValue;
		}
	});

	// Return a wrapped version of useState's setter function that
	// persists the new value to localStorage.
	const setValue = (value) => {
		try {
			// Allow value to be a function so we have same API as useState
			const valueToStore =
				value instanceof Function ? value(storedValue) : value;
			// Save state
			setStoredValue(valueToStore);
			// Save to local storage
			window.localStorage.setItem(key, JSON.stringify(valueToStore));
		} catch (error) {
			console.error(`Error setting localStorage key "${key}":`, error);
		}
	};

	// Listen for changes to this localStorage key from other tabs/windows
	useEffect(() => {
		const handleStorageChange = (e) => {
			if (e.key === key) {
				try {
					setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue);
				} catch (error) {
					console.error(`Error parsing localStorage key "${key}" in storage event:`, error);
				}
			}
		};

		// This fires when localStorage changes in other tabs/windows
		window.addEventListener('storage', handleStorageChange);

		return () => {
			window.removeEventListener('storage', handleStorageChange);
		};
	}, [key, initialValue]);

	return [storedValue, setValue];
};
