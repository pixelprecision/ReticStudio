// src/pages/components/ComponentEditor.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { getComponent, createComponent, updateComponent } from '../../api/componentsApi';

// Import the Ace editor components
import AceEditor from 'react-ace';

// Import Ace editor modes and themes
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-jsx';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-language_tools';

const ComponentEditor = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const isEditing = !!id;

	const [formData, setFormData] = useState({
		                                         name: '',
		                                         slug: '',
		                                         description: '',
		                                         category: 'content',
		                                         icon: '',
		                                         schema: '{}',
		                                         template: '',
		                                         is_active: true,
	                                         });

	const [loading, setLoading] = useState(isEditing);
	const [saving, setSaving] = useState(false);
	const [errors, setErrors] = useState({});

	useEffect(() => {
		if (isEditing) {
			const fetchComponent = async () => {
				setLoading(true);
				try {
					const response = await getComponent(id);

					// Make a copy of the data
					let formattedData = { ...response.data };

					// Convert schema from array/object to JSON string for the editor
					if (typeof formattedData.schema === 'object') {
						formattedData.schema = JSON.stringify(formattedData.schema, null, 2);
					}

					setFormData(formattedData);
					setErrors({});
				} catch (error) {
					console.error('Error fetching component:', error);
					setErrors({
						          api: 'Failed to load component. Please try again or go back to the components list.'
					          });
				} finally {
					setLoading(false);
				}
			};

			fetchComponent();
		}
	}, [id, isEditing]);

	// Generate slug from name
	useEffect(() => {
		if (!isEditing && formData.name && !formData.slug) {
			const slug = formData.name
			                     .toLowerCase()
			                     .replace(/[^\w\s-]/g, '')
			                     .replace(/\s+/g, '-')
			                     .replace(/-+/g, '-');

			setFormData({ ...formData, slug });
		}
	}, [formData.name, isEditing]);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData({
			            ...formData,
			            [name]: type === 'checkbox' ? checked : value
		            });

		// Clear error when field is changed
		if (errors[name]) {
			setErrors({ ...errors, [name]: null });
		}
	};

	// Format JSON function
	const formatJSON = () => {
		try {
			const formatted = JSON.stringify(JSON.parse(formData.schema), null, 2);
			setFormData({ ...formData, schema: formatted });
			setErrors({ ...errors, schema: null });
		} catch (error) {
			setErrors({ ...errors, schema: 'Invalid JSON format' });
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSaving(true);

		// Basic validation
		const newErrors = {};
		if (!formData.name) newErrors.name = 'Name is required';
		if (!formData.slug) newErrors.slug = 'Slug is required';
		if (!formData.category) newErrors.category = 'Category is required';

		// Validate and parse JSON schema
		let parsedSchema;
		try {
			parsedSchema = JSON.parse(formData.schema);
		} catch (error) {
			newErrors.schema = 'Invalid JSON schema';
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			setSaving(false);
			return;
		}

		try {
			// Create data object with schema converted to object (not string)
			const apiData = {
				...formData,
				schema: parsedSchema  // Parse the JSON string to an object for the API
			};

			if (isEditing) {
				await updateComponent(id, apiData);
			} else {
				await createComponent(apiData);
			}
			navigate('/admin/components');
		} catch (error) {
			console.error('Error saving component:', error);

			// Handle validation errors from API
			if (error.response && error.response.status === 422) {
				setErrors(error.response.data.errors || {});
			} else {
				setErrors({
					          api: 'Failed to save component. Please try again.'
				          });
			}
		} finally {
			setSaving(false);
		}
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
				title={isEditing ? 'Edit Component' : 'Create Component'}
				description={isEditing ? 'Modify an existing component' : 'Create a new reusable component'}
			/>

			{errors.api && (
				<div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
					<p>{errors.api}</p>
				</div>
			)}

			<div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
				<form onSubmit={handleSubmit}>
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						<div>
							<label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
							<input
								type="text"
								id="name"
								name="name"
								value={formData.name}
								onChange={handleChange}
								className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${errors.name ? 'border-red-500' : ''}`}
								required
							/>
							{errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
						</div>

						<div>
							<label htmlFor="slug" className="block text-sm font-medium text-gray-700">Slug</label>
							<input
								type="text"
								id="slug"
								name="slug"
								value={formData.slug}
								onChange={handleChange}
								className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${errors.slug ? 'border-red-500' : ''}`}
								required
							/>
							{errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
						</div>

						<div className="md:col-span-2">
							<label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
							<textarea
								id="description"
								name="description"
								rows="2"
								value={formData.description}
								onChange={handleChange}
								className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
							></textarea>
							{errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
						</div>

						<div>
							<label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
							<select
								id="category"
								name="category"
								value={formData.category}
								onChange={handleChange}
								className={`mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.category ? 'border-red-500' : ''}`}
								required
							>
								<option value="layout">Layout</option>
								<option value="content">Content</option>
								<option value="media">Media</option>
								<option value="form">Form</option>
								<option value="interactive">Interactive</option>
							</select>
							{errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
						</div>

						<div>
							<label htmlFor="icon" className="block text-sm font-medium text-gray-700">Icon</label>
							<input
								type="text"
								id="icon"
								name="icon"
								value={formData.icon}
								onChange={handleChange}
								className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${errors.icon ? 'border-red-500' : ''}`}
							/>
							<p className="mt-1 text-xs text-gray-500">Icon identifier (e.g., 'banner', 'gallery')</p>
							{errors.icon && <p className="mt-1 text-sm text-red-600">{errors.icon}</p>}
						</div>

						<div className="md:col-span-2">
							<div className="flex justify-between items-center">
								<label htmlFor="schema" className="block text-sm font-medium text-gray-700">Schema (JSON)</label>
								<button
									type="button"
									onClick={formatJSON}
									className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
								>
									Format JSON
								</button>
							</div>
							<AceEditor
								mode="json"
								theme="github"
								name="schema-editor"
								value={formData.schema}
								onChange={(value) => {
									setFormData({ ...formData, schema: value });
									if (errors.schema) {
										setErrors({ ...errors, schema: null });
									}
								}}
								fontSize={14}
								width="100%"
								height="250px"
								showPrintMargin={false}
								showGutter={true}
								highlightActiveLine={true}
								setOptions={{
									enableBasicAutocompletion: true,
									enableLiveAutocompletion: true,
									enableSnippets: true,
									showLineNumbers: true,
									tabSize: 2,
								}}
								className={`mt-1 border border-gray-300 rounded-md ${errors.schema ? 'border-red-500' : ''}`}
							/>
							{errors.schema && <p className="mt-1 text-sm text-red-600">{errors.schema}</p>}
							<p className="mt-1 text-xs text-gray-500">Define component properties in JSON format</p>
						</div>

						<div className="md:col-span-2">
							<label htmlFor="template" className="block text-sm font-medium text-gray-700">Template (JSX)</label>
							<AceEditor
								mode="jsx"
								theme="github"
								name="template-editor"
								value={formData.template}
								onChange={(value) => {
									setFormData({ ...formData, template: value });
									if (errors.template) {
										setErrors({ ...errors, template: null });
									}
								}}
								fontSize={14}
								width="100%"
								height="250px"
								showPrintMargin={false}
								showGutter={true}
								highlightActiveLine={true}
								setOptions={{
									enableBasicAutocompletion: true,
									enableLiveAutocompletion: true,
									enableSnippets: true,
									showLineNumbers: true,
									tabSize: 2,
								}}
								className={`mt-1 border border-gray-300 rounded-md ${errors.template ? 'border-red-500' : ''}`}
							/>
							{errors.template && <p className="mt-1 text-sm text-red-600">{errors.template}</p>}
							<p className="mt-1 text-xs text-gray-500">React component template (JSX)</p>
						</div>

						<div className="md:col-span-2">
							<div className="flex items-start">
								<div className="flex items-center h-5">
									<input
										id="is_active"
										name="is_active"
										type="checkbox"
										checked={formData.is_active}
										onChange={handleChange}
										className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
									/>
								</div>
								<div className="ml-3 text-sm">
									<label htmlFor="is_active" className="font-medium text-gray-700">Active</label>
									<p className="text-gray-500">Make this component available for use</p>
								</div>
							</div>
							{errors.is_active && <p className="mt-1 text-sm text-red-600">{errors.is_active}</p>}
						</div>
					</div>

					<div className="mt-6 flex justify-end">
						<button
							type="button"
							onClick={() => navigate('/admin/components')}
							className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							Cancel
						</button>
						<button
							type="submit"
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
								 'Save Component'
							 )}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default ComponentEditor;
