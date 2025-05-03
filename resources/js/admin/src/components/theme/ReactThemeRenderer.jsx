// src/components/theme/ReactThemeRenderer.jsx
import React from 'react';
import { useTheme } from '../../store/ThemeContext';
import LayoutSelector from './LayoutSelector';
import LoadingScreen from './LoadingScreen';
import ErrorScreen from './ErrorScreen';

/**
 * Main React theme renderer component
 * Uses the LayoutSelector to choose the appropriate layout based on page preference, 
 * theme settings or page type
 */
const ReactThemeRenderer = ({ children, pageType = 'page', pageTitle, pageDescription, page = null }) => {
	const { theme, loading, error } = useTheme();

	if (loading) {
		return <LoadingScreen />;
	}

	if (error) {
		return <ErrorScreen message={error} />;
	}

	if (!theme) {
		return <ErrorScreen message="Theme not found. Please check theme configuration or contact administrator." />;
	}

	// Extract page metadata from the page if not provided directly
	const derivedPageTitle = pageTitle || (pageType === 'page' ? theme.name : undefined);
	const derivedPageDescription = pageDescription || (pageType === 'page' ? theme.description : undefined);

	// Determine layout based on page preference, page type and theme settings
	let layoutName;
	
	// Check if the page has a specific layout preference
	if (page && page.layout) {
		// If the page has a layout preference, use it
		layoutName = page.layout;
		console.log('Using page specific layout:', layoutName);
	} else if (theme.layouts && theme.layouts[pageType]) {
		// Use page type specific layout from theme if available
		layoutName = theme.layouts[pageType];
		console.log('Using theme layout for page type:', layoutName);
	} else if (theme.default_layout) {
		// Fall back to theme's default layout
		layoutName = theme.default_layout;
		console.log('Using theme default layout:', layoutName);
	} else if (pageType === 'home') {
		// Default layout for home page type is full-width
		layoutName = 'full-width';
		console.log('Using hardcoded layout for home page:', layoutName);
	} else if (pageType === 'post') {
		// Default layout for post page type is sidebar
		layoutName = 'sidebar';
		console.log('Using hardcoded layout for post page:', layoutName);
	} else {
		// Otherwise use default layout
		layoutName = 'default';
		console.log('Using fallback default layout:', layoutName);
	}

	return (
		<LayoutSelector
			layoutName={layoutName}
			pageTitle={derivedPageTitle}
			pageDescription={derivedPageDescription}
			pageProps={{ pageType }}
		>
			{children}
		</LayoutSelector>
	);
};

export default ReactThemeRenderer;
