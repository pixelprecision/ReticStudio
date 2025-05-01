// resources/js/admin/src/components/layout/AuthLayout.jsx
import React from 'react'
import { Outlet } from 'react-router-dom'

const AuthLayout = () => {
	return (
		<div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<h1 className="text-center text-3xl font-extrabold text-gray-900">
					LaravelCMS Builder
				</h1>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
					<Outlet />
				</div>
				<div className="mt-6 text-center">
					<p className="text-sm text-gray-500">
						© {new Date().getFullYear()} LaravelCMS Builder. All rights reserved.
					</p>
				</div>
			</div>
		</div>
	)
}

export default AuthLayout
