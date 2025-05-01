// src/pages/components/ComponentsList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';

const ComponentsList = () => {
	const [components, setComponents] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Mock data - replace with API call in production
		const mockComponents = [
			{ id: 1, name: 'Header', slug: 'header', category: 'layout', is_active: true },
			{ id: 2, name: 'Footer', slug: 'footer', category: 'layout', is_active: true },
			{ id: 3, name: 'Hero Banner', slug: 'hero-banner', category: 'content', is_active: true },
			{ id: 4, name: 'Feature Card', slug: 'feature-card', category: 'content', is_active: true },
			{ id: 5, name: 'Contact Form', slug: 'contact-form', category: 'form', is_active: true },
		];

		setComponents(mockComponents);
		setLoading(false);

		// Actual API implementation would be:
		// const fetchComponents = async () => {
		//   setLoading(true);
		//   try {
		//     const response = await fetch('/api/components');
		//     const data = await response.json();
		//     setComponents(data);
		//   } catch (error) {
		//     console.error('Error fetching components:', error);
		//   } finally {
		//     setLoading(false);
		//   }
		// };
		// fetchComponents();
	}, []);

	const handleDelete = (id) => {
		if (window.confirm('Are you sure you want to delete this component?')) {
			// Mock deletion - replace with API call in production
			setComponents(components.filter(component => component.id !== id));

			// Actual API implementation would be:
			// const deleteComponent = async () => {
			//   try {
			//     await fetch(`/api/components/${id}`, { method: 'DELETE' });
			//     setComponents(components.filter(component => component.id !== id));
			//   } catch (error) {
			//     console.error('Error deleting component:', error);
			//   }
			// };
			// deleteComponent();
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
						 {components.map((component) => (
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
						 ))}
						 </tbody>
					 </table>
				 )}
			</div>
		</div>
	);
};

export default ComponentsList;
