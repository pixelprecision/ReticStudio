// src/components/menu/MenuRenderComponent.jsx
import React from 'react';
import {Link} from 'react-router-dom';
import {getMenu} from '../../api/menusApi.js';

const MenuItem = ({ item, className = '' }) => {
	const hasChildren = item.items && item.items.length > 0;

	// Handle external links and targets
	if (item.target === '_blank' || item.url.startsWith('http')) {
		return (
			<a
				href={item.url}
				target={item.target || '_self'}
				rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
				className={className}
			>
				{item.label}
			</a>
		);
	}

	// For internal links
	return (
		<Link to={item.url} className={className}>
			{item.label}
		</Link>
	);
};

const DropdownMenu = ({ items, className = '' }) => {
	return (
		<ul className={`dropdown-menu ${className}`}>
			{items.map((item) => (
				<li key={item.id} className="relative group">
					<MenuItem item={item} className="block px-4 py-2 text-gray-700 hover:bg-gray-100"/>

					{item.items && item.items.length > 0 && (
						<DropdownMenu
							items={item.items}
							className="hidden group-hover:block absolute left-full top-0 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10"
						/>
					)}
				</li>
			))}
		</ul>
	);
};

const MenuRenderComponent = ({
	                             menu,
	                             menuId,
	                             horizontal = true,
	                             className = '',
	                             itemClassName = '',
	                             activeClassName = 'text-blue-600',
	                             dropdownClassName = '',
	                             mobileMenuBreakpoint = 'md',
	                             menuPosition = 'header',
	                             style
                             }) => {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
	const [menuData, setMenuData] = React.useState(null);

	// Handle menu ID - if menuId is provided but no menu object
	React.useEffect(() => {
		const fetchMenu = async () => {
			if (menuId && !menu) {
				try {
					// You would typically fetch the menu by ID here
					console.log('Menu ID provided:', menuId);
					// For now, use a placeholder menu
					const menu = await getMenu(menuId);
					setMenuData(menu);
				}
				catch (error) {
					console.error('Error fetching menu by ID:', error);
				}
			} else if (menu) {
				setMenuData(menu);
			}
		};

		fetchMenu();
	}, [menuId, menu]);

	// Apply the style prop to determine horizontal/vertical
	React.useEffect(() => {
		if (style && style === 'vertical') {
			horizontal = false;
		}
	}, [style]);

	// If no menu data is available yet
	if (!menuData || !menuData.items || !Array.isArray(menuData.items)) {
		console.log("MENU POSITION", menuPosition);
		console.log(menuPosition+'-MenuData', menuData);
		console.log(menuPosition+'-Menu', menu);
		return <div className="menu-loading">Loading menu...</div>;
	}

	return (
		<nav className={className}>
			{/* Mobile menu button */}
			<button
				className={`${mobileMenuBreakpoint}:hidden flex items-center px-3 py-2 border rounded text-gray-500 border-gray-500 hover:text-gray-700 hover:border-gray-700`}
				onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
			>
				<svg className="h-4 w-4 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
					<title>Menu</title>
					<path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"/>
				</svg>
			</button>

			{/* Desktop menu */}
			<ul className={`${mobileMenuBreakpoint}:flex ${horizontal ? 'flex-row' : 'flex-col'} hidden`}>
				{menuData.items.map((item) => (
					<li key={item.id} className="relative group">
						<MenuItem
							item={item}
							className={`block px-4 py-2 ${itemClassName} ${window.location.pathname === item.url ? activeClassName : ''}`}
						/>

						{item.items && item.items.length > 0 && (
							<DropdownMenu
								items={item.items}
								className={`hidden group-hover:block absolute z-10 w-48 bg-white border border-gray-200 rounded-md shadow-lg mt-1 ${dropdownClassName}`}
							/>
						)}
					</li>
				))}
			</ul>

			{/* Mobile menu */}
			<div className={`${isMobileMenuOpen ? 'block' : 'hidden'} ${mobileMenuBreakpoint}:hidden w-full`}>
				<ul className="flex flex-col w-full">
					{menuData.items.map((item) => {
						// First level items
						const hasSubItems = item.items && item.items.length > 0;
						return (
							<li key={item.id} className="w-full">
								<MenuItem
									item={item}
									className={`block px-4 py-2 ${itemClassName} ${window.location.pathname === item.url ? activeClassName : ''}`}
								/>

								{/* Simple sub-menu without recursive nesting for mobile */}
								{hasSubItems && (
									<ul className="pl-4 border-l border-gray-200">
										{item.items.map(subItem => (
											<li key={subItem.id}>
												<MenuItem
													item={subItem}
													className={`block px-4 py-2 ${itemClassName} ${window.location.pathname === subItem.url ? activeClassName : ''}`}
												/>
											</li>
										))}
									</ul>
								)}
							</li>
						);
					})}
				</ul>
			</div>
		</nav>
	);
};

export default MenuRenderComponent;