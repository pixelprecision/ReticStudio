// src/pages/menus/MenusList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit, FiTrash2, FiCopy, FiExternalLink } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import { getMenus, deleteMenu as apiDeleteMenu } from '../../api/menusApi';

const MenusList = () => {
	const [menus, setMenus] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchMenus = async () => {
			setLoading(true);
			try {
				const response = await getMenus();
				console.log(response);
				setMenus(response.data.data);
				setError(null);
			} catch (error) {
				console.error('Error fetching menus:', error);
				setError('Failed to load menus. Please try again later.');
			} finally {
				setLoading(false);
			}
		};

		fetchMenus();
	}, []);

	const handleDelete = async (id) => {
		// Prevent deleting system menus
		const menu = menus.find(m => m.id === id);
		if (menu.is_system) {
			alert('Cannot delete a system menu.');
			return;
		}

		if (window.confirm('Are you sure you want to delete this menu?')) {
			try {
				await apiDeleteMenu(id);
				setMenus(menus.filter(menu => menu.id !== id));
			} catch (error) {
				console.error('Error deleting menu:', error);
				alert('Failed to delete menu. Please try again later.');
			}
		}
	};

	const handleDuplicate = async (id) => {
		try {
			// For duplication, we'll need to first get the menu data
			// Then create a new menu with similar data
			// This is a simple approach since we don't have a direct duplicate API endpoint
			const menuToDuplicate = menus.find(menu => menu.id === id);

			// Create a copy with a new name
			const duplicateData = {
				name: `${menuToDuplicate.name} (Copy)`,
				location: menuToDuplicate.location,
				// We would need to include other necessary fields here
				// This would depend on your exact API requirements
			};

			// For now, we'll handle duplication client-side
			// In a real implementation, you might want to create a specific endpoint for this
			const newMenu = {
				...menuToDuplicate,
				id: Date.now(), // Temporary ID until server response
				name: `${menuToDuplicate.name} (Copy)`,
				is_system: false,
				created_at: new Date().toISOString()
			};

			setMenus([...menus, newMenu]);

			// Note: In a real implementation, you would call an API endpoint
			// const response = await apiClient.post(`/menus/${id}/duplicate`);
			// setMenus([...menus, response.data]);

		} catch (error) {
			console.error('Error duplicating menu:', error);
			alert('Failed to duplicate menu. Please try again later.');
		}
	};

	return (
		<div>
			<PageHeader
				title="Menus"
				description="Manage your website navigation menus"
				createButtonLabel="Create Menu"
				createButtonLink="/admin/menus/create"
			/>

			{loading ? (
				<div className="flex justify-center items-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
				</div>
			) : error ? (
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
					{error}
				</div>
			) : (
				    <div className="bg-white shadow overflow-hidden sm:rounded-md">
					    <ul className="divide-y divide-gray-200">
						    {menus.length === 0 ? (
							    <li className="px-4 py-5 sm:px-6">
								    <p className="text-gray-500 text-center">No menus found. Create your first menu to get started.</p>
							    </li>
						    ) : (
							     menus.map((menu) => (
								     <li key={menu.id}>
									     <div className="px-4 py-4 flex items-center sm:px-6">
										     <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
											     <div>
												     <div className="flex text-sm">
													     <p className="font-medium text-blue-600 truncate">{menu.name}</p>
													     {menu.is_system && (
														     <p className="ml-2 flex-shrink-0 font-normal text-gray-500">
															     (System Menu)
														     </p>
													     )}
												     </div>
												     <div className="mt-2 flex">
													     <div className="flex items-center text-sm text-gray-500">
														     <p>
															     Location: <span className="capitalize">{menu.location}</span>
														     </p>
														     <p className="ml-6">
															     Items: {menu.item_count}
														     </p>
														     <p className="ml-6">
															     Created: {new Date(menu.created_at).toLocaleDateString()}
														     </p>
													     </div>
												     </div>
											     </div>
										     </div>
										     <div className="ml-5 flex-shrink-0 flex space-x-2">
											     <Link
												     to={`/admin/menus/edit/${menu.id}`}
												     className="p-1 text-blue-600 hover:text-blue-900"
												     title="Edit Menu"
											     >
												     <FiEdit size={18} />
											     </Link>

											     <button
												     onClick={() => handleDuplicate(menu.id)}
												     className="p-1 text-orange-600 hover:text-orange-900"
												     title="Duplicate Menu"
											     >
												     <FiCopy size={18} />
											     </button>

											     {!menu.is_system && (
												     <button
													     onClick={() => handleDelete(menu.id)}
													     className="p-1 text-red-600 hover:text-red-900"
													     title="Delete Menu"
												     >
													     <FiTrash2 size={18} />
												     </button>
											     )}
										     </div>
									     </div>
								     </li>
							     ))
						     )}
					    </ul>
				    </div>
			    )}
		</div>
	);
};

export default MenusList;
