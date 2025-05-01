

// src/pages/components/ComponentEditor.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';

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
			// Mock data fetch - replace with API call in production
			const mockComponent = {
				id: parseInt(id),
				name: 'Hero Banner',
				slug: 'hero-banner',
				description: 'A hero banner component with customizable background and text.',
				category: 'content',
				icon: 'banner',
				schema: JSON.stringify({
					                       properties: {
						                       title: { type: 'text', label: 'Title', default: 'Welcome' },
						                       subtitle: { type: 'text', label: 'Subtitle', default: 'Learn more about our services' },
						                       background_image: { type: 'media', label: 'Background Image' },
						                       text_color: { type: 'select', label: 'Text Color', options: [
								                       { value: 'white', label: 'White' },
								                       { value: 'black', label: 'Black' }
							                       ], default: 'white' }
					                       }
				                       }, null, 2),
				template: '<div className="hero" style={{ backgroundImage: `url(${props.background_image})` }}>\n  <h1 className={`text-${props.text_color}`}>{props.title}</h1>\n  <h2 className={`text-${props.text_color}`}>{props.subtitle}</h2>\n</div>',
				is_active: true,
			};

			setFormData(mockComponent);
			setLoading(false);

			// Actual API implementation would be:
			// const fetchComponent = async () => {
			//   setLoading(true);
			//   try {
			//     const response = await fetch(`/api/components/${id}`);
			//     const data = await response.json();
			//     setFormData(data);
			//   } catch (error) {
			//     console.error('Error fetching component:', error);
			//   } finally {
			//     setLoading(false);
			//   }
			// };
			// fetchComponent();
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

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSaving(true);

		// Basic validation
		const newErrors = {};
		if (!formData.name) newErrors.name = 'Name is required';
		if (!formData.slug) newErrors.slug = 'Slug is required';
		if (!formData.category) newErrors.category = 'Category is required';

		try {
			// Validate JSON schema
			JSON.parse(formData.schema);
		} catch (error) {
			newErrors.schema = 'Invalid JSON schema';
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			setSaving(false);
			return;
		}

		// Mock successful save - replace with API call in production
		setTimeout(() => {
			setSaving(false);
			navigate('/admin/components');
		}, 800);

		// Actual API implementation would be:
		// try {
		//   const url = isEditing ? `/api/components/${id}` : '/api/components';
		//   const method = isEditing ? 'PUT' : 'POST';
		//
		//   const response = await fetch(url, {
		//     method,
		//     headers: { 'Content-Type': 'application/json' },
		//     body: JSON.stringify(formData)
		//   });
		//
		//   if (response.ok) {
		//     navigate('/admin/components');
		//   } else {
		//     const data = await response.json();
		//     setErrors(data.errors || {});
		//   }
		// } catch (error) {
		//   console.error('Error saving component:', error);
		// } finally {
		//   setSaving(false);
		// }
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
								className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
							/>
							<p className="mt-1 text-xs text-gray-500">Icon identifier (e.g., 'banner', 'gallery')</p>
						</div>

						<div className="md:col-span-2">
							<label htmlFor="schema" className="block text-sm font-medium text-gray-700">Schema (JSON)</label>
							<textarea
								id="schema"
								name="schema"
								rows="10"
								value={formData.schema}
								onChange={handleChange}
								className={`mt-1 font-mono text-sm focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm border-gray-300 rounded-md ${errors.schema ? 'border-red-500' : ''}`}
								required
							></textarea>
							{errors.schema && <p className="mt-1 text-sm text-red-600">{errors.schema}</p>}
							<p className="mt-1 text-xs text-gray-500">Define component properties in JSON format</p>
						</div>

						<div className="md:col-span-2">
							<label htmlFor="template" className="block text-sm font-medium text-gray-700">Template (JSX)</label>
							<textarea
								id="template"
								name="template"
								rows="10"
								value={formData.template}
								onChange={handleChange}
								className="mt-1 font-mono text-sm focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm border-gray-300 rounded-md"
								required
							></textarea>
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
