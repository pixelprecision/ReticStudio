// src/pages/components/ComponentsList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { getComponents, deleteComponent } from '../../api/componentsApi';

const ComponentsList = () => {
	const [components, setComponents] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchComponents = async () => {
			setLoading(true);
			try {
				const response = await getComponents();
				setComponents(response.data.data);
				setError(null);
			} catch (error) {
				console.error('Error fetching components:', error);
				setError('Failed to load components. Please try again later.');
			} finally {
				setLoading(false);
			}
		};

		fetchComponents();
	}, []);

	const handleDelete = async (id) => {
		if (window.confirm('Are you sure you want to delete this component?')) {
			try {
				await deleteComponent(id);
				setComponents(components.filter(component => component.id !== id));
			} catch (error) {
				console.error('Error deleting component:', error);
				alert('Failed to delete component. Please try again later.');
			}
		}
	};

	return (
		<div>
			<PageHeader
				title="Components"
				description="Manage your reusable page components"
				createButtonLabel="Create Component"
				createButtonLink="/admin/components/create"
			/>

			<div className="bg-white shadow-md rounded-lg overflow-hidden">
				{loading ? (
					<div className="flex justify-center items-center p-8">
						<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
					</div>
				) : error ? (
					<div className="text-center p-6 text-red-500">
						<p>{error}</p>
						<button
							onClick={() => window.location.reload()}
							className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
						>
							Retry
						</button>
					</div>
				) : (
					    <table className="min-w-full divide-y divide-gray-200">
						    <thead className="bg-gray-50">
						    <tr>
							    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
							    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
							    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
							    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
							    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
						    </tr>
						    </thead>
						    <tbody className="bg-white divide-y divide-gray-200">
						    {components.length === 0 ? (
							    <tr>
								    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
									    No components found. Create one to get started.
								    </td>
							    </tr>
						    ) : (
							     components.map((component) => (
								     <tr key={component.id}>
									     <td className="px-6 py-4 whitespace-nowrap">
										     <div className="text-sm font-medium text-gray-900">{component.name}</div>
									     </td>
									     <td className="px-6 py-4 whitespace-nowrap">
										     <div className="text-sm text-gray-500">{component.slug}</div>
									     </td>
									     <td className="px-6 py-4 whitespace-nowrap">
										     <div className="text-sm text-gray-500">{component.category}</div>
									     </td>
									     <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
	                      component.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {component.is_active ? 'Active' : 'Inactive'}
                      </span>
									     </td>
									     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
										     <Link to={`/admin/components/edit/${component.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
											     <FiEdit className="inline" /> Edit
										     </Link>
										     <button
											     onClick={() => handleDelete(component.id)}
											     className="text-red-600 hover:text-red-900"
										     >
											     <FiTrash2 className="inline" /> Delete
										     </button>
									     </td>
								     </tr>
							     ))
						     )}
						    </tbody>
					    </table>
				    )}
			</div>
		</div>
	);
};

export default ComponentsList;
