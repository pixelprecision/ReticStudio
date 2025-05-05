// resources/js/admin/src/components/pageBuilder/ComponentSettings.jsx
import React, { useState, useEffect, useRef } from 'react';
import RichTextEditor from '../editors/RichTextEditor';
import MediaChooser from '../media/MediaChooser';

const ComponentSettings = ({ component, componentDefinition, onSave, onCancel }) => {
	// Parse schema if it's a string
	const schema = componentDefinition && componentDefinition.schema
		? (typeof componentDefinition.schema === 'string'
			? JSON.parse(componentDefinition.schema)
			: componentDefinition.schema)
		: null;

	// Initialize settings with existing props or defaults from schema
	const [settings, setSettings] = useState(() => {
		// Start with current component props
		const initialSettings = { ...component.props };

		// For any missing props that have defaults in the schema, add them
		if (schema && schema.properties) {
			Object.keys(schema.properties).forEach(key => {
				if (initialSettings[key] === undefined && schema.properties[key].default !== undefined) {
					// Handle arrays by parsing default if it's a string
					if (schema.properties[key].type === 'array' && typeof schema.properties[key].default === 'string') {
						try {
							initialSettings[key] = JSON.parse(schema.properties[key].default);
						} catch (e) {
							console.error('Error parsing default array value:', e);
							initialSettings[key] = [];
						}
					} else {
						initialSettings[key] = schema.properties[key].default;
					}
				}
				
				// Ensure arrays are properly initialized
				if (schema.properties[key].type === 'array') {
					// If it's already an array, make sure it's a deep copy to avoid references
					if (Array.isArray(initialSettings[key])) {
						initialSettings[key] = JSON.parse(JSON.stringify(initialSettings[key]));
					} 
					// If it's a JSON string, parse it
					else if (typeof initialSettings[key] === 'string' && initialSettings[key].startsWith('[')) {
						try {
							initialSettings[key] = JSON.parse(initialSettings[key]);
						} catch (e) {
							console.error('Error parsing array string:', e);
							initialSettings[key] = [];
						}
					} 
					// Otherwise initialize as empty array
					else if (!Array.isArray(initialSettings[key])) {
						initialSettings[key] = Array.isArray(schema.properties[key].default) 
							? JSON.parse(JSON.stringify(schema.properties[key].default))
							: [];
					}
				}
			});
		}

		// Log for debugging
		console.log('Initial settings:', initialSettings);
		return initialSettings;
	});
	
	// State for the array item being edited
	const [editingArrayField, setEditingArrayField] = useState(null);
	const [editingArrayItem, setEditingArrayItem] = useState(null);
	const [editingArrayIndex, setEditingArrayIndex] = useState(-1);

	// Track editor instances for each field
	const editorRefs = useRef({});

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setSettings(prev => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value
		}));
	};

	// Handle TinyMCE editor change
	const handleEditorChange = (name, content) => {
		setSettings(prev => ({
			...prev,
			[name]: content
		}));
	};

	const handleSubmit = (e) => {
		// Prevent default form submission which causes page reload
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}

		// Log before saving for debugging
		console.log('Saving component settings:', settings);

		// Make a copy of settings to ensure arrays and objects are properly handled
		const settingsCopy = JSON.parse(JSON.stringify(settings));
		
		// Make sure all arrays are properly handled
		if (schema && schema.properties) {
			Object.keys(schema.properties).forEach(key => {
				if (schema.properties[key].type === 'array') {
					// Ensure we have a valid array
					if (!Array.isArray(settingsCopy[key])) {
						if (typeof settingsCopy[key] === 'string') {
							try {
								settingsCopy[key] = JSON.parse(settingsCopy[key]);
							} catch (e) {
								console.error('Error parsing array string:', e);
								settingsCopy[key] = [];
							}
						} else {
							settingsCopy[key] = [];
						}
					}
				}
			});
		}
		
		onSave(settingsCopy);
	};
	
	// Function to start editing an array item
	const startEditingArrayItem = (fieldName, index) => {
		const arraySchema = schema.properties[fieldName];
		const items = settings[fieldName] || [];
		
		// If index is -1, we're adding a new item using the template
		const itemToEdit = index === -1 
			? (arraySchema.template ? { ...arraySchema.template } : {})
			: { ...items[index] };
			
		setEditingArrayField(fieldName);
		setEditingArrayItem(itemToEdit);
		setEditingArrayIndex(index);
	};
	
	// Function to save the array item being edited
	const saveArrayItem = () => {
		if (!editingArrayField || !editingArrayItem) return;
		
		setSettings(prev => {
			const updatedSettings = { ...prev };
			const items = [...(updatedSettings[editingArrayField] || [])];
			
			if (editingArrayIndex === -1) {
				// Adding a new item
				items.push(editingArrayItem);
			} else {
				// Updating an existing item
				items[editingArrayIndex] = editingArrayItem;
			}
			
			updatedSettings[editingArrayField] = items;
			return updatedSettings;
		});
		
		// Reset editing state
		cancelEditingArrayItem();
	};
	
	// Function to cancel editing an array item
	const cancelEditingArrayItem = () => {
		setEditingArrayField(null);
		setEditingArrayItem(null);
		setEditingArrayIndex(-1);
	};
	
	// Function to delete an array item
	const deleteArrayItem = (fieldName, index) => {
		setSettings(prev => {
			const updatedSettings = { ...prev };
			const items = [...(updatedSettings[fieldName] || [])];
			
			// Remove the item at the specified index
			items.splice(index, 1);
			
			updatedSettings[fieldName] = items;
			return updatedSettings;
		});
	};
	
	// Function to handle changes to array item fields
	const handleArrayItemChange = (name, value) => {
		if (!editingArrayItem) return;
		
		setEditingArrayItem(prev => ({
			...prev,
			[name]: value
		}));
	};

	const renderField = (key, schema) => {
		if (settings[key] === undefined) {
			return null; // Prevent rendering if key is not in settings
		}
		
		const value = settings[key];
		const type = schema.type || 'text';

		switch (type) {
			case 'text':
			case 'string':
				return (
					<input
						type="text"
						id={key}
						name={key}
						value={value || ''}
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
						value={value || ''}
						onChange={handleChange}
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
						placeholder={schema.placeholder || ''}
					></textarea>
				);
			case 'rich-text':
				// Ensure we have a valid value for the editor
				const safeValue = value !== null && value !== undefined ? value : '';
				
				// Try to decode any HTML entities if needed
				const contentToEdit = React.useMemo(() => {
					// If the content appears to be HTML with encoded entities
					if (typeof safeValue === 'string' && (safeValue.includes('&lt;') || safeValue.includes('&gt;'))) {
						try {
							// Create a textarea to decode HTML entities
							const textarea = document.createElement('textarea');
							textarea.innerHTML = safeValue;
							return textarea.value; // Returns decoded HTML
						} catch (error) {
							console.error('Error decoding HTML:', error);
							return safeValue;
						}
					}
					return safeValue;
				}, [safeValue]);

				return (
					<div className="rich-editor-container">
						<RichTextEditor
							value={contentToEdit}
							onChange={(content) => handleEditorChange(key, content)}
						/>
					</div>
				);
			case 'select':
				return (
					<select
						id={key}
						name={key}
						value={value || ''}
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
				// Determine the media type based on schema configuration or default to supporting all media types
				// Check all possible field configurations for media type
				const mediaType = schema.mediaType || 
				                 (schema.accept?.startsWith('video/') ? 'video' : 
				                 schema.accept?.startsWith('image/') ? 'image' : 
				                 'all');
				
				// Log the schema details for debugging
				console.log(`Media field ${key} schema:`, schema);
				
				const acceptValue = mediaType === 'image' ? 'image/*' : 
								    mediaType === 'video' ? 'video/*' : 
								    schema.accept || 'image/*,video/*,audio/*';
								    
				const previewTypeValue = mediaType === 'image' ? 'image' : 
									    mediaType === 'video' ? 'video' : 
									    // Extract type from accept value if present
									    schema.accept?.startsWith('video/') ? 'video' :
									    schema.accept?.startsWith('image/') ? 'image' :
									    schema.accept?.startsWith('audio/') ? 'audio' :
									    'image'; // Default to image preview

				// Determine the correct media type from the file extension if we have a value
				let detectedType = previewTypeValue;
				if (value && typeof value === 'string') {
					const fileExt = value.split('.').pop().toLowerCase();
					const videoExts = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv', 'flv', 'mkv'];
					const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
					
					if (videoExts.includes(fileExt)) {
						detectedType = 'video';
					} else if (imageExts.includes(fileExt)) {
						detectedType = 'image';
					}
				}

				console.log(`MediaChooser for ${key}: type=${detectedType}, value=${value}`);

				return (
					<div>
						<MediaChooser
							value={value || ''}
							onChange={(mediaUrl) => {
								console.log('Media selected for', key, ':', mediaUrl);
								setSettings(prev => ({
									...prev,
									[key]: mediaUrl
								}));
							}}
							label={false} // Hide label since we already have one from the parent
							accept={acceptValue}
							previewType={detectedType}
							placeholder={`No ${mediaType} selected`}
							endpoint="/api/media" // Ensure proper endpoint
							maxSize={1024 * 1024 * 1024} // 1GB max size
							fileParamName="file" // Make sure file parameter name is correct
						/>
					</div>
				);
			case 'array':
  // Fully functional array editor with item management
  return (
    <div className="bg-gray-50 p-3 rounded border border-gray-200">
      <p className="text-sm text-gray-600 mb-2">
        {schema.description || 'Edit array items:'}
      </p>
      <div className="text-sm text-gray-500">
        {Array.isArray(value) && value.length > 0 ? (
          <div>
            <p className="mb-2">{value.length} items in this collection</p>
            <div className="space-y-2 mb-3">
              {value.map((item, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center p-2 bg-white rounded border border-gray-200 hover:border-blue-200"
                >
                  <div className="flex-1 truncate">
                    {/* Display a preview of the item */}
                    <span className="font-medium">Item {index + 1}</span>
                    {item.title && <span className="ml-2 text-gray-600">- {item.title}</span>}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800"
                      onClick={() => startEditingArrayItem(key, index)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 text-xs text-red-600 hover:text-red-800"
                      onClick={() => deleteArrayItem(key, index)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="mb-3">No items yet. Add some items to this collection.</p>
        )}
        <button
          type="button"
          className="w-full px-3 py-2 text-sm font-medium border border-blue-200 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100"
          onClick={() => startEditingArrayItem(key, -1)}
        >
          Add New Item
        </button>
      </div>
    </div>
  );
			default:
				return (
					<input
						type="text"
						id={key}
						name={key}
						value={value || ''}
						onChange={handleChange}
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
					/>
				);
		}
	};

	if (!componentDefinition || !schema || !schema.properties) {
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
		<>
		<form onSubmit={handleSubmit} className="component-settings-form">
			<div className="max-h-[60vh] overflow-y-auto p-2">
				<div className="space-y-4">
					{Object.keys(schema.properties).map((key) => (
						<div key={key}>
							<label htmlFor={key} className="block text-sm font-medium text-gray-700">
								{schema.properties[key].label || key}
							</label>
							{renderField(key, schema.properties[key])}
							{schema.properties[key].description && (
								<p className="mt-1 text-xs text-gray-500">{schema.properties[key].description}</p>
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
					type="button"
					onClick={handleSubmit}
					className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
				>
					Save
				</button>
			</div>
		</form>
		
		{/* Array Item Editing Modal */}
		{editingArrayField && editingArrayItem && (
		  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
		    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
		      <div className="flex justify-between items-center border-b p-4">
		        <h3 className="text-lg font-medium">
		          {editingArrayIndex === -1 ? 'Add New Item' : 'Edit Item'}
		        </h3>
		        <button
		          type="button"
		          className="text-gray-400 hover:text-gray-500"
		          onClick={cancelEditingArrayItem}
		        >
		          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
		            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
		          </svg>
		        </button>
		      </div>
		      
		      <div className="p-4 overflow-y-auto max-h-[calc(90vh-130px)]">
		        {/* Render fields for the array item based on the schema template */}
		        {schema.properties[editingArrayField].template && (
		          <div className="space-y-4">
		            {Object.keys(schema.properties[editingArrayField].template).map(fieldKey => {
		              const fieldValue = editingArrayItem[fieldKey] !== undefined ? editingArrayItem[fieldKey] : '';
		              
		              // Determine field type based on the value or treat as text by default
		              const fieldType = Array.isArray(fieldValue) ? 'array' : 
		                        typeof fieldValue === 'boolean' ? 'checkbox' : 'text';
		              
		              if (fieldType === 'array') {
		                // For nested arrays (e.g., features array in pricing plans)
		                return (
		                  <div key={fieldKey} className="space-y-2">
		                    <label className="block text-sm font-medium text-gray-700">
		                      {fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1).replace(/([A-Z])/g, ' $1')}
		                    </label>
		                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
		                      {Array.isArray(fieldValue) && fieldValue.length > 0 ? (
		                        <div className="space-y-2">
		                          {fieldValue.map((item, idx) => (
		                            <div key={idx} className="flex items-center">
		                              <input
		                                type="text"
		                                value={item}
		                                onChange={(e) => {
		                                  const updatedArray = [...fieldValue];
		                                  updatedArray[idx] = e.target.value;
		                                  handleArrayItemChange(fieldKey, updatedArray);
		                                }}
		                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
		                              />
		                              <button
		                                type="button"
		                                className="ml-2 p-2 text-red-600 hover:text-red-800"
		                                onClick={() => {
		                                  const updatedArray = [...fieldValue];
		                                  updatedArray.splice(idx, 1);
		                                  handleArrayItemChange(fieldKey, updatedArray);
		                                }}
		                              >
		                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
		                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
		                                </svg>
		                              </button>
		                            </div>
		                          ))}
		                        </div>
		                      ) : (
		                        <p className="text-sm text-gray-500">No items in this list.</p>
		                      )}
		                      <button
		                        type="button"
		                        className="mt-2 w-full px-3 py-1 text-sm font-medium border border-gray-200 rounded-md bg-white hover:bg-gray-50"
		                        onClick={() => {
		                          const updatedArray = [...(fieldValue || []), ''];
		                          handleArrayItemChange(fieldKey, updatedArray);
		                        }}
		                      >
		                        Add Item
		                      </button>
		                    </div>
		                  </div>
		                );
		              } else if (fieldType === 'checkbox') {
		                return (
		                  <div key={fieldKey} className="flex items-center">
		                    <input
		                      type="checkbox"
		                      id={`item-${fieldKey}`}
		                      checked={!!fieldValue}
		                      onChange={(e) => handleArrayItemChange(fieldKey, e.target.checked)}
		                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
		                    />
		                    <label htmlFor={`item-${fieldKey}`} className="ml-2 block text-sm text-gray-700">
		                      {fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1).replace(/([A-Z])/g, ' $1')}
		                    </label>
		                  </div>
		                );
		              } else {
		                return (
		                  <div key={fieldKey}>
		                    <label htmlFor={`item-${fieldKey}`} className="block text-sm font-medium text-gray-700">
		                      {fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1).replace(/([A-Z])/g, ' $1')}
		                    </label>
		                    <input
		                      type="text"
		                      id={`item-${fieldKey}`}
		                      value={fieldValue}
		                      onChange={(e) => handleArrayItemChange(fieldKey, e.target.value)}
		                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
		                    />
		                  </div>
		                );
		              }
		            })}
		          </div>
		        )}
		      </div>
		      
		      <div className="border-t p-4 flex justify-end space-x-3">
		        <button
		          type="button"
		          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
		          onClick={cancelEditingArrayItem}
		        >
		          Cancel
		        </button>
		        <button
		          type="button"
		          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
		          onClick={saveArrayItem}
		        >
		          Save
		        </button>
		      </div>
		    </div>
		  </div>
		)}
		</>
	);
};

export default ComponentSettings;