// src/components/theme/ThemeTemplateRenderer.jsx
import React, { useEffect } from 'react';
import { useTheme } from '../../store/ThemeContext';
import PageRenderer from '../pageRenderer/PageRenderer';
import MenuRenderComponent from '../menu/MenuRenderComponent';

/**
 * Renders dynamic templates from theme
 * Converts template syntax into React components
 */
const ThemeTemplateRenderer = ({ templateName, data = {}, children }) => {
	const { theme, menus, loading } = useTheme();

	if (loading || !theme) {
		return <div className="p-4">Loading theme...</div>;
	}

	// Get the requested template
	const templateContent = theme.templates[templateName];
	if (!templateContent) {
		return <div className="p-4">Template "{templateName}" not found.</div>;
	}

	// Process template variables
	const processVariables = (content) => {
		let processed = content;

		// Replace site variables
		processed = processed.replace(/\{\{\s*site\.name\s*\}\}/g, theme.name || 'Website');
		processed = processed.replace(/\{\{\s*site\.description\s*\}\}/g, theme.description || '');

		// Replace page variables
		processed = processed.replace(/\{\{\s*page\.title\s*\}\}/g, data.title || '');
		processed = processed.replace(/\{\{\s*page\.description\s*\}\}/g, data.description || '');

		// Replace theme variables
		processed = processed.replace(/\{\{\s*theme\.slug\s*\}\}/g, theme.slug || '');

		return processed;
	};

	// Process @extends directive
	const processExtends = (content) => {
		const extendsMatch = content.match(/@extends\(['"](.+?)['"]\)/);
		if (extendsMatch && extendsMatch[1]) {
			const parentTemplate = theme.templates[extendsMatch[1]];
			if (parentTemplate) {
				// Extract sections from current template
				const sectionMatches = [...content.matchAll(/@section\(['"](.+?)['"]\)([\s\S]*?)@endsection/g)];
				const sections = {};

				sectionMatches.forEach(match => {
					sections[match[1]] = match[2];
				});

				// Replace yields in parent template
				let processedParent = parentTemplate;
				Object.keys(sections).forEach(sectionName => {
					const sectionContent = sections[sectionName];
					processedParent = processedParent.replace(
						new RegExp(`@yield\\(['"]${sectionName}['"]\\)`, 'g'),
						sectionContent
					);
				});

				return processedParent;
			}
		}

		return content;
	};

	// Process @include directive
	const processIncludes = (content) => {
		let processed = content;
		const includeMatches = [...content.matchAll(/@include\(['"](.+?)['"](?:,\s*(.+?))?\)/g)];

		includeMatches.forEach(match => {
			const includeName = match[1];
			const templateParts = includeName.split('.');
			let includeContent = '';

			// Handle partials like 'partials.header'
			if (templateParts.length > 1 && templateParts[0] === 'partials') {
				const partialName = templateParts[1];
				includeContent = theme.templates[partialName] || '';
			}

			processed = processed.replace(match[0], includeContent);
		});

		return processed;
	};

	// Process @foreach directive for menus
	const processMenus = (content) => {
		let processed = content;

		// Match foreach loops for menus
		const foreachMatches = [...content.matchAll(/@foreach\(\$menus\.(.+?) as \$item\)([\s\S]*?)@endforeach/g)];

		foreachMatches.forEach(match => {
			const menuName = match[1];
			const loopContent = match[2];
			let replacementContent = '';

			// Get menu items
			const menuItems = menus[menuName]?.items || [];

			// Process each item
			menuItems.forEach(item => {
				let itemContent = loopContent;
				itemContent = itemContent.replace(/\{\{\s*\$item\.title\s*\}\}/g, item.label);
				itemContent = itemContent.replace(/\{\{\s*\$item\.url\s*\}\}/g, item.url);
				replacementContent += itemContent;
			});

			processed = processed.replace(match[0], replacementContent);
		});

		return processed;
	};

	// Process all directives
	const renderTemplate = () => {
		let processed = templateContent;

		// Process in specific order
		processed = processExtends(processed);
		processed = processIncludes(processed);
		processed = processMenus(processed);
		processed = processVariables(processed);

		// Handle content insertion
		if (children) {
			processed = processed.replace(/\{!!\s*page\.content\s*!!\}/g, '<div id="page-content-placeholder"></div>');
		}

		return processed;
	};

	// Apply CSS variables for theme settings
	useEffect(() => {
		if (theme && theme.settings && theme.settings.colors) {
			const { colors } = theme.settings;
			document.documentElement.style.setProperty('--color-primary', colors.primary);
			document.documentElement.style.setProperty('--color-secondary', colors.secondary);
			document.documentElement.style.setProperty('--color-accent', colors.accent);
			document.documentElement.style.setProperty('--color-background', colors.background);
			document.documentElement.style.setProperty('--color-text', colors.text);
		}
	}, [theme]);

	// Create a container for the template HTML
	const containerRef = React.useRef(null);

	// Insert processed template HTML
	useEffect(() => {
		if (containerRef.current) {
			const processedTemplate = renderTemplate();
			containerRef.current.innerHTML = processedTemplate;

			// Insert children into content placeholder if it exists
			if (children) {
				const contentPlaceholder = containerRef.current.querySelector('#page-content-placeholder');
				if (contentPlaceholder && contentPlaceholder.parentNode) {
					// Create a wrapper element for React to render into
					const wrapper = document.createElement('div');
					contentPlaceholder.parentNode.replaceChild(wrapper, contentPlaceholder);

					// Use ReactDOM to render children
					// This would be handled by a portal in a real implementation
					// For now, we'll just replace the placeholder with a message
					wrapper.innerHTML = '<div class="py-4">Page content would be rendered here</div>';
				}
			}
		}
	}, [templateContent, theme, menus, data, children]);

	return (
		<>
			<div ref={containerRef} className="theme-template-container"></div>
			{children && <div className="hidden">{children}</div>}
		</>
	);
};

export default ThemeTemplateRenderer;
