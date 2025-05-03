// resources/js/admin/src/pages/PageEditor/PageEditor.jsx
import React, { useState, useEffect } from 'react';
import {useParams, useNavigate, Link} from 'react-router-dom';
import { getPage, createPage, updatePage, getPageRevisions, restorePageRevision } from '../../api/pagesApi';
import { getActiveTheme } from '../../api/themesApi';
import { showToast } from '../../api/apiClient';
import PageHeader from '../../components/common/PageHeader';
import PageBuilder from '../../components/pageBuilder/PageBuilder';
import { getLayoutOptions } from '../../components/theme/LayoutSelector';

const PageEditor = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const isEditing = !!id;

	const [loading, setLoading] = useState(isEditing);
	const [saving, setSaving] = useState(false);
	const [showSettings, setShowSettings] = useState(false);
	const [revisions, setRevisions] = useState([]);
	const [formErrors, setFormErrors] = useState({});

	const [formData, setFormData] = useState({
		                                         title: '',
		                                         slug: '',
		                                         description: '',
		                                         content: [],
		                                         meta_title: '',
		                                         meta_description: '',
		                                         meta_keywords: '',
		                                         layout: '',
		                                         is_published: false,
	                                         });
	
	const [layoutOptions, setLayoutOptions] = useState([]);

	// Fetch page data if editing
	useEffect(() => {
		if (isEditing) {
			fetchPage();
			fetchRevisions();
		}
		
		// Load layout options
		fetchLayoutOptions();
	}, [id]);
	
	// Fetch theme layout options
	const fetchLayoutOptions = async () => {
		try {
			// First get the available layout options
			const options = getLayoutOptions();
			setLayoutOptions(options);
			
			// Also try to get the active theme to see its default layout
			const response = await getActiveTheme();
			const theme = response.data;
			
			// If no layout is set yet, use the theme's default
			if (!formData.layout && theme.default_layout) {
				setFormData(prev => ({ ...prev, layout: theme.default_layout }));
			}
		} catch (error) {
			console.error('Error fetching layout options:', error);
		}
	};

	// Generate slug from title
	useEffect(() => {
		if (!isEditing && formData.title && !formData.slug) {
			const slug = formData.title
			                     .toLowerCase()
			                     .replace(/[^\w\s-]/g, '')
			                     .replace(/\s+/g, '-')
			                     .replace(/-+/g, '-');

			setFormData(prev => ({ ...prev, slug }));
		}
	}, [formData.title, isEditing]);

	const fetchPage = async () => {
		setLoading(true);
		try {
			const response = await getPage(id);
			const pageData = response.data;

			// Parse content properly - handle both string and array formats
			let contentArray = [];
			if (pageData.content) {
				if (Array.isArray(pageData.content)) {
					contentArray = pageData.content;
				} else if (typeof pageData.content === 'string') {
					try {
						// Try to parse if it's a JSON string
						contentArray = JSON.parse(pageData.content);
						if (!Array.isArray(contentArray)) {
							console.warn('Content parsed to non-array value:', contentArray);
							contentArray = [];
						}
					} catch (e) {
						console.error('Error parsing page content string:', e);
						contentArray = [];
					}
				} else {
					console.warn('Unexpected content format:', typeof pageData.content);
				}
			}

			// Log for debugging
			console.log('Parsed page content:', contentArray);

			setFormData({
				title: pageData.title || '',
				slug: pageData.slug || '',
				description: pageData.description || '',
				content: contentArray,
				meta_title: pageData.meta_title || '',
				meta_description: pageData.meta_description || '',
				meta_keywords: pageData.meta_keywords || '',
				layout: pageData.layout || '',
				is_published: pageData.is_published || false,
			});
		} catch (error) {
			console.error('Error fetching page:', error);
			showToast('Error', 'Failed to fetch page data', 'error');
			navigate('/admin/pages');
		} finally {
			setLoading(false);
		}
	};

	const fetchRevisions = async () => {
		try {
			const response = await getPageRevisions(id);
			setRevisions(response.data);
		} catch (error) {
			console.error('Error fetching revisions:', error);
		}
	};

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value
		}));

		// Clear error for this field
		if (formErrors[name]) {
			setFormErrors(prev => ({ ...prev, [name]: null }));
		}
	};

	const handlePageBuilderChange = (components) => {
		// Make a copy to ensure we don't have reference issues with nested objects
		const componentsCopy = JSON.parse(JSON.stringify(components));
		setFormData(prev => ({ ...prev, content: componentsCopy }));

		// Clear error for content field
		if (formErrors.content) {
			setFormErrors(prev => ({ ...prev, content: null }));
		}

		// Debug the components being saved
		console.log('Updated page components:', componentsCopy);
	};

	const handleSubmit = async (e) => {
		// Always prevent the default form submission which would reload the page
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}

		// Don't proceed if already in the saving state
		if (saving) {
			return;
		}

		setSaving(true);

		try {
			// Create a deep copy of the form data to ensure proper serialization
			const formDataCopy = JSON.parse(JSON.stringify(formData));

			// Ensure content array is serialized properly
			if (Array.isArray(formDataCopy.content)) {
				console.log('Saving content array with length:', formDataCopy.content.length);
			} else {
				console.warn('Content is not an array before saving:', formDataCopy.content);
				// Ensure content is at least an empty array if it's not already an array
				formDataCopy.content = [];
			}

			if (isEditing) {
				await updatePage(id, formDataCopy);
				showToast('Success', 'Page updated successfully', 'success');
			} else {
				const response = await createPage(formDataCopy);
				showToast('Success', 'Page created successfully', 'success');
				// Navigate to edit page with the new ID
				navigate(`/admin/pages/edit/${response.data.id}`);
			}
		} catch (error) {
			console.error('Error saving page:', error);
			if (error.response && error.response.data && error.response.data.errors) {
				setFormErrors(error.response.data.errors);
			} else {
				showToast('Error', 'Failed to save page', 'error');
			}
		} finally {
			setSaving(false);
		}
	};

	const handleRestoreRevision = async (revisionId) => {
		if (!confirm('Are you sure you want to restore this revision? Your current changes will be saved as a new revision.')) {
			return;
		}

		try {
			await restorePageRevision(id, revisionId);
			showToast('Success', 'Revision restored successfully', 'success');
			fetchPage();
			fetchRevisions();
		} catch (error) {
			console.error('Error restoring revision:', error);
			showToast('Error', 'Failed to restore revision', 'error');
		}
	};

	const handlePreview = () => {
		// Open the preview page in a new tab
		window.open(`/preview/${formData.slug}`, '_blank');
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	return (
		<div>
			<PageHeader
				title={isEditing ? 'Edit Page' : 'Create Page'}
				description={isEditing ? 'Update your page content and settings' : 'Create a new page for your website'}
			/>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2">
					<form onSubmit={(e) => {e.preventDefault(); handleSubmit(e);}} className="space-y-6">
						<div className="card bg-white shadow rounded-lg p-6">
							<div className="mb-4">
								<label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
								<input
									type="text"
									id="title"
									name="title"
									value={formData.title}
									onChange={handleChange}
									className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${formErrors.title ? 'border-red-500' : ''}`}
									required
								/>
								{formErrors.title && <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>}
							</div>

							<div className="mb-4">
								<label htmlFor="slug" className="block text-sm font-medium text-gray-700">Slug</label>
								<div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    /
                  </span>
									<input
										type="text"
										id="slug"
										name="slug"
										value={formData.slug}
										onChange={handleChange}
										className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${formErrors.slug ? 'border-red-500' : ''}`}
										required
									/>
								</div>
								{formErrors.slug && <p className="mt-1 text-sm text-red-600">{formErrors.slug}</p>}
							</div>

							<div className="mb-4">
								<label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
								<textarea
									id="description"
									name="description"
									rows="3"
									value={formData.description}
									onChange={handleChange}
									className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${formErrors.description ? 'border-red-500' : ''}`}
								></textarea>
								{formErrors.description && <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>}
							</div>

							<div className="mb-4">
								<label htmlFor="layout" className="block text-sm font-medium text-gray-700">Page Layout</label>
								<select
									id="layout"
									name="layout"
									value={formData.layout}
									onChange={handleChange}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
								>
									<option value="">Use Theme Default</option>
									{layoutOptions.map(option => (
										<option key={option.id} value={option.value}>
											{option.name}
										</option>
									))}
								</select>
								<p className="mt-1 text-xs text-gray-500">
									Select a specific layout for this page or leave empty to use the theme's default layout.
								</p>
							</div>

							<div className="flex items-center mb-4">
								<input
									id="is_published"
									name="is_published"
									type="checkbox"
									checked={formData.is_published}
									onChange={handleChange}
									className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
								/>
								<label htmlFor="is_published" className="ml-2 block text-sm text-gray-900">
									Published
								</label>
							</div>
						</div>

						{/* Page Builder Component */}
						<div className="card">
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700 mb-2">Page Content</label>
								<div className={formErrors.content ? 'border border-red-500 rounded-md' : ''}>
									<PageBuilder
										value={formData.content}
										onChange={handlePageBuilderChange}
									/>
								</div>
								{formErrors.content && <p className="mt-1 text-sm text-red-600">{formErrors.content}</p>}
							</div>
						</div>

						<div className="bg-white shadow rounded-lg">
							<div className="px-4 py-5 sm:p-6">
								<div className="flex justify-between items-center">
									<h3 className="text-lg leading-6 font-medium text-gray-900">
										SEO Settings
									</h3>
									<button
										type="button"
										className="text-blue-600 hover:text-blue-900"
										onClick={() => setShowSettings(!showSettings)}
									>
										{showSettings ? 'Hide' : 'Show'}
									</button>
								</div>

								{showSettings && (
									<div className="mt-4 space-y-4">
										<div>
											<label htmlFor="meta_title" className="block text-sm font-medium text-gray-700">Meta Title</label>
											<input
												type="text"
												id="meta_title"
												name="meta_title"
												value={formData.meta_title}
												onChange={handleChange}
												className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
											/>
										</div>

										<div>
											<label htmlFor="meta_description" className="block text-sm font-medium text-gray-700">Meta Description</label>
											<textarea
												id="meta_description"
												name="meta_description"
												rows="2"
												value={formData.meta_description}
												onChange={handleChange}
												className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
											></textarea>
										</div>

										<div>
											<label htmlFor="meta_keywords" className="block text-sm font-medium text-gray-700">Meta Keywords</label>
											<input
												type="text"
												id="meta_keywords"
												name="meta_keywords"
												value={formData.meta_keywords}
												onChange={handleChange}
												className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
												placeholder="keyword1, keyword2, keyword3"
											/>
										</div>
									</div>
								)}
							</div>
						</div>

						<div className="flex justify-end space-x-3">
							<button
								type="button"
								onClick={() => navigate('/admin/pages')}
								className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							>
								Cancel
							</button>
							{isEditing && formData.slug && (
								<Link
									to={`/preview/${formData.slug}`}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
								>
									<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
									</svg>
									Preview
								</Link>
							)}
							{isEditing && (
								<Link
									to={`/admin/pages/edit-live/${id}`}
									className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
								>
									<svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
									</svg>
									Switch to Live Editor
								</Link>
							)}
							<button
								type="button"
									onClick={handleSubmit}
								disabled={saving}
								className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							>
								{saving ? (
									<>
										<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
										</svg>
										Saving...
									</>
								) : (
									 'Save'
								 )}
							</button>
						</div>
					</form>
				</div>

				{isEditing && (
					<div className="lg:col-span-1">
						<div className="bg-white shadow rounded-lg">
							<div className="px-4 py-5 sm:p-6">
								<h3 className="text-lg leading-6 font-medium text-gray-900">
									Revisions
								</h3>
								<div className="mt-4">
									{revisions.length === 0 ? (
										<p className="text-sm text-gray-500">No revisions available.</p>
									) : (
										 <ul className="divide-y divide-gray-200">
											 {revisions.map((revision) => (
												 <li key={revision.id} className="py-3">
													 <div className="flex justify-between">
														 <div>
															 <p className="text-sm font-medium text-gray-900">
																 {revision.title}
															 </p>
															 <p className="text-sm text-gray-500">
																 {new Date(revision.created_at).toLocaleString()}
															 </p>
															 {revision.creator && (
																 <p className="text-sm text-gray-500">
																	 By {revision.creator.name}
																 </p>
															 )}
														 </div>
														 <button
															 type="button"
															 onClick={() => handleRestoreRevision(revision.id)}
															 className="text-sm text-blue-600 hover:text-blue-900"
														 >
															 Restore
														 </button>
													 </div>
												 </li>
											 ))}
										 </ul>
									 )}
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default PageEditor;