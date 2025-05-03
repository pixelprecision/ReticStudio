// src/pages/plugins/PluginsList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiToggleLeft, FiToggleRight, FiTrash2, FiSettings, FiDownload, FiUpload } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';

const PluginsList = () => {
	const [plugins, setPlugins] = useState([]);
	const [loading, setLoading] = useState(true);
	const [uploadOpen, setUploadOpen] = useState(false);
	const [selectedFile, setSelectedFile] = useState(null);
	const [uploadLoading, setUploadLoading] = useState(false);

	useEffect(() => {
		// Mock data - replace with API call in production
		const mockPlugins = [
			{
				id: 1,
				name: 'Contact Form',
				slug: 'contact-form',
				description: 'Simple contact form with email notifications',
				version: '1.2.0',
				author: 'Retic',
				is_active: true,
				is_core: true,
				created_at: '2023-05-15T10:00:00',
			},
			{
				id: 2,
				name: 'SEO Manager',
				slug: 'seo-manager',
				description: 'Advanced SEO management for your pages and posts',
				version: '1.0.5',
				author: 'Retic',
				is_active: true,
				is_core: false,
				created_at: '2023-05-20T14:30:00',
			},
			{
				id: 3,
				name: 'Google Analytics',
				slug: 'google-analytics',
				description: 'Integrate Google Analytics with your website',
				version: '1.1.2',
				author: 'Third Party',
				is_active: false,
				is_core: false,
				created_at: '2023-06-05T09:15:00',
			},
			{
				id: 4,
				name: 'Social Sharing',
				slug: 'social-sharing',
				description: 'Add social sharing buttons to your content',
				version: '0.9.8',
				author: 'Community',
				is_active: true,
				is_core: false,
				created_at: '2023-06-10T16:20:00',
			},
		];

		setPlugins(mockPlugins);
		setLoading(false);

		// Actual API implementation would be:
		// const fetchPlugins = async () => {
		//   setLoading(true);
		//   try {
		//     const response = await fetch('/api/plugins');
		//     const data = await response.json();
		//     setPlugins(data);
		//   } catch (error) {
		//     console.error('Error fetching plugins:', error);
		//   } finally {
		//     setLoading(false);
		//   }
		// };
		// fetchPlugins();
	}, []);

	const handleToggleActive = (id) => {
		// Mock toggle - replace with API call in production
		setPlugins(plugins.map(plugin =>
			                       plugin.id === id ? { ...plugin, is_active: !plugin.is_active } : plugin
		));

		// Actual API implementation would be:
		// const togglePlugin = async () => {
		//   try {
		//     const plugin = plugins.find(p => p.id === id);
		//     await fetch(`/api/plugins/${id}/toggle`, {
		//       method: 'POST',
		//       headers: {
		//         'Content-Type': 'application/json',
		//       },
		//       body: JSON.stringify({ is_active: !plugin.is_active })
		//     });
		//     setPlugins(plugins.map(plugin =>
		//       plugin.id === id ? { ...plugin, is_active: !plugin.is_active } : plugin
		//     ));
		//   } catch (error) {
		//     console.error('Error toggling plugin:', error);
		//   }
		// };
		// togglePlugin();
	};

	const handleDelete = (id) => {
		// Prevent deleting core plugins
		const plugin = plugins.find(p => p.id === id);
		if (plugin.is_core) {
			alert('Cannot delete a core plugin.');
			return;
		}

		if (window.confirm('Are you sure you want to delete this plugin? This action cannot be undone.')) {
			// Mock deletion - replace with API call in production
			setPlugins(plugins.filter(plugin => plugin.id !== id));

			// Actual API implementation would be:
			// const deletePlugin = async () => {
			//   try {
			//     await fetch(`/api/plugins/${id}`, { method: 'DELETE' });
			//     setPlugins(plugins.filter(plugin => plugin.id !== id));
			//   } catch (error) {
			//     console.error('Error deleting plugin:', error);
			//   }
			// };
			// deletePlugin();
		}
	};

	const handleFileChange = (e) => {
		setSelectedFile(e.target.files[0]);
	};

	const handleUploadSubmit = (e) => {
		e.preventDefault();

		if (!selectedFile) {
			alert('Please select a plugin file to upload.');
			return;
		}

		// Mock upload - replace with API call in production
		setUploadLoading(true);

		// Simulate API delay
		setTimeout(() => {
			// Mock new plugin
			const newPlugin = {
				id: Date.now(),
				name: 'Uploaded Plugin',
				slug: 'uploaded-plugin',
				description: 'Recently uploaded plugin',
				version: '1.0.0',
				author: 'User Upload',
				is_active: false,
				is_core: false,
				created_at: new Date().toISOString()
			};

			setPlugins([...plugins, newPlugin]);
			setUploadLoading(false);
			setUploadOpen(false);
			setSelectedFile(null);

			// Success message
			alert('Plugin uploaded successfully!');

			// Actual API implementation would be:
			// const uploadPlugin = async () => {
			//   try {
			//     const formData = new FormData();
			//     formData.append('plugin_file', selectedFile);
			//
			//     const response = await fetch('/api/plugins/upload', {
			//       method: 'POST',
			//       body: formData
			//     });
			//
			//     const data = await response.json();
			//     setPlugins([...plugins, data]);
			//     setUploadLoading(false);
			//     setUploadOpen(false);
			//     setSelectedFile(null);
			//   } catch (error) {
			//     console.error('Error uploading plugin:', error);
			//     setUploadLoading(false);
			//     alert('Failed to upload plugin. Please try again.');
			//   }
			// };
			// uploadPlugin();
		}, 2000);
	};

	return (
		<div>
			<PageHeader
				title="Plugins"
				description="Extend your website functionality with plugins"
				actions={
					<button
						onClick={() => setUploadOpen(!uploadOpen)}
						className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
					>
						<FiUpload className="mr-2" />
						Upload Plugin
					</button>
				}
			/>

			{uploadOpen && (
				<div className="bg-white shadow rounded-lg mb-6 p-6">
					<h3 className="text-lg font-medium text-gray-900 mb-4">Upload Plugin</h3>
					<form onSubmit={handleUploadSubmit}>
						<div className="mb-4">
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Plugin File (.zip)
							</label>
							<input
								type="file"
								accept=".zip"
								onChange={handleFileChange}
								className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
							/>
							<p className="mt-1 text-xs text-gray-500">
								Upload a valid plugin package (ZIP file) containing the plugin files.
							</p>
						</div>
						<div className="flex justify-end">
							<button
								type="button"
								onClick={() => setUploadOpen(false)}
								className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={uploadLoading || !selectedFile}
								className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							>
								{uploadLoading ? (
									<>
										<div className="animate-spin mr-2 h-4 w-4 border-2 border-t-2 border-transparent border-t-white rounded-full"></div>
										Uploading...
									</>
								) : (
									 'Upload Plugin'
								 )}
							</button>
						</div>
					</form>
				</div>
			)}

			{loading ? (
				<div className="flex justify-center items-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
				</div>
			) : (
				 <div className="bg-white shadow overflow-hidden sm:rounded-md">
					 <ul className="divide-y divide-gray-200">
						 {plugins.map((plugin) => (
							 <li key={plugin.id}>
								 <div className="px-4 py-5 sm:px-6">
									 <div className="flex items-center justify-between">
										 <div className="flex-1 min-w-0">
											 <h3 className="text-lg font-medium text-gray-900 truncate flex items-center">
												 {plugin.name}
												 {plugin.is_core && (
													 <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            Core
                          </span>
												 )}
												 <span className="ml-2 text-sm text-gray-500">v{plugin.version}</span>
											 </h3>
											 <p className="mt-1 text-sm text-gray-500">
												 {plugin.description}
											 </p>
										 </div>
										 <div className="flex space-x-3">
											 <button
												 onClick={() => handleToggleActive(plugin.id)}
												 className={`p-1 rounded-md ${
													 plugin.is_active
													 ? 'text-green-600 hover:text-green-900'
													 : 'text-gray-400 hover:text-gray-600'
												 }`}
												 title={plugin.is_active ? 'Deactivate' : 'Activate'}
											 >
												 {plugin.is_active ? <FiToggleRight size={24} /> : <FiToggleLeft size={24} />}
											 </button>

											 <Link
												 to={`/admin/plugins/${plugin.id}`}
												 className="p-1 text-blue-600 hover:text-blue-900"
												 title="Plugin Settings"
											 >
												 <FiSettings size={20} />
											 </Link>

											 {!plugin.is_core && (
												 <button
													 onClick={() => handleDelete(plugin.id)}
													 className="p-1 text-red-600 hover:text-red-900"
													 title="Delete Plugin"
												 >
													 <FiTrash2 size={20} />
												 </button>
											 )}
										 </div>
									 </div>
									 <div className="mt-2 flex items-center text-sm text-gray-500">
										 <span className="mr-4">Author: {plugin.author}</span>
										 <span>Added: {new Date(plugin.created_at).toLocaleDateString()}</span>
									 </div>
								 </div>
							 </li>
						 ))}
					 </ul>
				 </div>
			 )}
		</div>
	);
};

export default PluginsList;
