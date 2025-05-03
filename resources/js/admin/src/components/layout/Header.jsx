// resources/js/admin/src/components/layout/Header.jsx
import React from 'react';
import { useAuth } from '../../store/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const Header = ({ onMenuButtonClick }) => {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const handleLogout = async () => {
		await logout();
		navigate('/admin/login');
	};

	return (
		<header className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
			<div className="flex-1 px-4 flex justify-between">
				<div className="flex-1 flex items-center">
					<button
						type="button"
						className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
						onClick={onMenuButtonClick}
					>
						<span className="sr-only">Open sidebar</span>
						<svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
						</svg>
					</button>
					<div className="ml-4 md:ml-0">
						<h1 className="text-xl font-bold md:hidden">Retic Laravel Studio</h1>
					</div>
				</div>
				<div className="ml-4 flex items-center md:ml-6">
					{/* Notification bell */}
					<button
						type="button"
						className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
					>
						<span className="sr-only">View notifications</span>
						<svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
						</svg>
					</button>

					{/* Profile dropdown */}
					<Menu as="div" className="ml-3 relative">
						<div>
							<Menu.Button className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
								<span className="sr-only">Open user menu</span>
								<div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
									{user?.name?.charAt(0) || 'U'}
								</div>
							</Menu.Button>
						</div>
						<Transition
							as={Fragment}
							enter="transition ease-out duration-100"
							enterFrom="transform opacity-0 scale-95"
							enterTo="transform opacity-100 scale-100"
							leave="transition ease-in duration-75"
							leaveFrom="transform opacity-100 scale-100"
							leaveTo="transform opacity-0 scale-95"
						>
							<Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
								<div className="px-4 py-2 border-b border-gray-100">
									<p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
									<p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
								</div>
								<Menu.Item>
									{({ active }) => (
										<a
											href="#"
											className={`${
												active ? 'bg-gray-100' : ''
											} block px-4 py-2 text-sm text-gray-700`}
										>
											Your Profile
										</a>
									)}
								</Menu.Item>
								<Menu.Item>
									{({ active }) => (
										<a
											href="/admin/settings"
											className={`${
												active ? 'bg-gray-100' : ''
											} block px-4 py-2 text-sm text-gray-700`}
										>
											Settings
										</a>
									)}
								</Menu.Item>
								<Menu.Item>
									{({ active }) => (
										<button
											className={`${
												active ? 'bg-gray-100' : ''
											} block w-full text-left px-4 py-2 text-sm text-gray-700`}
											onClick={handleLogout}
										>
											Sign out
										</button>
									)}
								</Menu.Item>
							</Menu.Items>
						</Transition>
					</Menu>
				</div>
			</div>
		</header>
	);
};

export default Header;






