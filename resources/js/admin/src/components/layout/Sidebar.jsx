// resources/js/admin/src/components/layout/Sidebar.jsx
import React from 'react';
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
	FiAnchor
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
			<NavItem to="/admin/settings" icon={FiSettings}>Settings</NavItem>
		</nav>
	);
};

export default Sidebar;