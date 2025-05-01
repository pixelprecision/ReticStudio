// resources/js/admin/src/components/forms/FormBuilder.jsx
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FiMove, FiPlus, FiSettings, FiTrash2, FiCopy } from 'react-icons/fi';
import { showToast } from '../../api/apiClient';

const FIELD_TYPES = [
	{ id: 'text', name: 'Text Input', icon: 'text' },
	{ id: 'textarea', name: 'Text Area', icon: 'textarea' },
	{ id: 'email', name: 'Email', icon: 'email' },
	{ id: 'number', name: 'Number', icon: 'number' },
	{ id: 'password', name: 'Password', icon: 'password' },
	{ id: 'select', name: 'Select Dropdown', icon: 'select' },
	{ id: 'checkbox', name: 'Checkbox', icon: 'checkbox' },
	{ id: 'radio', name: 'Radio Buttons', icon: 'radio' },
	{ id: 'file', name: 'File Upload', icon: 'file' },
	{ id: 'date', name: 'Date Picker', icon: 'date' },
	{ id: 'time', name: 'Time Picker', icon: 'time' },
	{ id: 'hidden', name: 'Hidden Field', icon: 'hidden' },
];

const FormBuilder = ({ value, onChange }) => {
	const [fields, setFields] = useState([]);
	const [activeField, setActiveField] = useState(null);
	const [showSettings, setShowSettings] = useState(false);

	useEffect(() => {
		if (value) {
			try {
				const parsedFields = Array.isArray(value) ? value : JSON.parse(value);
				setFields(parsedFields);
			} catch (error) {
				console.error('Error parsing form fields:', error);
				setFields([]);
			}
		} else {
			setFields([]);
		}
	}, [value]);

	const handleAddField = (fieldType) => {
		const newField = {
			name: `field_${Date.now()}`,
			type: fieldType.id,
			label: fieldType.name,
			placeholder: '',
			required: false,
			order: fields.length + 1,
			options: fieldType.id === 'select' || fieldType.id === 'radio' ? [
				{ label: 'Option 1', value: 'option_1' },
				{ label: 'Option 2', value: 'option_2' },
			] : undefined,
		};

		const updatedFields = [...fields, newField];
		setFields(updatedFields);

		if (onChange) {
			onChange(updatedFields);
		}
	};

	const handleRemoveField = (index) => {
		const updatedFields = [...fields];
		updatedFields.splice(index, 1);

		// Update order for remaining fields
		updatedFields.forEach((field, idx) => {
			field.order = idx + 1;
		});

		setFields(updatedFields);

		if (onChange) {
			onChange(updatedFields);
		}
	};

	const handleDuplicateField = (index) => {
		const fieldToDuplicate = fields[index];
		const duplicatedField = {
			...fieldToDuplicate,
			name: `${fieldToDuplicate.name}_copy_${Date.now()}`,
			order: fields.length + 1,
		};

		const updatedFields = [...fields];
		updatedFields.splice(index + 1, 0, duplicatedField);

		// Update order for all fields
		updatedFields.forEach((field, idx) => {
			field.order = idx + 1;
		});

		setFields(updatedFields);

		if (onChange) {
			onChange(updatedFields);
		}
	};

	const handleSettingsOpen = (field, index) => {
		setActiveField({ field, index });
		setShowSettings(true);
	};

	const handleSettingsClose = () => {
		setActiveField(null);
		setShowSettings(false);
	};

	const handleSettingsSave = (updatedField) => {
		const { index } = activeField;
		const updatedFields = [...fields];
		updatedFields[index] = updatedField;

		setFields(updatedFields);

		if (onChange) {
			onChange(updatedFields);
		}

		setShowSettings(false);
		setActiveField(null);
	};

	const handleDragEnd = (result) => {
		if (!result.destination) return;

		const items = Array.from(fields);
		const [reorderedItem] = items.splice(result.source.index, 1);
		items.splice(result.destination.index, 0, reorderedItem);

		// Update order for all fields
		items.forEach((field, idx) => {
			field.order = idx + 1;
		});

		setFields(items);

		if (onChange) {
			onChange(items);
		}
	};

	const renderFieldPreview = (field) => {
		switch (field.type) {
			case 'text':
			case 'email':
			case 'number':
			case 'password':
				return (
					<input
						type={field.type}
						placeholder={field.placeholder}
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
						disabled
					/>
				);
			case 'textarea':
				return (
					<textarea
						rows={3}
						placeholder={field.placeholder}
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
						disabled
					></textarea>
				);
			case 'select':
				return (
					<select
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
						disabled
					>
						{field.options && field.options.map((option, idx) => (
							<option key={idx} value={option.value}>{option.label}</option>
						))}
					</select>
				);
			case 'checkbox':
				return (
					<div className="mt-1">
						<input
							type="checkbox"
							className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
							disabled
						/>
						<span className="ml-2 text-gray-700">{field.placeholder || 'Checkbox label'}</span>
					</div>
				);
			case 'radio':
				return (
					<div className="mt-1 space-y-2">
						{field.options && field.options.map((option, idx) => (
							<div key={idx}>
								<input
									type="radio"
									className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
									disabled
								/>
								<span className="ml-2 text-gray-700">{option.label}</span>
							</div>
						))}
					</div>
				);
			case 'file':
				return (
					<input
						type="file"
						className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
						disabled
					/>
				);
			case 'date':
			case 'time':
				return (
					<input
						type={field.type}
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
						disabled
					/>
				);
			case 'hidden':
				return (
					<div className="mt-1 text-xs text-gray-500 italic">
						Hidden field (not visible to users)
					</div>
				);
			default:
				return (
					<input
						type="text"
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
						disabled
					/>
				);
		}
	};

	return (
		<div className="form-builder">
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
				<div className="lg:col-span-1 order-2 lg:order-1">
					<div className="bg-white p-4 rounded-lg shadow">
						<h4 className="font-medium mb-3">Field Types</h4>
						<div className="space-y-2">
							{FIELD_TYPES.map(fieldType => (
								<button
									key={fieldType.id}
									onClick={() => handleAddField(fieldType)}
									className="w-full flex items-center px-3 py-2 text-sm font-medium text-left text-gray-700 bg-gray-50 hover:bg-gray-100 rounded"
								>
									<FiPlus className="mr-2 text-gray-500" />
									{fieldType.name}
								</button>
							))}
						</div>
					</div>
				</div>

				<div className="lg:col-span-3 order-1 lg:order-2">
					<DragDropContext onDragEnd={handleDragEnd}>
						<Droppable droppableId="form-fields">
							{(provided) => (
								<div
									{...provided.droppableProps}
									ref={provided.innerRef}
									className="bg-white p-4 rounded-lg shadow min-h-[300px]"
								>
									{fields.length === 0 ? (
										<div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
											<p className="text-gray-500">Drag and drop fields here</p>
											<p className="text-sm text-gray-400 mt-2">Or select a field type from the sidebar</p>
										</div>
									) : (
										 fields.map((field, index) => (
											 <Draggable
												 key={`${field.name}-${index}`}
												 draggableId={`${field.name}-${index}`}
												 index={index}
											 >
												 {(provided) => (
													 <div
														 ref={provided.innerRef}
														 {...provided.draggableProps}
														 className="mb-4 rounded-lg border border-gray-200"
													 >
														 <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-t-lg border-b border-gray-200">
															 <div className="flex items-center">
                                <span {...provided.dragHandleProps}>
                                  <FiMove className="text-gray-400 mr-2 cursor-move" />
                                </span>
																 <span className="text-sm font-medium">
                                  {field.label} {field.required && <span className="text-red-500">*</span>}
                                </span>
															 </div>
															 <div className="flex space-x-2">
																 <button
																	 type="button"
																	 onClick={() => handleSettingsOpen(field, index)}
																	 className="text-gray-500 hover:text-gray-700"
																 >
																	 <FiSettings size={16} />
																 </button>
																 <button
																	 type="button"
																	 onClick={() => handleDuplicateField(index)}
																	 className="text-gray-500 hover:text-gray-700"
																 >
																	 <FiCopy size={16} />
																 </button>
																 <button
																	 type="button"
																	 onClick={() => handleRemoveField(index)}
																	 className="text-red-500 hover:text-red-700"
																 >
																	 <FiTrash2 size={16} />
																 </button>
															 </div>
														 </div>
														 <div className="p-4">
															 <label className="block text-sm font-medium text-gray-700">
																 {field.label} {field.required && <span className="text-red-500">*</span>}
															 </label>
															 {renderFieldPreview(field)}
														 </div>
													 </div>
												 )}
											 </Draggable>
										 ))
									 )}
									{provided.placeholder}
								</div>
							)}
						</Droppable>
					</DragDropContext>
				</div>
			</div>

			{/* Field Settings Modal */}
			{showSettings && activeField && (
				<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
					<div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-medium text-gray-900">
								Field Settings
							</h3>
							<button
								type="button"
								onClick={handleSettingsClose}
								className="text-gray-400 hover:text-gray-500"
							>
								<span className="sr-only">Close</span>
								<svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
						<FieldSettings
							field={activeField.field}
							onSave={handleSettingsSave}
							onCancel={handleSettingsClose}
						/>
					</div>
				</div>
			)}
		</div>
	);
};

// Field Settings component for the form builder
const FieldSettings = ({ field, onSave, onCancel }) => {
	const [settings, setSettings] = useState({ ...field });

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setSettings({
			            ...settings,
			            [name]: type === 'checkbox' ? checked : value
		            });
	};

	const handleOptionChange = (index, key, value) => {
		if (!settings.options) return;

		const updatedOptions = [...settings.options];
		updatedOptions[index] = {
			...updatedOptions[index],
			[key]: value
		};

		setSettings({
			            ...settings,
			            options: updatedOptions
		            });
	};

	const handleAddOption = () => {
		const newOption = {
			label: `Option ${settings.options.length + 1}`,
			value: `option_${settings.options.length + 1}`
		};

		setSettings({
			            ...settings,
			            options: [...settings.options, newOption]
		            });
	};

	const handleRemoveOption = (index) => {
		const updatedOptions = [...settings.options];
		updatedOptions.splice(index, 1);

		setSettings({
			            ...settings,
			            options: updatedOptions
		            });
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		onSave(settings);
	};

	return (
		<form onSubmit={handleSubmit}>
			<div className="space-y-4">
				<div>
					<label htmlFor="name" className="block text-sm font-medium text-gray-700">
						Field Name
					</label>
					<div className="mt-1">
						<input
							type="text"
							id="name"
							name="name"
							value={settings.name}
							onChange={handleChange}
							className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
							required
						/>
						<p className="mt-1 text-xs text-gray-500">
							This is used as the field identifier (no spaces or special characters).
						</p>
					</div>
				</div>

				<div>
					<label htmlFor="label" className="block text-sm font-medium text-gray-700">
						Field Label
					</label>
					<div className="mt-1">
						<input
							type="text"
							id="label"
							name="label"
							value={settings.label}
							onChange={handleChange}
							className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
							required
						/>
					</div>
				</div>

				{settings.type !== 'hidden' && (
					<div>
						<label htmlFor="placeholder" className="block text-sm font-medium text-gray-700">
							Placeholder Text
						</label>
						<div className="mt-1">
							<input
								type="text"
								id="placeholder"
								name="placeholder"
								value={settings.placeholder || ''}
								onChange={handleChange}
								className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
							/>
						</div>
					</div>
				)}

				{(settings.type === 'select' || settings.type === 'radio') && (
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Options
						</label>

						{settings.options && settings.options.map((option, index) => (
							<div key={index} className="flex items-center space-x-2 mb-2">
								<input
									type="text"
									value={option.label}
									onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
									placeholder="Label"
									className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
								/>
								<input
									type="text"
									value={option.value}
									onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
									placeholder="Value"
									className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
								/>
								<button
									type="button"
									onClick={() => handleRemoveOption(index)}
									className="text-red-500 hover:text-red-700"
								>
									<FiTrash2 size={16} />
								</button>
							</div>
						))}

						<button
							type="button"
							onClick={handleAddOption}
							className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							<FiPlus className="mr-1" /> Add Option
						</button>
					</div>
				)}

				{settings.type !== 'hidden' && (
					<div className="flex items-center">
						<input
							type="checkbox"
							id="required"
							name="required"
							checked={settings.required || false}
							onChange={handleChange}
							className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
						/>
						<label htmlFor="required" className="ml-2 block text-sm text-gray-900">
							Required field
						</label>
					</div>
				)}
			</div>

			<div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
				<button
					type="button"
					onClick={onCancel}
					className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
				>
					Cancel
				</button>
				<button
					type="submit"
					className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
				>
					Save
				</button>
			</div>
		</form>
	);
};

export default FormBuilder;
