// src/pages/media/MediaLibrary.jsx
import React, {useState, useEffect} from 'react';
import PageHeader from '../../components/common/PageHeader';
import {FiUpload, FiFolder, FiTrash2, FiImage, FiSearch, FiEdit, FiEye, FiX, FiCheck, FiFile, FiMusic, FiVideo} from 'react-icons/fi';
import {getMedia, getMediaCollections, uploadMedia, deleteMediaItem, createMediaCollection, updateMediaItem} from '../../api/mediaApi.js';
import {showToast, handleApiError} from '../../api/apiClient';

const MediaLibrary = () => {
	const [mediaFiles, setMediaFiles] = useState([]);
	const [collections, setCollections] = useState([]);
	const [selectedCollection, setSelectedCollection] = useState('all');
	const [selectedFile, setSelectedFile] = useState(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [loading, setLoading] = useState(true);
	const [uploading, setUploading] = useState(false);
	const [showNewCollection, setShowNewCollection] = useState(false);
	const [newCollectionName, setNewCollectionName] = useState('');
	const [editingName, setEditingName] = useState('');
	const [isEditing, setIsEditing] = useState(false);
	const [refreshTrigger, setRefreshTrigger] = useState(0);

	// Filter types
	const [filterType, setFilterType] = useState('all');

	// Fetch data from API
	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				// Get collections
				const collectionsResponse = await getMediaCollections();
				const collectionsData = collectionsResponse.data;

				// Count media files per collection
				const collectionsWithCount = collectionsData.map(collection => ({
					...collection,
					count: 0 // Will be updated after we get media
				}));
				setCollections(collectionsWithCount);

				// Get media files
				const mediaParams = {};
				if (selectedCollection !== 'all') {
					mediaParams.collection = selectedCollection;
				}

				const mediaResponse = await getMedia(mediaParams);
				// Check if we have data.data (paginated response) or just data
				const mediaData = mediaResponse.data.data || mediaResponse.data;

				// Update collections with counts
				if (collectionsWithCount.length > 0) {
					const collectionCounts = {};
					mediaData.forEach(file => {
						if (file.collection_name) {
							collectionCounts[file.collection_name] = (collectionCounts[file.collection_name] || 0) + 1;
						}
					});

					const updatedCollections = collectionsWithCount.map(collection => ({
						...collection,
						count: collectionCounts[collection.slug] || 0
					}));

					setCollections(updatedCollections);
				}

				setMediaFiles(mediaData);
			}
			catch (error) {
				console.error('Error fetching data:', error);
				showToast('Error', 'Failed to load media library data', 'error');
			}
			finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [selectedCollection, refreshTrigger]);

	const handleFileUpload = (e) => {
		const files = Array.from(e.target.files);
		if (files.length === 0) return;

		setUploading(true);

		const uploadFiles = async () => {
			try {
				const formData = new FormData();

				// Handle single or multiple files
				if (files.length === 1) {
					formData.append('file', files[0]);
				} else {
					files.forEach(file => {
						formData.append('files[]', file);
					});
				}

				if (selectedCollection !== 'all') {
					formData.append('collection', selectedCollection);
				}

				const response = await uploadMedia(formData);

				// Refresh the media list
				setRefreshTrigger(prev => prev + 1);
				showToast('Success', 'Files uploaded successfully', 'success');
			}
			catch (error) {
				console.error('Error uploading files:', error);
				handleApiError(error);
			}
			finally {
				setUploading(false);
			}
		};

		uploadFiles();
	};

	const handleCreateCollection = async () => {
		if (!newCollectionName.trim()) return;

		try {
			const response = await createMediaCollection({
				name: newCollectionName,
				slug: newCollectionName.toLowerCase().replace(/\s+/g, '-')
			});

			const newCollection = response.data;
			setCollections([...collections, {...newCollection, count: 0}]);
			setNewCollectionName('');
			setShowNewCollection(false);
			showToast('Success', 'Collection created successfully', 'success');
		} catch (error) {
			console.error('Error creating collection:', error);
			handleApiError(error);
		}
	};

	const handleDeleteFile = async (id) => {
		if (window.confirm('Are you sure you want to delete this file?')) {
			try {
				await deleteMediaItem(id);
				setMediaFiles(mediaFiles.filter(file => file.id !== id));
				if (selectedFile && selectedFile.id === id) {
					setSelectedFile(null);
				}
				showToast('Success', 'File deleted successfully', 'success');
			} catch (error) {
				console.error('Error deleting file:', error);
				handleApiError(error);
			}
		}
	};

	const handleUpdateFileName = async () => {
		if (!editingName.trim() || !selectedFile) return;

		try {
			await updateMediaItem(selectedFile.id, { name: editingName });

			// Update the file in the state
			const updatedFiles = mediaFiles.map(file =>
				file.id === selectedFile.id
					? { ...file, name: editingName }
					: file
			);

			setMediaFiles(updatedFiles);
			setSelectedFile({ ...selectedFile, name: editingName });
			setIsEditing(false);
			showToast('Success', 'File updated successfully', 'success');
		} catch (error) {
			console.error('Error updating file:', error);
			handleApiError(error);
		}
	};

	const formatFileSize = (bytes) => {
		if (!bytes || bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	// Filter files based on selected collection, type, and search term
	const filteredFiles = mediaFiles.filter(file => {
		// Collection filter
		if (selectedCollection !== 'all' && file.collection_name !== selectedCollection) {
			return false;
		}

		// Type filter
		if (filterType !== 'all') {
			if (filterType === 'image' && !file.mime_type?.startsWith('image/')) {
				return false;
			}
			if (filterType === 'document' && !['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'].includes(file.mime_type)) {
				return false;
			}
			if (filterType === 'video' && !file.mime_type?.startsWith('video/')) {
				return false;
			}
			if (filterType === 'audio' && !file.mime_type?.startsWith('audio/')) {
				return false;
			}
		}

		// Search filter
		if (searchTerm) {
			return file.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				   file.file_name?.toLowerCase().includes(searchTerm.toLowerCase());
		}

		return true;
	});

	return (
		<div>
			<PageHeader
				title="Media Library"
				description="Manage your media files and collections"
			/>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-4">
				{/* Sidebar */}
				<div className="md:col-span-1">
					<div className="bg-white shadow rounded-lg p-4">
						{/* Upload button */}
						<div className="mb-4">
							<label className="block w-full">
								<span className="sr-only">Upload Files</span>
								<input
									type="file"
									multiple
									className="hidden"
									onChange={handleFileUpload}
									disabled={uploading}
								/>
								<button
									type="button"
									onClick={() => document.querySelector('input[type="file"]').click()}
									className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
									disabled={uploading}
								>
									{uploading ? (
										<>
											<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
												<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
												<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
											</svg>
											Uploading...
										</>
									) : (
										 <>
											 <FiUpload className="mr-2"/> Upload Files
										 </>
									 )}
								</button>
							</label>
						</div>

						{/* Collections */}
						<div className="mb-4">
							<div className="flex justify-between items-center mb-2">
								<h3 className="text-sm font-medium text-gray-700">Collections</h3>
								<button
									type="button"
									onClick={() => setShowNewCollection(true)}
									className="text-xs text-blue-600 hover:text-blue-500"
								>
									+ New
								</button>
							</div>

							{showNewCollection && (
								<div className="flex items-center mb-2">
									<input
										type="text"
										value={newCollectionName}
										onChange={(e) => setNewCollectionName(e.target.value)}
										placeholder="Collection name"
										className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
									/>
									<button
										type="button"
										onClick={handleCreateCollection}
										className="ml-2 inline-flex items-center p-1 border border-transparent rounded-md text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
									>
										<FiCheck className="h-5 w-5"/>
									</button>
									<button
										type="button"
										onClick={() => setShowNewCollection(false)}
										className="ml-1 inline-flex items-center p-1 border border-transparent rounded-md text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
									>
										<FiX className="h-5 w-5"/>
									</button>
								</div>
							)}

							<div className="space-y-1">
								<button
									type="button"
									onClick={() => setSelectedCollection('all')}
									className={`w-full flex justify-between items-center px-3 py-2 text-sm font-medium rounded-md ${
										selectedCollection === 'all'
										? 'bg-blue-50 text-blue-600'
										: 'text-gray-700 hover:bg-gray-50'
									}`}
								>
                  <span className="flex items-center">
                    <FiFolder className="mr-2"/> All Files
                  </span>
									<span className="text-xs text-gray-500">{mediaFiles.length}</span>
								</button>

								{collections.map((collection) => (
									<button
										key={collection.id}
										type="button"
										onClick={() => setSelectedCollection(collection.slug)}
										className={`w-full flex justify-between items-center px-3 py-2 text-sm font-medium rounded-md ${
											selectedCollection === collection.slug
											? 'bg-blue-50 text-blue-600'
											: 'text-gray-700 hover:bg-gray-50'
										}`}
									>
                    <span className="flex items-center">
                      <FiFolder className="mr-2"/> {collection.name}
                    </span>
										<span className="text-xs text-gray-500">{collection.count}</span>
									</button>
								))}
							</div>
						</div>

						{/* File types filter */}
						<div>
							<h3 className="text-sm font-medium text-gray-700 mb-2">File Types</h3>
							<div className="space-y-1">
								<button
									type="button"
									onClick={() => setFilterType('all')}
									className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${
										filterType === 'all'
										? 'bg-blue-50 text-blue-600'
										: 'text-gray-700 hover:bg-gray-50'
									}`}
								>
									All Types
								</button>
								<button
									type="button"
									onClick={() => setFilterType('image')}
									className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${
										filterType === 'image'
										? 'bg-blue-50 text-blue-600'
										: 'text-gray-700 hover:bg-gray-50'
									}`}
								>
									Images
								</button>
								<button
									type="button"
									onClick={() => setFilterType('document')}
									className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${
										filterType === 'document'
										? 'bg-blue-50 text-blue-600'
										: 'text-gray-700 hover:bg-gray-50'
									}`}
								>
									Documents
								</button>
								<button
									type="button"
									onClick={() => setFilterType('video')}
									className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${
										filterType === 'video'
										? 'bg-blue-50 text-blue-600'
										: 'text-gray-700 hover:bg-gray-50'
									}`}
								>
									Videos
								</button>
								<button
									type="button"
									onClick={() => setFilterType('audio')}
									className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${
										filterType === 'audio'
										? 'bg-blue-50 text-blue-600'
										: 'text-gray-700 hover:bg-gray-50'
									}`}
								>
									Audio
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* Main Content */}
				<div className="md:col-span-3">
					<div className="bg-white shadow rounded-lg overflow-hidden">
						{/* Search and filters */}
						<div className="p-4 border-b border-gray-200">
							<div className="flex">
								<div className="flex-1 min-w-0">
									<div className="relative rounded-md shadow-sm">
										<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<FiSearch className="h-5 w-5 text-gray-400"/>
										</div>
										<input
											type="text"
											className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
											placeholder="Search files..."
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
										/>
									</div>
								</div>
							</div>
						</div>

						{/* File grid */}
						<div className="p-4">
							{loading ? (
								<div className="flex justify-center items-center py-12">
									<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
								</div>
							) : filteredFiles.length === 0 ? (
								<div className="text-center py-12">
									<FiImage className="mx-auto h-12 w-12 text-gray-400"/>
									<h3 className="mt-2 text-sm font-medium text-gray-900">No files found</h3>
									<p className="mt-1 text-sm text-gray-500">
										{searchTerm ? 'Try adjusting your search or filters.' : 'Upload some files to get started.'}
									</p>
									<div className="mt-6">
										<button
											type="button"
											onClick={() => document.querySelector('input[type="file"]').click()}
											className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
										>
											<FiUpload className="-ml-1 mr-2 h-5 w-5"/>
											Upload Files
										</button>
									</div>
								</div>
							) : (
								    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
									    {filteredFiles.map((file) => (
										    <div
											    key={file.id}
											    className={`group border rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow ${
												    selectedFile && selectedFile.id === file.id ? 'ring-2 ring-blue-500' : ''
											    }`}
											    onClick={() => {
												    setSelectedFile(file);
												    setEditingName(file.name);
											    }}
										    >
											    <div className="aspect-w-1 aspect-h-1 bg-gray-200 group-hover:opacity-75">
												    {file.mime_type?.startsWith('image/') ? (
													    <img
														    src={file.url || file.thumbnail}
														    alt={file.name}
														    className="w-full h-full object-cover"
													    />
												    ) : file.mime_type?.startsWith('video/') ? (
													    <div className="w-full h-full flex items-center justify-center bg-gray-800">
														    <FiVideo className="h-12 w-12 text-white"/>
													    </div>
												    ) : file.mime_type?.startsWith('audio/') ? (
													    <div className="w-full h-full flex items-center justify-center bg-blue-50">
														    <FiMusic className="h-12 w-12 text-blue-500"/>
													    </div>
												    ) : (
													        <div className="w-full h-full flex items-center justify-center bg-gray-50">
														        <FiFile className="h-12 w-12 text-gray-400"/>
													        </div>
												        )}
											    </div>
											    <div className="p-2">
												    <h3 className="text-sm font-medium text-gray-900 truncate">{file.name}</h3>
												    <p className="text-xs text-gray-500 truncate">{file.file_name}</p>
											    </div>
											    <div className="p-2 pt-0 flex justify-between text-xs text-gray-500">
												    <span>{formatFileSize(file.size)}</span>
												    <button
													    type="button"
													    onClick={(e) => {
														    e.stopPropagation();
														    handleDeleteFile(file.id);
													    }}
													    className="text-red-600 hover:text-red-900"
												    >
													    <FiTrash2 className="h-4 w-4"/>
												    </button>
											    </div>
										    </div>
									    ))}
								    </div>
							    )}
						</div>
					</div>
				</div>
			</div>

			{/* File details sidebar */}
			{selectedFile && (
				<div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl overflow-y-auto z-10">
					<div className="p-4 flex justify-between items-center border-b border-gray-200">
						<h2 className="text-lg font-medium text-gray-900">File Details</h2>
						<button
							type="button"
							onClick={() => setSelectedFile(null)}
							className="text-gray-400 hover:text-gray-500"
						>
							<FiX className="h-6 w-6"/>
						</button>
					</div>

					<div className="p-4">
						<div className="aspect-w-1 aspect-h-1 bg-gray-200 mb-4">
							{selectedFile.mime_type?.startsWith('image/') ? (
								<img
									src={selectedFile.url || selectedFile.thumbnail}
									alt={selectedFile.name}
									className="w-full h-full object-cover"
								/>
							) : selectedFile.mime_type?.startsWith('video/') ? (
								<div className="w-full h-full flex items-center justify-center bg-gray-800">
									<FiVideo className="h-16 w-16 text-white"/>
								</div>
							) : selectedFile.mime_type?.startsWith('audio/') ? (
								<div className="w-full h-full flex items-center justify-center bg-blue-50">
									<FiMusic className="h-16 w-16 text-blue-500"/>
								</div>
							) : (
								    <div className="w-full h-full flex items-center justify-center bg-gray-50">
									    <FiFile className="h-16 w-16 text-gray-400"/>
								    </div>
							    )}
						</div>

						<dl className="space-y-4">
							<div>
								<dt className="text-sm font-medium text-gray-500">Name</dt>
								{isEditing ? (
									<div className="flex mt-1">
										<input
											type="text"
											value={editingName}
											onChange={(e) => setEditingName(e.target.value)}
											className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
										/>
										<button
											onClick={handleUpdateFileName}
											className="ml-2 inline-flex items-center p-1 border border-transparent rounded-md text-green-600 hover:bg-green-50 focus:outline-none"
										>
											<FiCheck className="h-5 w-5"/>
										</button>
										<button
											onClick={() => {
												setIsEditing(false);
												setEditingName(selectedFile.name);
											}}
											className="ml-1 inline-flex items-center p-1 border border-transparent rounded-md text-red-600 hover:bg-red-50 focus:outline-none"
										>
											<FiX className="h-5 w-5"/>
										</button>
									</div>
								) : (
									<div className="flex items-center mt-1">
										<dd className="text-sm text-gray-900 flex-grow">{selectedFile.name}</dd>
										<button
											onClick={() => setIsEditing(true)}
											className="ml-2 text-blue-600 hover:text-blue-800"
										>
											<FiEdit className="h-4 w-4"/>
										</button>
									</div>
								)}
							</div>

							<div>
								<dt className="text-sm font-medium text-gray-500">File Name</dt>
								<dd className="mt-1 text-sm text-gray-900">{selectedFile.file_name}</dd>
							</div>

							<div>
								<dt className="text-sm font-medium text-gray-500">Type</dt>
								<dd className="mt-1 text-sm text-gray-900">{selectedFile.mime_type}</dd>
							</div>

							<div>
								<dt className="text-sm font-medium text-gray-500">Size</dt>
								<dd className="mt-1 text-sm text-gray-900">{formatFileSize(selectedFile.size)}</dd>
							</div>

							<div>
								<dt className="text-sm font-medium text-gray-500">Collection</dt>
								<dd className="mt-1 text-sm text-gray-900">
									{collections.find(c => c.slug === selectedFile.collection_name)?.name || 'Default'}
								</dd>
							</div>

							<div>
								<dt className="text-sm font-medium text-gray-500">Uploaded</dt>
								<dd className="mt-1 text-sm text-gray-900">
									{new Date(selectedFile.created_at).toLocaleString()}
								</dd>
							</div>

							<div>
								<dt className="text-sm font-medium text-gray-500">URL</dt>
								<dd className="mt-1 text-sm text-gray-900 break-all">
									<a href={selectedFile.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500">
										{selectedFile.url}
									</a>
								</dd>
							</div>

							{selectedFile.mime_type?.startsWith('image/') && (
								<div>
									<dt className="text-sm font-medium text-gray-500">Thumbnail URL</dt>
									<dd className="mt-1 text-sm text-gray-900 break-all">
										<a href={selectedFile.thumbnail} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500">
											{selectedFile.thumbnail}
										</a>
									</dd>
								</div>
							)}
						</dl>

						<div className="mt-6 space-y-3">
							<button
								type="button"
								onClick={() => setIsEditing(true)}
								className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							>
								<FiEdit className="mr-2 h-4 w-4"/> Edit Details
							</button>

							<button
								type="button"
								onClick={() => handleDeleteFile(selectedFile.id)}
								className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
							>
								<FiTrash2 className="mr-2 h-4 w-4"/> Delete File
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default MediaLibrary;
