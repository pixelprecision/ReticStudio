// resources/js/admin/src/components/media/MediaChooser.jsx
import React, {useState, useEffect, useRef} from 'react';
import MediaBrowser from './MediaBrowser';

/**
 * MediaChooser - A reusable component for selecting media
 * Allows both uploading new files and selecting from existing media
 *
 * @param {Object} props
 * @param {string} props.value - Current value (file path)
 * @param {function} props.onChange - Called when media is selected or uploaded
 * @param {string} props.label - Field label
 * @param {string} props.accept - File types to accept (e.g. "image/*")
 * @param {boolean} props.required - Whether the field is required
 * @param {number} props.maxSize - Maximum file size in bytes
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.endpoint - Custom upload endpoint (optional)
 * @param {string} props.previewType - Type of preview ("image", "video", "audio", "file")
 * @param {string} props.className - Additional class names for the container
 * @param {string} props.fileParamName - Parameter name for the file in the FormData (default: 'file')
 */
const MediaChooser = ({
	                      value = '',
	                      onChange,
	                      sendBackWholeResponse = false,
	                      label = 'Select Media',
	                      accept = 'image/*',
	                      required = false,
	                      maxSize = 1024 * 1024 * 1024, // 1GB default
	                      placeholder = 'No file selected',
	                      endpoint = '/api/media',
	                      previewType = 'image',
	                      className = '',
	                      fileParamName = 'file',
                      }) => {
	const [file, setFile] = useState(null);
	const [preview, setPreview] = useState(value || '');
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [error, setError] = useState('');
	const [showMediaBrowser, setShowMediaBrowser] = useState(false);
	const [uploadSpeed, setUploadSpeed] = useState(0); // Upload speed in KB/s
	const [activePreviewType, setActivePreviewType] = useState(previewType); // Add state for previewType

	const fileInputRef = useRef(null);
	const xhrRef = useRef(null);

	// Update preview when value changes externally
	useEffect(() => {
		setPreview(value || '');
	}, [value]);

	// Update activePreviewType when previewType prop changes
	useEffect(() => {
		setActivePreviewType(previewType);
	}, [previewType]);

	// Clean up file object URL when component unmounts
	useEffect(() => {
		return () => {
			console.log(file);
			console.log(value);
			if (file && !value.includes(file.name)) {

				URL.revokeObjectURL(file);
			}
		};
	}, [file, value]);

	// Handle file input change
	const handleFileChange = (e) => {
		setError('');
		const selectedFile = e.target.files[0];

		if (!selectedFile) return;

		// Validate file size
		if (selectedFile.size > maxSize) {
			const maxSizeMB = maxSize / (1024 * 1024);
			const maxSizeDisplay = maxSizeMB >= 1000 ? `${maxSizeMB / 1024}GB` : `${maxSizeMB}MB`;
			setError(`File too large. Maximum size is ${maxSizeDisplay}`);
			return;
		}

		console.log('File selected:', selectedFile.name, selectedFile.type, selectedFile.size);

		// Detect file type and update activePreviewType
		if (selectedFile.type.startsWith('video/')) {
			setActivePreviewType('video');
		} else if (selectedFile.type.startsWith('image/')) {
			setActivePreviewType('image');
		} else if (selectedFile.type.startsWith('audio/')) {
			setActivePreviewType('audio');
		} else {
			setActivePreviewType('file');
		}

		// Create temporary preview URL for immediate feedback
		const previewUrl = URL.createObjectURL(selectedFile);
		setFile(selectedFile);
		setPreview(previewUrl);

		// Prepare to upload
		const formData = new FormData();
		formData.append(fileParamName, selectedFile);

		console.log('Preparing to upload with param name:', fileParamName);

		// Upload the file - this will ultimately call onChange with the server URL
		uploadFile(formData).then(() => {
			console.log('Upload successfully completed and parent should be updated');
		}).catch(err => {
			console.error('Upload process failed:', err);
		});
	};

	// Upload file to server
	const uploadFile = async (formData) => {
		// Check if formData has the file using the provided parameter name
		if (!formData.get(fileParamName)) {
			console.error(`No file found in FormData with parameter name: ${fileParamName}`);
			return Promise.reject(new Error(`No file found with parameter name: ${fileParamName}`));
		}

		setIsUploading(true);
		setUploadProgress(0);
		setUploadSpeed(0);

		try {
			console.log(`Starting upload to endpoint: ${endpoint}`);
			const xhr = new XMLHttpRequest();
			xhrRef.current = xhr; // Store reference for cancellation if needed

			// Variables for tracking upload speed
			let lastLoaded = 0;
			let lastTime = Date.now();

			// Progress tracking
			xhr.upload.addEventListener('progress', (event) => {
				if (event.lengthComputable) {
					const progress = Math.round((event.loaded / event.total) * 100);
					console.log(`Upload progress: ${progress}%`);
					setUploadProgress(progress);

					// Calculate and display upload speed
					const currentTime = Date.now();
					const elapsedTime = currentTime - lastTime;

					if (elapsedTime > 1000) { // Update speed every second
						const loadedSinceLastUpdate = event.loaded - lastLoaded;
						const speedKBps = Math.round((loadedSinceLastUpdate / elapsedTime) * 1000 / 1024);
						setUploadSpeed(speedKBps);

						lastLoaded = event.loaded;
						lastTime = currentTime;
					}
				}
			});

			// Set up promise for XHR
			const uploadPromise = new Promise((resolve, reject) => {
				xhr.open('POST', endpoint);

				// Include auth token if available
				const token = localStorage.getItem('token');
				if (token) {
					xhr.setRequestHeader('Authorization', `Bearer ${token}`);
				}

				// Set custom headers for large file upload
				xhr.setRequestHeader('X-File-Size', formData.get(fileParamName).size);

				// Don't set Content-Type header, let the browser set it with the correct boundary

				// Set longer timeout for large files
				xhr.timeout = 3600000; // 1 hour timeout for very large files

				xhr.ontimeout = () => {
					reject(new Error('Upload timed out. The file may be too large or the network connection is unstable.'));
				};

				xhr.onload = () => {
					console.log('Upload complete with status:', xhr.status, xhr.statusText);
					console.log('Response:', xhr.responseText);

					if (xhr.status >= 200 && xhr.status < 300) {
						try {
							const response = JSON.parse(xhr.responseText);

							// Check for API error responses
							if (response.success === false) {
								let errorMessage = 'Upload failed';

								if (response.message) {
									errorMessage = response.message;
								} else if (response.errors) {
									// Handle Laravel validation errors
									const firstError = Object.values(response.errors)[0];
									errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
								}

								reject(new Error(errorMessage));
							} else {
								resolve(response);
							}
						}
						catch (parseError) {
							console.error('Error parsing response:', parseError);
							reject(new Error('Invalid server response format'));
						}
					} else {
						// Get error message from response if possible
						let errorMessage = xhr.statusText || 'Upload failed';

						try {
							const errorResponse = JSON.parse(xhr.responseText);
							if (errorResponse.message) {
								errorMessage = errorResponse.message;
							} else if (errorResponse.errors) {
								const firstError = Object.values(errorResponse.errors)[0];
								errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
							}
						}
						catch (e) {
							// If we can't parse the error response, use the default message
						}

						reject(new Error(errorMessage));
					}
				};

				xhr.onerror = () => reject(new Error('Network error during upload'));
				xhr.send(formData);
			});

			// Wait for upload to complete
			const response = await uploadPromise;

			console.log('Upload response:', response);

			// Update with the server-provided media path - handle different response formats
			let mediaPath = null;

			// Enhanced logging for upload response
			console.log('Upload response full object:', JSON.stringify(response, null, 2));

			// Detect file type from response if available
			let detectedMimeType = null;
			if (response.mime_type) {
				detectedMimeType = response.mime_type;
			} else if (response.data && response.data.mime_type) {
				detectedMimeType = response.data.mime_type;
			}

			// Update preview type based on detected mime type
			if (detectedMimeType) {
				console.log('Detected mime type from response:', detectedMimeType);
				if (detectedMimeType.startsWith('video/')) {
					setActivePreviewType('video');
				} else if (detectedMimeType.startsWith('image/')) {
					setActivePreviewType('image');
				} else if (detectedMimeType.startsWith('audio/')) {
					setActivePreviewType('audio');
				} else {
					setActivePreviewType('file');
				}
			}

			// Check all possible response structures
			if (response) {
				if (response.url) {
					mediaPath = response.url;
					console.log('Found url in response root:', mediaPath);
				} else if (response.file_path) {
					mediaPath = response.file_path;
					console.log('Found file_path in response root:', mediaPath);
				} else if (response.path) {
					mediaPath = response.path;
					console.log('Found path in response root:', mediaPath);
				} else if (response.data) {
					// Log the data object for debugging
					console.log('Response has data property:', response.data);

					if (response.data.url) {
						mediaPath = response.data.url;
						console.log('Found url in response.data:', mediaPath);
					} else if (response.data.file_path) {
						mediaPath = response.data.file_path;
						console.log('Found file_path in response.data:', mediaPath);
					} else if (response.data.path) {
						mediaPath = response.data.path;
						console.log('Found path in response.data:', mediaPath);
					} else if (response.data.logo) {
						mediaPath = response.data.logo;
						console.log('Found logo in response.data:', mediaPath);
					} else if (response.data.logo_url) {
						mediaPath = response.data.logo_url;
						console.log('Found logo_url in response.data:', mediaPath);
					}
				} else if (response.logo) {
					mediaPath = response.logo;
					console.log('Found logo in response root:', mediaPath);
				} else if (response.logo_url) {
					mediaPath = response.logo_url;
					console.log('Found logo_url in response root:', mediaPath);
				}
			}

			if (mediaPath) {
				console.log('Found media path:', mediaPath);
				// Update local state
				setPreview(mediaPath);

				// Update parent component
				console.log('Calling onChange with media path:', mediaPath);
				if(sendBackWholeResponse) {
					onChange(response);
				} else {
					onChange(mediaPath);
				}

				// Additional logging to ensure onChange was called
				console.log('onChange called with path:', mediaPath);

				// Return the mediaPath for promise chaining
				return mediaPath;
			} else {
				console.warn('Could not extract media path from response:', response);

				// FALLBACK: If we couldn't extract path but have an ID, construct a path
				if (response.id) {
					const fallbackPath = `/storage/${response.id}/${response.file_name || 'file'}`;
					console.log('Using fallback path based on id:', fallbackPath);
					setPreview(fallbackPath);
					onChange(fallbackPath);
					return fallbackPath;
				} else if (response.data && response.data.id) {
					const fallbackPath = `/storage/${response.data.id}/${response.data.file_name || 'file'}`;
					console.log('Using fallback path based on data.id:', fallbackPath);
					setPreview(fallbackPath);
					onChange(fallbackPath);
					return fallbackPath;
				}

				// If we still can't get a path, reject the promise
				return Promise.reject(new Error('Could not determine media path from server response'));
			}
		}
		catch (err) {
			console.error('Upload error:', err);
			setError('Failed to upload file: ' + (err.message || 'Unknown error'));
			return Promise.reject(err);
		}
		finally {
			setIsUploading(false);
		}
	};

	// Trigger file input click
	const handleBrowseClick = () => {
		fileInputRef.current.click();
	};

	// Clear selected file
	const handleClearClick = () => {
		setFile(null);
		setPreview('');
		onChange('');
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	// Select from media library
	const handleMediaBrowserToggle = () => {
		setShowMediaBrowser(!showMediaBrowser);
	};

	// Handle selection from media browser
	const handleMediaSelected = (mediaItem) => {
		console.log('Media item selected:', mediaItem);

		if (!mediaItem) {
			console.error('No media item received from MediaBrowser');
			return;
		}

		// Extract the path - try different possible properties
		let mediaPath = null;

		// Detect media type from mime_type if available
		if (mediaItem.mime_type) {
			if (mediaItem.mime_type.startsWith('video/')) {
				// If this is a video, update the activePreviewType
				setActivePreviewType('video');
			} else if (mediaItem.mime_type.startsWith('image/')) {
				setActivePreviewType('image');
			} else if (mediaItem.mime_type.startsWith('audio/')) {
				setActivePreviewType('audio');
			} else {
				setActivePreviewType('file');
			}
		}

		if (mediaItem.path) {
			mediaPath = mediaItem.path;
		} else if (mediaItem.url) {
			mediaPath = mediaItem.url;
		} else if (mediaItem.file_path) {
			mediaPath = mediaItem.file_path;
		} else if (typeof mediaItem === 'string') {
			// Handle if we just got a string path
			mediaPath = mediaItem;
		}

		if (mediaPath) {
			console.log('Using media path:', mediaPath);
			setPreview(mediaPath);

			if(sendBackWholeResponse) {
				// Update the parent component with the URL
				onChange(mediaItem);
			} else {
				// Update the parent component with the URL
				onChange(mediaPath);
			}


			// Close the media browser
			setShowMediaBrowser(false);
		} else {
			console.error('Could not determine path from media item:', mediaItem);
			setError('Could not determine path from selected media');
		}
	};

	// Render preview based on type
	const renderPreview = () => {
		if (!preview) return null;

		// Handle different path formats
		let previewUrl;
		let thumbnailUrl = null;
		let mediaType = activePreviewType;

		// If this is a File object preview from local upload before server response
		if (file && preview.startsWith('blob:')) {
			previewUrl = preview;
			console.log('Using blob URL for preview:', previewUrl);
		}
		// Otherwise handle server paths
		else if (preview.startsWith('http')) {
			// Full URL
			previewUrl = preview;

			// Check if this is a media item with ID in the URL
			// Example: http://localhost/storage/3/video.mp4
			const mediaIdMatch = preview.match(/\/storage\/(\d+)\//);
			if (mediaIdMatch && mediaIdMatch[1]) {
				const mediaId = mediaIdMatch[1];
				const fileName = preview.split('/').pop();
				const fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;

				// Generate thumbnail URL based on MediaController logic
				if (mediaType === 'video') {
					thumbnailUrl = `/storage/${mediaId}/conversions/${fileNameWithoutExt}-thumbnail.jpg`;
				} else if (mediaType === 'image') {
					thumbnailUrl = `/storage/${mediaId}/conversions/${fileNameWithoutExt}-thumbnail.jpg`;
				}
			}
		} else if (preview.startsWith('/storage/')) {
			// Already has /storage/ prefix
			previewUrl = preview;

			// Check for media ID in the path
			const mediaIdMatch = preview.match(/\/storage\/(\d+)\//);
			if (mediaIdMatch && mediaIdMatch[1]) {
				const mediaId = mediaIdMatch[1];
				const fileName = preview.split('/').pop();
				const fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;

				// Generate thumbnail URL
				if (mediaType === 'video') {
					thumbnailUrl = `/storage/${mediaId}/conversions/${fileNameWithoutExt}-thumbnail.jpg`;
				} else if (mediaType === 'image') {
					thumbnailUrl = `/storage/${mediaId}/conversions/${fileNameWithoutExt}-thumbnail.jpg`;
				}
			}
		} else if (preview.startsWith('/')) {
			// Starts with slash but not /storage/
			previewUrl = preview;
		} else {
			// Relative path, add storage prefix
			previewUrl = `/storage/${preview}`;

			// Check for media ID in the path
			const parts = preview.split('/');
			if (parts.length >= 1 && !isNaN(parseInt(parts[0]))) {
				const mediaId = parts[0];
				const fileName = parts[parts.length - 1];
				const fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;

				// Generate thumbnail URL
				if (mediaType === 'video') {
					thumbnailUrl = `/storage/${mediaId}/conversions/${fileNameWithoutExt}-thumbnail.jpg`;
				} else if (mediaType === 'image') {
					thumbnailUrl = `/storage/${mediaId}/conversions/${fileNameWithoutExt}-thumbnail.jpg`;
				}
			}
		}

		console.log('Preview URL:', previewUrl);
		console.log('Thumbnail URL:', thumbnailUrl);
		console.log('Media Type:', mediaType);

		switch (mediaType) {
			case 'image':
				return (
					<div className="mt-2 relative">
						<img
							src={previewUrl}
							alt="Preview"
							className="object-cover rounded-md max-h-32 w-auto"
							onLoad={() => console.log('Image loaded successfully:', previewUrl)}
							onError={(e) => {
								console.error('Image failed to load:', previewUrl);
								e.target.onerror = null;
								e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmaWxsPSIjOTk5Ij5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';
							}}
						/>
					</div>
				);
			case 'video':
				return (
					<div className="mt-2">
						{thumbnailUrl && (
							<div className="relative mb-2">
								<img
									src={thumbnailUrl}
									alt="Video thumbnail"
									className="object-cover rounded-md w-full max-h-32"
									onError={(e) => {
										console.error('Video thumbnail failed to load:', thumbnailUrl);
										e.target.onerror = null;
										// Use video play icon as fallback
										e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNTAiIGZpbGw9IiM5OTkiIGZpbGwtb3BhY2l0eT0iMC41Ii8+PHBvbHlnb24gcG9pbnRzPSI4NSwgNzAgMTMwLCAxMDAgODUsIDEzMCIgZmlsbD0iI2ZmZiIvPjx0ZXh0IHg9IjUwJSIgeT0iMTYwIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmaWxsPSIjOTk5Ij5WaWRlbzwvdGV4dD48L3N2Zz4=';
									}}
								/>
								{/* Video play button overlay */}
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="w-12 h-12 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
										<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
											<path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
										</svg>
									</div>
								</div>
							</div>
						)}
						<video
							src={previewUrl}
							controls
							className="max-w-full h-auto rounded-md"
							onError={(e) => {
								console.error('Video failed to load:', previewUrl);
								e.target.onerror = null; // Prevent infinite loop
								// Replace with error message
								e.target.parentNode.innerHTML = '<div class="flex items-center justify-center h-32 bg-red-50 border border-red-200 rounded-md text-red-500">Video not available</div>';
							}}
						/>
					</div>
				);
			case 'audio':
				return (
					<div className="mt-2">
						<audio
							src={previewUrl}
							controls
							className="w-full"
							onError={(e) => {
								console.error('Audio failed to load:', previewUrl);
								e.target.onerror = null; // Prevent infinite loop
								// Replace with error message
								e.target.parentNode.innerHTML = '<div class="flex items-center justify-center h-12 bg-red-50 border border-red-200 rounded-md text-red-500">Audio not available</div>';
							}}
						/>
					</div>
				);
			default:
				return (
					<div className="mt-2 flex items-center text-sm text-gray-600 p-2 bg-gray-50 border border-gray-200 rounded-md">
						<svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
						</svg>
						<span className="truncate">{preview.split('/').pop()}</span>
					</div>
				);
		}
	};

	return (
		<div className={`media-chooser ${className}`}>
			{label && (
				<label className="block text-sm font-medium text-gray-700 mb-1">
					{label} {required && <span className="text-red-500">*</span>}
				</label>
			)}

			<div className="flex flex-col space-y-3">
				{/* Preview */}
				{preview && renderPreview()}

				{/* Progress bar */}
				{isUploading && (
					<div className="upload-progress">
						<div className="w-full bg-gray-200 rounded-full h-2.5">
							<div
								className="bg-blue-600 h-2.5 rounded-full"
								style={{ width: `${uploadProgress}%` }}
							></div>
						</div>
						<div className="flex justify-between text-xs text-gray-500 mt-1">
							<span>Uploading: {uploadProgress}%</span>
							{uploadSpeed > 0 && (
								<span>{uploadSpeed < 1024 ? `${uploadSpeed} KB/s` : `${(uploadSpeed / 1024).toFixed(1)} MB/s`}</span>
							)}
						</div>
						{uploadProgress > 0 && uploadProgress < 100 && (
							<button
								type="button"
								className="mt-1 text-xs text-red-600 hover:text-red-800"
								onClick={() => {
									if (xhrRef.current) {
										xhrRef.current.abort();
										setIsUploading(false);
										setError('Upload cancelled');
									}
								}}
							>
								Cancel Upload
							</button>
						)}
					</div>
				)}

				{/* Buttons */}
				<div className="flex flex-wrap gap-2">
					<button
						type="button"
						onClick={handleBrowseClick}
						className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
						disabled={isUploading}
					>
						{isUploading ? 'Uploading...' : 'Upload New'}
					</button>

					<button
						type="button"
						onClick={handleMediaBrowserToggle}
						className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
						disabled={isUploading}
					>
						Choose Existing
					</button>

					{preview && (
						<button
							type="button"
							onClick={handleClearClick}
							className="px-3 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
							disabled={isUploading}
						>
							Clear
						</button>
					)}
				</div>

				{/* Error message */}
				{error && (
					<div className="p-2 mt-2 bg-red-50 border border-red-200 rounded-md">
						<p className="text-sm text-red-600">{error}</p>
					</div>
				)}

				{/* Hidden file input */}
				<input
					type="file"
					ref={fileInputRef}
					onChange={handleFileChange}
					accept={accept}
					className="hidden"
					disabled={isUploading}
				/>
			</div>

			{/* Media browser modal */}
			{showMediaBrowser && (
				<div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
					<div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
						<div className="flex items-center justify-between px-4 py-3 border-b">
							<h3 className="text-lg font-medium">Select Media</h3>
							<button
								type="button"
								onClick={handleMediaBrowserToggle}
								className="text-gray-400 hover:text-gray-500 focus:outline-none"
							>
								<span className="sr-only">Close</span>
								<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
								</svg>
							</button>
						</div>

						<div className="flex-1 overflow-auto p-4">
							<MediaBrowser
								onSelect={handleMediaSelected}
								selectionMode="single"
								fileType={accept.split('/')[0]}
							/>
						</div>

						<div className="px-4 py-3 border-t flex justify-end">
							<button
								type="button"
								onClick={handleMediaBrowserToggle}
								className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default MediaChooser;
