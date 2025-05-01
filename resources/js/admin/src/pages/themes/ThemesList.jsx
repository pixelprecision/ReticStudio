// src/pages/themes/ThemesList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { FiEdit, FiTrash2, FiCheck, FiEye, FiCopy } from 'react-icons/fi';
import { getThemes, activateTheme, deleteTheme } from '../../api/themesApi';
import { toast } from 'react-toastify'; // Assuming you're using react-toastify for notifications

const ThemesList = () => {
	const [themes, setThemes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchThemes = async () => {
		setLoading(true);
		try {
			const response = await getThemes();
			console.log(response);
			setThemes(response.data.data);
			setError(null);
		} catch (error) {
			console.error('Error fetching themes:', error);
			setError('Failed to load themes. Please try again later.');
			toast.error('Failed to load themes');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchThemes();
	}, []);

	const handleActivate = async (id) => {
		try {
			await activateTheme(id);
			// Update local state to reflect the change
			setThemes(themes.map(theme => ({
				...theme,
				is_active: theme.id === id
			})));
			toast.success('Theme activated successfully');
		} catch (error) {
			console.error('Error activating theme:', error);
			toast.error('Failed to activate theme');
		}
	};

	const handleDelete = async (id) => {
		// Prevent deleting active or system themes
		const theme = themes.find(t => t.id === id);
		if (theme.is_active) {
			toast.error('Cannot delete the active theme. Please activate another theme first.');
			return;
		}

		if (theme.is_system) {
			toast.error('Cannot delete a system theme.');
			return;
		}

		if (window.confirm('Are you sure you want to delete this theme?')) {
			try {
				await deleteTheme(id);
				// Update local state to reflect the change
				setThemes(themes.filter(theme => theme.id !== id));
				toast.success('Theme deleted successfully');
			} catch (error) {
				console.error('Error deleting theme:', error);
				toast.error('Failed to delete theme');
			}
		}
	};

	const handleDuplicate = async (id) => {
		try {
			// Assuming the API will handle the duplication and return the new theme
			const response = await fetch(`/api/themes/${id}/duplicate`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
				}
			});

			if (!response.ok) {
				throw new Error('Failed to duplicate theme');
			}

			const newTheme = await response.json();
			setThemes([...themes, newTheme]);
			toast.success('Theme duplicated successfully');
		} catch (error) {
			console.error('Error duplicating theme:', error);
			toast.error('Failed to duplicate theme');
		}
	};

	return (
		<div>
			<PageHeader
				title="Themes"
				description="Manage your website themes"
				createButtonLabel="Create Theme"
				createButtonLink="/admin/themes/create"
			/>

			{error && (
				<div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
					<p>{error}</p>
				</div>
			)}

			{loading ? (
				<div className="flex justify-center items-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
				</div>
			) : (
				 <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					 {themes.length === 0 ? (
						 <div className="col-span-full text-center py-12">
							 <p className="text-gray-500">No themes found. Create your first theme to get started.</p>
						 </div>
					 ) : (
						  themes.map((theme) => (
							  <div key={theme.id} className="bg-white overflow-hidden shadow rounded-lg">
								  <div className="relative">
									  <img
										  src={theme.preview_image || 'https://via.placeholder.com/300x200'}
										  alt={theme.name}
										  className="w-full h-48 object-cover"
									  />
									  {theme.is_active && (
										  <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
											  Active
										  </div>
									  )}
									  {theme.is_system && (
										  <div className="absolute top-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded">
											  System
										  </div>
									  )}
								  </div>

								  <div className="p-4">
									  <h3 className="text-lg font-medium text-gray-900">{theme.name}</h3>
									  <p className="mt-1 text-sm text-gray-500">{theme.description}</p>

									  <div className="mt-4 flex justify-between items-center">
										  <div className="text-xs text-gray-500">
											  {new Date(theme.created_at).toLocaleDateString()}
										  </div>

										  <div className="flex space-x-2">
											  {!theme.is_active && (
												  <button
													  onClick={() => handleActivate(theme.id)}
													  className="p-1 text-green-600 hover:text-green-900"
													  title="Activate Theme"
												  >
													  <FiCheck size={18} />
												  </button>
											  )}

											  <Link
												  to={`/admin/themes/edit/${theme.id}`}
												  className="p-1 text-blue-600 hover:text-blue-900"
												  title="Edit Theme"
											  >
												  <FiEdit size={18} />
											  </Link>

											  <a
												  href={`/preview/theme/${theme.id}`}
												  target="_blank"
												  rel="noopener noreferrer"
												  className="p-1 text-purple-600 hover:text-purple-900"
												  title="Preview Theme"
											  >
												  <FiEye size={18} />
											  </a>

											  <button
												  onClick={() => handleDuplicate(theme.id)}
												  className="p-1 text-orange-600 hover:text-orange-900"
												  title="Duplicate Theme"
											  >
												  <FiCopy size={18} />
											  </button>

											  {!theme.is_active && !theme.is_system && (
												  <button
													  onClick={() => handleDelete(theme.id)}
													  className="p-1 text-red-600 hover:text-red-900"
													  title="Delete Theme"
												  >
													  <FiTrash2 size={18} />
												  </button>
											  )}
										  </div>
									  </div>
								  </div>
							  </div>
						  ))
					  )}
				 </div>
			 )}
		</div>
	);
};

export default ThemesList;
