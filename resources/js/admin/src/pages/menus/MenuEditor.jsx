// src/pages/menus/MenuEditor.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiPlus, FiArrowLeft, FiTrash2, FiEdit, FiLink, FiExternalLink, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { getMenu, createMenu, updateMenu } from '../../api/menusApi';

const MenuEditor = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const isNewMenu = id === 'create';

	const [menu, setMenu] = useState({
		                                 id: isNewMenu ? null : parseInt(id),
		                                 name: '',
		                                 location: 'header',
		                                 items: []
	                                 });

	const [loading, setLoading] = useState(!isNewMenu);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState(null);
	const [newItemForm, setNewItemForm] = useState({
		                                               label: '',
		                                               url: '',
		                                               target: '_self',
		                                               parent_id: null
	                                               });
	const [editingItemId, setEditingItemId] = useState(null);

	const locationOptions = [
		{ value: 'header', label: 'Header' },
		{ value: 'footer', label: 'Footer' },
		{ value: 'sidebar', label: 'Sidebar' },
		{ value: 'mobile', label: 'Mobile Navigation' }
	];

	useEffect(() => {
		if (!isNewMenu) {
			fetchMenu();
		}
	}, [id]);

	const fetchMenu = async () => {
		setLoading(true);
		setError(null);

		try {
			const response = await getMenu(id);
			setMenu(response.data);
		} catch (error) {
			console.error('Error fetching menu:', error);
			setError('Failed to load menu. Please try again later.');
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (e) => {
		const { name, value } = e.target;

		setMenu(prev => ({
			...prev,
			[name]: value
		}));
	};

	const handleNewItemChange = (e) => {
		const { name, value } = e.target;

		setNewItemForm(prev => ({
			...prev,
			[name]: value
		}));
	};

	const addMenuItem = () => {
		if (!newItemForm.label || !newItemForm.url) {
			alert('Please enter both title and URL for the menu item.');
			return;
		}

		const newItem = {
			id: Date.now(), // Temporary ID, will be replaced by server on save
			...newItemForm,
			order: menu.items.length
		};

		// If it has a parent, add it to the parent's children
		if (newItemForm.parent_id) {
			const updatedItems = menu.items.map(item => {
				if (item.id === newItemForm.parent_id) {
					return {
						...item,
						children: [...(item.children || []), newItem]
					};
				}
				return item;
			});

			setMenu(prev => ({
				...prev,
				items: updatedItems
			}));
		} else {
			// Add as a top-level item
			setMenu(prev => ({
				...prev,
				items: [...prev.items, newItem]
			}));
		}

		// Reset the form
		setNewItemForm({
			               label: '',
			               url: '',
			               target: '_self',
			               parent_id: null
		               });
	};

	const startEditingItem = (item) => {
		setEditingItemId(item.id);
	};

	const cancelEditingItem = () => {
		setEditingItemId(null);
	};

	const updateMenuItem = (id, updatedFields) => {
		// Find and update the item
		let updatedItems = [...menu.items];

		// Function to update an item in the array or in children
		const updateItemRecursively = (items, itemId, fields) => {
			return items.map(item => {
				if (item.id === itemId) {
					return { ...item, ...fields };
				}
				if (item.children && item.children.length) {
					return {
						...item,
						children: updateItemRecursively(item.children, itemId, fields)
					};
				}
				return item;
			});
		};

		updatedItems = updateItemRecursively(updatedItems, id, updatedFields);

		setMenu(prev => ({
			...prev,
			items: updatedItems
		}));

		// Exit edit mode
		setEditingItemId(null);
	};

	const removeMenuItem = (id) => {
		if (window.confirm('Are you sure you want to remove this menu item?')) {
			// Function to remove an item from the array or from children
			const removeItemRecursively = (items, itemId) => {
				// Filter out the item with the given ID
				const filteredItems = items.filter(item => item.id !== itemId);

				// Process children of remaining items
				return filteredItems.map(item => {
					if (item.children && item.children.length) {
						return {
							...item,
							children: removeItemRecursively(item.children, itemId)
						};
					}
					return item;
				});
			};

			const updatedItems = removeItemRecursively(menu.items, id);

			setMenu(prev => ({
				...prev,
				items: updatedItems
			}));
		}
	};

	const onDragEnd = (result) => {
		const { destination, source, draggableId } = result;

		// If there's no destination or the item is dropped in the same place
		if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
			return;
		}

		// Get a copy of the items
		let updatedItems = [...menu.items];
		const itemId = parseInt(draggableId.split('-')[1]);

		// Handle top-level reordering
		if (source.droppableId === 'menu-items' && destination.droppableId === 'menu-items') {
			const [removed] = updatedItems.splice(source.index, 1);
			updatedItems.splice(destination.index, 0, removed);

			// Update the order property
			updatedItems = updatedItems.map((item, index) => ({
				...item,
				order: index
			}));
		}
		// Handle child-level reordering or moving between levels
		else {
			// Implementation for nested drag and drop would go here
			// This is more complex and would require tracking the path to each item
		}

		setMenu(prev => ({
			...prev,
			items: updatedItems
		}));
	};

	const handleSave = async () => {
		if (!menu.name) {
			alert('Please enter a menu name.');
			return;
		}

		setSaving(true);
		setError(null);

		try {
			if (isNewMenu) {
				// Create new menu
				await createMenu(menu);
			} else {
				// Update existing menu
				await updateMenu(menu.id, menu);
			}

			// Success message
			alert(isNewMenu ? 'Menu created successfully!' : 'Menu updated successfully!');

			if (isNewMenu) {
				navigate('/admin/menus');
			}
		} catch (error) {
			console.error('Error saving menu:', error);
			setError('Failed to save menu. Please try again.');
		} finally {
			setSaving(false);
		}
	};

	// Render a menu item (recursively handles children)
	const renderMenuItem = (item, index, parentId = null) => {
		const isEditing = editingItemId === item.id;

		return (
			<Draggable key={`item-${item.id}`} draggableId={`item-${item.id}`} index={index}>
				{(provided) => (
					<div
						ref={provided.innerRef}
						{...provided.draggableProps}
						className={`border rounded-md mb-2 ${isEditing ? 'border-blue-500' : 'border-gray-200'}`}
					>
						{isEditing ? (
							// Edit form
							<div className="p-4">
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
										<input
											type="text"
											value={item.label}
											onChange={(e) => updateMenuItem(item.id, { label: e.target.value })}
											className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
										<input
											type="text"
											value={item.url}
											onChange={(e) => updateMenuItem(item.id, { url: e.target.value })}
											className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
										<select
											value={item.target}
											onChange={(e) => updateMenuItem(item.id, { target: e.target.value })}
											className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
										>
											<option value="_self">Same Window</option>
											<option value="_blank">New Window</option>
										</select>
									</div>
								</div>

								<div className="mt-4 flex justify-end space-x-2">
									<button
										onClick={cancelEditingItem}
										className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
									>
										Cancel
									</button>
									<button
										onClick={() => setEditingItemId(null)}
										className="px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
									>
										Save
									</button>
								</div>
							</div>
						) : (
							 // Display view
							 <div className="flex items-center p-3">
								 <div {...provided.dragHandleProps} className="mr-2 text-gray-400 cursor-move">
									 <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
										 <path d="M4 4H6V6H4V4ZM10 4H12V6H10V4ZM4 10H6V12H4V10ZM10 10H12V12H10V10Z" />
									 </svg>
								 </div>

								 <div className="flex-1">
									 <div className="font-medium">{item.label}</div>
									 <div className="text-xs text-gray-500 flex items-center">
										 <FiLink size={12} className="mr-1" />
										 {item.url}
										 {item.target === '_blank' && (
											 <FiExternalLink size={12} className="ml-1" />
										 )}
									 </div>
								 </div>

								 <div className="flex">
									 <button
										 onClick={() => startEditingItem(item)}
										 className="p-1 text-blue-600 hover:text-blue-900 mr-1"
										 title="Edit Menu Item"
									 >
										 <FiEdit size={16} />
									 </button>
									 <button
										 onClick={() => removeMenuItem(item.id)}
										 className="p-1 text-red-600 hover:text-red-900"
										 title="Remove Menu Item"
									 >
										 <FiTrash2 size={16} />
									 </button>
								 </div>
							 </div>
						 )}

						{/* Render children if any */}
						{item.children && item.children.length > 0 && (
							<div className="pl-6 pr-3 pb-3">
								<Droppable droppableId={`children-${item.id}`}>
									{(provided) => (
										<div ref={provided.innerRef} {...provided.droppableProps}>
											{item.children.map((child, childIndex) =>
												                   renderMenuItem(child, childIndex, item.id)
											)}
											{provided.placeholder}
										</div>
									)}
								</Droppable>
							</div>
						)}
					</div>
				)}
			</Draggable>
		);
	};

	return (
		<div>
			<PageHeader
				title={isNewMenu ? 'Create Menu' : 'Edit Menu'}
				description={isNewMenu ? 'Create a new navigation menu' : `Editing: ${menu.name}`}
				backButton={{ label: 'Back to Menus', link: '/admin/menus' }}
			/>

			{loading ? (
				<div className="flex justify-center items-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
				</div>
			) : error ? (
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6">
					{error}
				</div>
			) : (
				    <>
					    <div className="bg-white shadow rounded-lg mb-6">
						    <div className="p-6">
							    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								    <div>
									    <label className="block text-sm font-medium text-gray-700 mb-1">Menu Name</label>
									    <input
										    type="text"
										    name="name"
										    value={menu.name}
										    onChange={handleChange}
										    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
										    placeholder="Enter menu name"
									    />
								    </div>

								    <div>
									    <label className="block text-sm font-medium text-gray-700 mb-1">Menu Location</label>
									    <select
										    name="location"
										    value={menu.location}
										    onChange={handleChange}
										    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
									    >
										    {locationOptions.map(option => (
											    <option key={option.value} value={option.value}>
												    {option.label}
											    </option>
										    ))}
									    </select>
								    </div>
							    </div>
						    </div>
					    </div>

					    <div className="bg-white shadow rounded-lg">
						    <div className="px-6 py-4 border-b border-gray-200">
							    <h3 className="text-lg font-medium text-gray-900">Menu Items</h3>
						    </div>

						    <div className="p-6">
							    <div className="mb-6 border rounded-md p-4 bg-gray-50">
								    <h4 className="text-md font-medium text-gray-900 mb-3">Add New Menu Item</h4>
								    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
									    <div>
										    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
										    <input
											    type="text"
											    name="label"
											    value={newItemForm.label}
											    onChange={handleNewItemChange}
											    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
											    placeholder="Item title"
										    />
									    </div>

									    <div>
										    <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
										    <input
											    type="text"
											    name="url"
											    value={newItemForm.url}
											    onChange={handleNewItemChange}
											    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
											    placeholder="Item URL"
										    />
									    </div>

									    <div>
										    <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
										    <select
											    name="target"
											    value={newItemForm.target}
											    onChange={handleNewItemChange}
											    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
										    >
											    <option value="_self">Same Window</option>
											    <option value="_blank">New Window</option>
										    </select>
									    </div>
								    </div>

								    <div className="mt-4">
									    <label className="block text-sm font-medium text-gray-700 mb-1">Parent Item (Optional)</label>
									    <select
										    name="parent_id"
										    value={newItemForm.parent_id || ''}
										    onChange={(e) => setNewItemForm({
											                                    ...newItemForm,
											                                    parent_id: e.target.value ? parseInt(e.target.value) : null
										                                    })}
										    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
									    >
										    <option value="">Top Level</option>
										    {menu.items.map(item => (
											    <option key={item.id} value={item.id}>{item.label}</option>
										    ))}
									    </select>
								    </div>

								    <div className="mt-4">
									    <button
										    onClick={addMenuItem}
										    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
									    >
										    <FiPlus className="mr-2" />
										    Add Item
									    </button>
								    </div>
							    </div>

							    <div className="border rounded-md">
								    <DragDropContext onDragEnd={onDragEnd}>
									    <Droppable droppableId="menu-items">
										    {(provided) => (
											    <div
												    className="p-3"
												    ref={provided.innerRef}
												    {...provided.droppableProps}
											    >
												    {menu.items.length === 0 ? (
													    <div className="text-center py-6 text-gray-500">
														    No menu items yet. Add your first item above.
													    </div>
												    ) : (
													     menu.items.map((item, index) => renderMenuItem(item, index))
												     )}
												    {provided.placeholder}
											    </div>
										    )}
									    </Droppable>
								    </DragDropContext>
							    </div>
						    </div>

						    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between">
							    <button
								    onClick={() => navigate('/admin/menus')}
								    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
							    >
								    Cancel
							    </button>

							    <button
								    onClick={handleSave}
								    disabled={saving}
								    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							    >
								    {saving ? (
									    <>
										    <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-2 border-transparent border-t-white rounded-full"></div>
										    Saving...
									    </>
								    ) : (
									     <>
										     <FiSave className="mr-2" />
										     Save Menu
									     </>
								     )}
							    </button>
						    </div>
					    </div>
				    </>
			    )}
		</div>
	);
};

export default MenuEditor;
