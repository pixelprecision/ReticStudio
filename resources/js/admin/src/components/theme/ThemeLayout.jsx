// src/components/theme/ThemeLayout.jsx
import React from 'react';
import MenuRenderComponent from '../menu/MenuRenderComponent';

/**
 * ThemeLayout component that applies theme settings and renders layout based on theme templates
 */
const ThemeLayout = ({ theme, menus, children, pageType = 'page' }) => {
	if (!theme || !menus) {
		return <div>{children}</div>;
	}

	// Apply theme settings
	const { settings } = theme;
	const containerWidth = settings?.layout?.container_width || '1200px';
	const sidebarPosition = settings?.layout?.sidebar || 'right';
	const headingFont = settings?.fonts?.heading || 'Inter';
	const bodyFont = settings?.fonts?.body || 'Inter';

	// Set dynamic styles
	const dynamicStyles = {
		container: {
			maxWidth: containerWidth,
			margin: '0 auto',
			width: '100%',
			padding: '0 1rem'
		},
		heading: {
			fontFamily: headingFont
		},
		body: {
			fontFamily: bodyFont
		}
	};

	// Determine layout based on sidebar position
	const mainContentClass = sidebarPosition === 'none'
	                         ? 'w-full'
	                         : 'w-full md:w-3/4';

	const sidebarClass = sidebarPosition === 'left'
	                     ? 'w-full md:w-1/4 md:pr-6 order-first'
	                     : 'w-full md:w-1/4 md:pl-6';

	return (
		<div className="theme-layout" style={dynamicStyles.body}>
			<header>
				<div style={dynamicStyles.container}>
					<div className="py-4 flex justify-between items-center">
						<div className="site-branding">
							<a href="/" className="text-xl font-bold" style={dynamicStyles.heading}>
								{theme.name || 'Website'}
							</a>
						</div>

						<MenuRenderComponent
							menu={menus.main}
							className="main-navigation"
							itemClassName="hover:text-primary"
							activeClassName="text-primary font-medium"
						/>
					</div>
				</div>
			</header>

			<main>
				<div style={dynamicStyles.container}>
					<div className="py-8 flex flex-wrap">
						{/* Main content */}
						<div className={mainContentClass}>
							{children}
						</div>

						{/* Sidebar */}
						{sidebarPosition !== 'none' && (
							<div className={sidebarClass}>
								<div className="bg-gray-50 p-4 rounded-lg">
									<h3 className="text-lg font-semibold mb-4" style={dynamicStyles.heading}>
										Sidebar Content
									</h3>
									<p>This is the sidebar content area.</p>
								</div>
							</div>
						)}
					</div>
				</div>
			</main>

			<footer className="bg-gray-100 py-8 mt-12">
				<div style={dynamicStyles.container}>
					<div className="grid md:grid-cols-2 gap-8">
						<div>
							<h3 className="text-lg font-semibold mb-4" style={dynamicStyles.heading}>
								{theme.name || 'Website'}
							</h3>
							<p className="text-gray-600">{theme.description || 'Website description'}</p>
						</div>

						<div>
							<h3 className="text-lg font-semibold mb-4" style={dynamicStyles.heading}>
								Navigation
							</h3>

							<MenuRenderComponent
								menu={menus.footer}
								horizontal={false}
								className="footer-navigation"
								itemClassName="text-gray-600 hover:text-gray-900 py-1"
							/>
						</div>
					</div>

					<div className="border-t border-gray-200 mt-8 pt-8 text-sm text-gray-500">
						&copy; {new Date().getFullYear()} {theme.name || 'Website'}. All rights reserved.
					</div>
				</div>
			</footer>
		</div>
	);
};

export default ThemeLayout;
