// resources/js/admin/src/components/pageBuilder/PageBuilder.jsx
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { getComponents } from '../../api/componentsApi';
import { showToast } from '../../api/apiClient';
import { FiPlus, FiSettings, FiEye, FiTrash2, FiMove, FiCopy } from 'react-icons/fi';
import ComponentSettings from './ComponentSettings';

const PageBuilder = ({ value, onChange }) => {
	const [components, setComponents] = useState([]);
	const [loading, setLoading] = useState(true);
	const [pageComponents, setPageComponents] = useState([]);
	const [activeComponent, setActiveComponent] = useState(null);
	const [showSettings, setShowSettings] = useState(false);
	const [previewMode, setPreviewMode] = useState(false);

	useEffect(() => {
		fetchComponents();
	}, []);

	useEffect(() => {
		if (value) {
			try {
				const parsedComponents = Array.isArray(value) ? value : JSON.parse(value);
				setPageComponents(parsedComponents);
			} catch (error) {
				console.error('Error parsing page components:', error);
				setPageComponents([]);
			}
		} else {
			setPageComponents([]);
		}
	}, [value]);

	const fetchComponents = async () => {
		setLoading(true);
		try {
			const response = await getComponents({ is_active: true });
			setComponents(response.data.data || response.data);
		} catch (error) {
			console.error('Error fetching components:', error);
			showToast('Error', 'Failed to fetch components', 'error');
		} finally {
			setLoading(false);
		}
	};

	const handleAddComponent = (component) => {
		// Parse the schema if it's a string
		const schema = typeof component.schema === 'string' ? JSON.parse(component.schema) : component.schema;

		const newComponent = {
			id: `${component.slug}-${Date.now()}`,
			type: component.slug,
			props: schema && schema.properties ? Object.keys(schema.properties).reduce((acc, key) => {
				const prop = schema.properties[key];
				// Special handling for array types
				if (prop.type === 'array' && typeof prop.default === 'string') {
					try {
						acc[key] = JSON.parse(prop.default);
					} catch (e) {
						console.error('Error parsing default array value:', e);
						acc[key] = [];
					}
				} else {
					acc[key] = prop.default !== undefined ? prop.default : '';
				}
				return acc;
			}, {}) : {},
		};

		const updatedComponents = [...pageComponents, newComponent];
		setPageComponents(updatedComponents);

		if (onChange) {
			// Create a deep copy to ensure nested objects are properly handled
			onChange(JSON.parse(JSON.stringify(updatedComponents)));
		}
	};

	const handleRemoveComponent = (index) => {
		const updatedComponents = [...pageComponents];
		updatedComponents.splice(index, 1);
		setPageComponents(updatedComponents);

		if (onChange) {
			// Create a deep copy to ensure nested objects are properly handled
			onChange(JSON.parse(JSON.stringify(updatedComponents)));
		}
	};

	const handleDuplicateComponent = (index) => {
		const componentToDuplicate = pageComponents[index];
		const duplicatedComponent = {
			...componentToDuplicate,
			id: `${componentToDuplicate.type}-${Date.now()}`,
		};

		const updatedComponents = [...pageComponents];
		updatedComponents.splice(index + 1, 0, duplicatedComponent);
		setPageComponents(updatedComponents);

		if (onChange) {
			// Create a deep copy to ensure nested objects are properly handled
			onChange(JSON.parse(JSON.stringify(updatedComponents)));
		}
	};

	const handleSettingsOpen = (component, index, event) => {
		// Prevent any page reload or form submission
		if (event) {
			event.preventDefault();
			event.stopPropagation();
		}

		const componentDefinition = components.find(c => c.slug === component.type);

		// Log parsed component data for debugging
		if (componentDefinition && typeof componentDefinition.schema === 'string') {
			try {
				const parsedSchema = JSON.parse(componentDefinition.schema);
				console.log('Component Definition with parsed schema:', {
					...componentDefinition,
					schema: parsedSchema
				});
			} catch (error) {
				console.error('Error parsing schema:', error);
			}
		}

		setActiveComponent({ component, index });
		setShowSettings(true);
	};

	const handleSettingsClose = (event) => {
		// Prevent any page reload or form submission
		if (event) {
			event.preventDefault();
			event.stopPropagation();
		}

		setActiveComponent(null);
		setShowSettings(false);
	};

	const handleSettingsSave = (updatedProps) => {
		if (!activeComponent) {
			console.error('No active component found when saving settings');
			return;
		}

		const { index } = activeComponent;
		const updatedComponents = [...pageComponents];

		// Create a deep copy of the updated props
		const updatedPropsCopy = JSON.parse(JSON.stringify(updatedProps));

		// Update the component with the new props
		updatedComponents[index] = {
			...updatedComponents[index],
			props: updatedPropsCopy,
		};

		// Console log for debugging
		console.log('Saving updated component:', updatedComponents[index]);

		// Update the local state first
		setPageComponents(updatedComponents);

		// Then notify the parent component
		if (onChange) {
			// Pass a deep copy to ensure all nested objects are properly passed
			onChange(JSON.parse(JSON.stringify(updatedComponents)));
		}

		// Close the modal
		setShowSettings(false);
		setActiveComponent(null);
	};

	const handleDragEnd = (result) => {
		if (!result.destination) return;

		const items = Array.from(pageComponents);
		const [reorderedItem] = items.splice(result.source.index, 1);
		items.splice(result.destination.index, 0, reorderedItem);

		setPageComponents(items);

		if (onChange) {
			// Create a deep copy to ensure nested objects are properly handled
			onChange(JSON.parse(JSON.stringify(items)));
		}
	};

	const renderComponentPreview = (component) => {
		const componentDefinition = components.find(c => c.slug === component.type);

		if (!componentDefinition) {
			return (
				<div className="p-4 bg-red-50 border border-red-200 rounded">
					<p className="text-sm text-red-500">Component "{component.type}" not found</p>
				</div>
			);
		}

		// Get a preview of important properties to display
		const getPreviewContent = () => {
			// Try to render the most meaningful properties first
			if (component.props.title) {
				return (
					<div>
						<strong>{component.props.title}</strong>
						{component.props.subtitle && <div className="text-sm">{component.props.subtitle}</div>}
					</div>
				);
			} else if (component.props.text) {
				return <div>{component.props.text}</div>;
			} else if (component.props.content) {
				return <div dangerouslySetInnerHTML={{ __html: component.props.content }} />;
			} else {
				// Create a summary of props
				const propSummary = Object.entries(component.props)
					.filter(([key, value]) => value && typeof value !== 'object' && key !== 'alignment' && key !== 'style')
					.slice(0, 3)
					.map(([key, value]) => `${key}: ${value}`)
					.join(', ');

				return propSummary || 'Component preview';
			}
		};

		return (
			<div className="p-4 bg-gray-50 border border-gray-200 rounded">
				<h3 className="text-md font-medium">{componentDefinition.name}</h3>
				<div className="mt-2 text-sm text-gray-500">
					{getPreviewContent()}
				</div>
			</div>
		);
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-32">
				<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	return (
		<div className="page-builder">
			<div className="flex justify-between items-center mb-4">
				<h3 className="text-lg font-medium text-gray-900">Page Builder</h3>
				<div className="flex space-x-2">
					<button
						type="button"
						onClick={() => setPreviewMode(!previewMode)}
						className={`px-3 py-1 text-sm font-medium rounded-md ${previewMode ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}
					>
						<FiEye className="inline-block mr-1" />
						{previewMode ? 'Exit Preview' : 'Preview'}
					</button>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
				{!previewMode && (
					<div className="lg:col-span-1 order-2 lg:order-1">
						<div className="bg-white p-4 rounded-lg shadow">
							<h4 className="font-medium mb-3">Available Components</h4>
							<div className="space-y-2">
								{components.map(component => (
									<button
										key={component.id}
										onClick={() => handleAddComponent(component)}
										className="w-full flex items-center px-3 py-2 text-sm font-medium text-left text-gray-700 bg-gray-50 hover:bg-gray-100 rounded"
									>
										<FiPlus className="mr-2 text-gray-500" />
										{component.name}
									</button>
								))}
							</div>
						</div>
					</div>
				)}

				<div className={`${previewMode ? 'lg:col-span-4' : 'lg:col-span-3'} order-1 lg:order-2`}>
					<DragDropContext onDragEnd={handleDragEnd}>
						<Droppable droppableId="page-components">
							{(provided) => (
								<div
									{...provided.droppableProps}
									ref={provided.innerRef}
									className={`bg-white p-4 rounded-lg shadow min-h-[300px] ${previewMode ? 'preview-mode' : ''}`}
								>
									{pageComponents.length === 0 ? (
										<div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
											<p className="text-gray-500">Drag and drop components here</p>
											<p className="text-sm text-gray-400 mt-2">Or select a component from the sidebar</p>
										</div>
									) : (
										 pageComponents.map((component, index) => (
											 <Draggable
												 key={component.id}
												 draggableId={component.id}
												 index={index}
												 isDragDisabled={previewMode}
											 >
												 {(provided) => (
													 <div
														 ref={provided.innerRef}
														 {...provided.draggableProps}
														 className={`mb-4 rounded-lg ${!previewMode && 'border border-gray-200'}`}
													 >
														 {!previewMode && (
															 <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-t-lg border-b border-gray-200">
																 <div className="flex items-center">
									                              <span {...provided.dragHandleProps}>
									                                <FiMove className="text-gray-400 mr-2 cursor-move" />
									                              </span>
																	 <span className="text-sm font-medium">
									                                {components.find(c => c.slug === component.type)?.name || component.type}
									                              </span>
																 </div>
																 <div className="flex space-x-2">
																	 <button
																		 type="button"
																		 onClick={(e) => handleSettingsOpen(component, index, e)}
																		 className="text-gray-500 hover:text-gray-700"
																	 >
																		 <FiSettings size={16} />
																	 </button>
																	 <button
																		 type="button"
																		 onClick={() => handleDuplicateComponent(index)}
																		 className="text-gray-500 hover:text-gray-700"
																	 >
																		 <FiCopy size={16} />
																	 </button>
																	 <button
																		 type="button"
																		 onClick={() => handleRemoveComponent(index)}
																		 className="text-red-500 hover:text-red-700"
																	 >
																		 <FiTrash2 size={16} />
																	 </button>
																 </div>
															 </div>
														 )}
														 <div className={!previewMode && 'p-4'}>
															 {renderComponentPreview(component)}
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

			{/* Component Settings Modal */}
			{showSettings && activeComponent && (
				<div
					className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
					onClick={(e) => {
						// Only close if clicking the background overlay, not the modal itself
						if (e.target === e.currentTarget) {
							handleSettingsClose(e);
						}
					}}
				>
					<div
						className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white"
						onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
					>
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-medium text-gray-900">
								{components.find(c => c.slug === activeComponent.component.type)?.name || 'Component'} Settings
							</h3>
							<button
								type="button"
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									handleSettingsClose(e);
								}}
								className="text-gray-400 hover:text-gray-500"
							>
								<span className="sr-only">Close</span>
								<svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
						<ComponentSettings
							component={activeComponent.component}
							componentDefinition={components.find(c => c.slug === activeComponent.component.type)}
							onSave={handleSettingsSave}
							onCancel={handleSettingsClose}
						/>
					</div>
				</div>
			)}
		</div>
	);
};

export default PageBuilder;
