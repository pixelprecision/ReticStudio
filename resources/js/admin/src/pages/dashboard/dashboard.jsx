// resources/js/admin/src/pages/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const StatsCard = ({ title, value, description, linkTo, linkText }) => (
	<div className="bg-white overflow-hidden shadow rounded-lg">
		<div className="px-4 py-5 sm:p-6">
			<dt className="text-sm font-medium text-gray-500 truncate">
				{title}
			</dt>
			<dd className="mt-1 text-3xl font-semibold text-gray-900">
				{value}
			</dd>
			<dd className="mt-2 text-sm text-gray-500">
				{description}
			</dd>
		</div>
		{linkTo && (
			<div className="bg-gray-50 px-4 py-4 sm:px-6">
				<div className="text-sm">
					<Link to={linkTo} className="font-medium text-blue-600 hover:text-blue-500">
						{linkText || 'View all'} <span aria-hidden="true">&rarr;</span>
					</Link>
				</div>
			</div>
		)}
	</div>
)

const Dashboard = () => {
	const [stats, setStats] = useState({
		                                   pages: 0,
		                                   forms: 0,
		                                   formSubmissions: 0,
		                                   components: 0,
		                                   mediaItems: 0,
		                                   users: 0,
	                                   })

	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				// In a real application, you would fetch actual stats from the API
				// This is just placeholder data
				setStats({
					         pages: 8,
					         forms: 3,
					         formSubmissions: 12,
					         components: 15,
					         mediaItems: 34,
					         users: 5,
				         })
			} catch (error) {
				console.error('Error fetching dashboard data:', error)
			} finally {
				setLoading(false)
			}
		}

		fetchDashboardData()
	}, [])

	return (
		<div>
			<h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>

			{loading ? (
				<div className="flex justify-center">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
				</div>
			) : (
				 <>
					 <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
						 <StatsCard
							 title="Pages"
							 value={stats.pages}
							 description="Total published and draft pages"
							 linkTo="/admin/pages"
							 linkText="View all pages"
						 />

						 <StatsCard
							 title="Forms"
							 value={stats.forms}
							 description={`Total forms with ${stats.formSubmissions} submissions`}
							 linkTo="/admin/forms"
							 linkText="Manage forms"
						 />

						 <StatsCard
							 title="Media Library"
							 value={stats.mediaItems}
							 description="Total images, documents and other media items"
							 linkTo="/admin/media"
							 linkText="Browse media"
						 />
					 </div>

					 <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
						 <div className="bg-white overflow-hidden shadow rounded-lg lg:col-span-2">
							 <div className="px-4 py-5 sm:p-6">
								 <h2 className="text-lg font-medium text-gray-900">Welcome to Retic Laravel Studio</h2>
								 <p className="mt-3 text-sm text-gray-500">
									 This is the main administration area for your website. From here, you can manage
									 pages, components, forms, media, and more.
								 </p>
								 <p className="mt-3 text-sm text-gray-500">
									 The Retic Laravel Studio combines the power of Laravel's robust backend with
									 React's dynamic frontend capabilities to offer an intuitive interface for
									 building responsive, database-driven web applications.
								 </p>
							 </div>
						 </div>

						 <div className="bg-white overflow-hidden shadow rounded-lg">
							 <div className="px-4 py-5 sm:p-6">
								 <h2 className="text-lg font-medium text-gray-900">Quick Links</h2>
								 <ul className="mt-3 space-y-3">
									 <li>
										 <Link to="/admin/pages/create" className="text-sm text-blue-600 hover:text-blue-500">
											 Create a new page
										 </Link>
									 </li>
									 <li>
										 <Link to="/admin/forms" className="text-sm text-blue-600 hover:text-blue-500">
											 Manage forms
										 </Link>
									 </li>
									 <li>
										 <Link to="/admin/media" className="text-sm text-blue-600 hover:text-blue-500">
											 Upload media
										 </Link>
									 </li>
									 <li>
										 <Link to="/admin/settings" className="text-sm text-blue-600 hover:text-blue-500">
											 Configure settings
										 </Link>
									 </li>
								 </ul>
							 </div>
						 </div>
					 </div>
				 </>
			 )}
		</div>
	)
}

export default Dashboard
