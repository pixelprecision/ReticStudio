// resources/js/admin/src/components/layout/AdminLayout.jsx
import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import CacheStatus from './CacheStatus'

const AdminLayout = () => {
	const [sidebarOpen, setSidebarOpen] = useState(false)

	return (
		<div className="h-screen flex overflow-hidden bg-gray-100">
			{/* Mobile sidebar */}
			<div className={`${sidebarOpen ? 'block' : 'hidden'} fixed inset-0 flex z-40 md:hidden`} role="dialog" aria-modal="true">
				<div className="fixed inset-0 bg-gray-600 bg-opacity-75" aria-hidden="true" onClick={() => setSidebarOpen(false)}></div>
				<div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white">
					<div className="absolute top-0 right-0 -mr-12 pt-2">
						<button
							type="button"
							className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
							onClick={() => setSidebarOpen(false)}
						>
							<span className="sr-only">Close sidebar</span>
							<svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
					<div className="flex-shrink-0 flex items-center px-4">
						<h1 className="text-xl font-bold">Retic Laravel Studio</h1>
					</div>
					<div className="mt-5 flex-1 h-0 overflow-y-auto">
						<Sidebar mobile={true} />
					</div>
				</div>
				<div className="flex-shrink-0 w-14" aria-hidden="true">
					{/* Dummy element to force sidebar to shrink to fit close icon */}
				</div>
			</div>

			{/* Static sidebar for desktop */}
			<div className="hidden md:flex md:flex-shrink-0">
				<div className="flex flex-col w-64">
					<div className="flex flex-col h-0 flex-1">
						<div className="flex items-center h-16 flex-shrink-0 px-4 bg-white border-b border-gray-200">
							<h1 className="text-xl font-bold">Retic Laravel Studio</h1>
						</div>
						<div className="flex-1 flex flex-col overflow-y-auto bg-white border-r border-gray-200">
							<Sidebar />
						</div>
					</div>
				</div>
			</div>

			<div className="flex flex-col w-0 flex-1 overflow-hidden">
				<Header
					onMenuButtonClick={() => setSidebarOpen(true)}
				/>
				<main className="flex-1 relative overflow-y-auto focus:outline-none p-6">
					<Outlet />
				</main>
				<footer className="bg-white border-t border-gray-200 py-4">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<p className="text-center text-sm text-gray-500">
							© {new Date().getFullYear()} Retic Laravel Studio. All rights reserved.
						</p>
					</div>
				</footer>
			</div>
			
			{/* Cache Status */}
			<CacheStatus />
		</div>
	)
}

export default AdminLayout