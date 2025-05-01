// resources/js/admin/src/components/pageBuilder/ComponentSettings.jsx
import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ComponentSettings = ({ component, componentDefinition, onSave, onCancel }) => {
	const [settings, setSettings] = useState(component.props || {});

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setSettings(prev => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value
		}));
	};

	const handleQuillChange = (name, value) => {
		setSettings(prev => ({
			...prev,
			[name]: value
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		onSave(settings);
	};

	const renderField = (key, schema) => {
		const value = settings[key] || '';
		const type = schema.type || 'text';

		switch (type) {
			case 'text':
			case 'string':
				return (
					<input
						type="text"
						id={key}
						name={key}
						value={value}
						onChange={handleChange}
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
						placeholder={schema.placeholder || ''}
					/>
				);
			case 'textarea':
				return (
					<textarea
						id={key}
						name={key}
						rows={schema.rows || 3}
						value={value}
						onChange={handleChange}
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
						placeholder={schema.placeholder || ''}
					></textarea>
				);
			case 'rich-text':
				return (
					<ReactQuill
						theme="snow"
						value={value}
						onChange={(content) => handleQuillChange(key, content)}
						modules={{
							toolbar: [
								[{ 'header': [1, 2, 3, 4, 5, 6, false] }],
								['bold', 'italic', 'underline', 'strike', 'blockquote'],
								[{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
								['link', 'image'],
								['clean']
							],
						}}
					/>
				);
			case 'select':
				return (
					<select
						id={key}
						name={key}
						value={value}
						onChange={handleChange}
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
					>
						{schema.options && schema.options.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				);
			case 'boolean':
			case 'checkbox':
				return (
					<input
						type="checkbox"
						id={key}
						name={key}
						checked={!!value}
						onChange={handleChange}
						className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
					/>
				);
			case 'media':
				// In a real application, you would integrate with a media selector
				return (
					<div>
						<input
							type="text"
							id={key}
							name={key}
							value={value}
							onChange={handleChange}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
							placeholder="Media URL"
						/>
						<button
							type="button"
							className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							onClick={() => {
								// In a real application, this would open a media browser
								alert('Media browser would open here');
							}}
						>
							Browse Media
						</button>
					</div>
				);
			default:
				return (
					<input
						type="text"
						id={key}
						name={key}
						value={value}
						onChange={handleChange}
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
					/>
				);
		}
	};

	if (!componentDefinition || !componentDefinition.schema || !componentDefinition.schema.properties) {
		return (
			<div className="p-4">
				<p>No settings available for this component.</p>
				<div className="mt-4 flex justify-end">
					<button
						type="button"
						onClick={onCancel}
						className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
					>
						Cancel
					</button>
				</div>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit}>
			<div className="max-h-[60vh] overflow-y-auto p-2">
				<div className="space-y-4">
					{Object.keys(componentDefinition.schema.properties).map((key) => (
						<div key={key}>
							<label htmlFor={key} className="block text-sm font-medium text-gray-700">
								{componentDefinition.schema.properties[key].label || key}
							</label>
							{renderField(key, componentDefinition.schema.properties[key])}
							{componentDefinition.schema.properties[key].description && (
								<p className="mt-1 text-xs text-gray-500">{componentDefinition.schema.properties[key].description}</p>
							)}
						</div>
					))}
				</div>
			</div>
			<div className="mt-6 flex justify-end space-x-3">
				<button
					type="button"
					onClick={onCancel}
					className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
				>
					Cancel
				</button>
				<button
					type="submit"
					className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
				>
					Save
				</button>
			</div>
		</form>
	);
};

export default ComponentSettings;
