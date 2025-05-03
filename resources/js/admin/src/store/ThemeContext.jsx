// src/contexts/ThemeContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { getActiveTheme } from '../api/themesApi';
import { getPublicMenu } from '../api/menusApi';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
	const [theme, setTheme] = useState(null);
	const [menus, setMenus] = useState({
		                                   main: { items: [] },
		                                   footer: { items: [] }
	                                   });
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchThemeData = async () => {
			setLoading(true);
			try {
				// Fetch active theme
				const themeResponse = await getActiveTheme();
				setTheme(themeResponse.data);

				// Apply theme CSS variables
				if (themeResponse.data && themeResponse.data.settings && themeResponse.data.settings.colors) {
					const colors = themeResponse.data.settings.colors;
					document.documentElement.style.setProperty('--color-primary', colors.primary);
					document.documentElement.style.setProperty('--color-secondary', colors.secondary);
					document.documentElement.style.setProperty('--color-accent', colors.accent);
					document.documentElement.style.setProperty('--color-background', colors.background);
					document.documentElement.style.setProperty('--color-text', colors.text);
				}

				// Fetch menus
				const mainMenuResponse = await getPublicMenu('main-menu');
				const footerMenuResponse = await getPublicMenu('footer-menu');

				setMenus({
					         main: mainMenuResponse.data,
					         footer: footerMenuResponse.data
				         });

				setError(null);
			} catch (err) {
				console.error('Error fetching theme data:', err);
				setError(err.response?.data?.error || 'Failed to load theme data');
			} finally {
				setLoading(false);
			}
		};

		fetchThemeData();
	}, []);

	const value = {
		theme,
		menus,
		loading,
		error,
		setTheme,
		setMenus
	};

	return (
		<ThemeContext.Provider value={value}>
			{children}
		</ThemeContext.Provider>
	);
};

export default ThemeContext;
