// resources/js/admin/src/components/layout/Sidebar.jsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

// Icons
import {
	FiHome,
	FiFileText,
	FiBox,
	FiLayout,
	FiImage,
	FiSettings,
	FiPenTool,
	FiMenu,
	FiPackage,
	FiNavigation,
	FiAnchor,
	FiShoppingCart,
	FiShoppingBag,
	FiTag,
	FiUsers,
	FiClipboard,
	FiChevronDown,
	FiChevronRight
} from 'react-icons/fi';

const NavItem = ({ to, icon: Icon, children }) => {
	return (
		<NavLink
			to={to}
			className={({ isActive }) =>
				`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
					isActive
					? 'bg-gray-100 text-blue-600'
					: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
				}`
			}
		>
			<Icon className="mr-3 h-5 w-5 flex-shrink-0" />
			{children}
		</NavLink>
	);
};

const NavItemGroup = ({ icon: Icon, title, children }) => {
	const [isOpen, setIsOpen] = useState(false);
	
	return (
		<div>
			<button
				className="w-full group flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
				onClick={() => setIsOpen(!isOpen)}
			>
				<div className="flex items-center">
					<Icon className="mr-3 h-5 w-5 flex-shrink-0" />
					{title}
				</div>
				{isOpen ? (
					<FiChevronDown className="h-4 w-4" />
				) : (
					<FiChevronRight className="h-4 w-4" />
				)}
			</button>
			
			{isOpen && (
				<div className="pl-10 space-y-1 mt-1">
					{children}
				</div>
			)}
		</div>
	);
};

const Sidebar = ({ mobile = false }) => {
	return (
		<nav className="px-2 space-y-1">
			<NavItem to="/admin/dashboard" icon={FiHome}>Dashboard</NavItem>
			<NavItem to="/admin/pages" icon={FiFileText}>Pages</NavItem>
			<NavItem to="/admin/components" icon={FiBox}>Components</NavItem>
			<NavItem to="/admin/forms" icon={FiLayout}>Forms</NavItem>
			<NavItem to="/admin/media" icon={FiImage}>Media</NavItem>
			<NavItem to="/admin/menus" icon={FiMenu}>Menus</NavItem>
			<NavItem to="/admin/themes" icon={FiPenTool}>Themes</NavItem>
			<NavItem to="/admin/header" icon={FiNavigation}>Header</NavItem>
			<NavItem to="/admin/footer" icon={FiAnchor}>Footer</NavItem>
			<NavItem to="/admin/plugins" icon={FiPackage}>Plugins</NavItem>
			
			{/* E-commerce section */}
			<NavItemGroup icon={FiShoppingCart} title="Store">
				<NavLink
					to="/admin/store/products"
					className={({ isActive }) =>
						`group flex items-center py-2 text-sm font-medium rounded-md ${
							isActive
							? 'text-blue-600'
							: 'text-gray-600 hover:text-gray-900'
						}`
					}
				>
					Products
				</NavLink>
				<NavLink
					to="/admin/store/categories"
					className={({ isActive }) =>
						`group flex items-center py-2 text-sm font-medium rounded-md ${
							isActive
							? 'text-blue-600'
							: 'text-gray-600 hover:text-gray-900'
						}`
					}
				>
					Categories
				</NavLink>
				<NavLink
					to="/admin/store/brands"
					className={({ isActive }) =>
						`group flex items-center py-2 text-sm font-medium rounded-md ${
							isActive
							? 'text-blue-600'
							: 'text-gray-600 hover:text-gray-900'
						}`
					}
				>
					Brands
				</NavLink>
				<NavLink
					to="/admin/store/orders"
					className={({ isActive }) =>
						`group flex items-center py-2 text-sm font-medium rounded-md ${
							isActive
							? 'text-blue-600'
							: 'text-gray-600 hover:text-gray-900'
						}`
					}
				>
					Orders
				</NavLink>
				<NavLink
					to="/admin/store/customers"
					className={({ isActive }) =>
						`group flex items-center py-2 text-sm font-medium rounded-md ${
							isActive
							? 'text-blue-600'
							: 'text-gray-600 hover:text-gray-900'
						}`
					}
				>
					Customers
				</NavLink>
				<NavLink
					to="/admin/store/settings"
					className={({ isActive }) =>
						`group flex items-center py-2 text-sm font-medium rounded-md ${
							isActive
							? 'text-blue-600'
							: 'text-gray-600 hover:text-gray-900'
						}`
					}
				>
					Store Settings
				</NavLink>
			</NavItemGroup>
			
			<NavItem to="/admin/settings" icon={FiSettings}>Settings</NavItem>
		</nav>
	);
};

export default Sidebar;