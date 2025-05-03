// resources/js/admin/src/components/media/MediaBrowser.jsx
import React, { useState, useEffect } from 'react';
import { getMedia, uploadMedia, deleteMediaItem } from '../../api/mediaApi';
import { showToast } from '../../api/apiClient';
import { FiUpload, FiTrash2, FiX, FiSearch } from 'react-icons/fi';

/**
 * MediaBrowser component for browsing and selecting media files
 * 
 * @param {Object} props
 * @param {Function} props.onSelect - Callback when media is selected, receives selected item(s)
 * @param {Function} props.onClose - Callback when browser is closed (optional)
 * @param {boolean} props.multiple - Whether to allow multiple selections (default: false)
 * @param {Array} props.initialSelected - Initially selected items (default: [])
 * @param {string} props.selectionMode - 'single' or 'multiple' (default: based on multiple prop)
 * @param {string} props.fileType - Filter by file type (e.g. 'image', 'video', etc.)
 */
const MediaBrowser = ({ 
  onSelect, 
  onClose, 
  multiple = false, 
  initialSelected = [],
  selectionMode = null,
  fileType = null
}) => {
  // If selectionMode is provided, override multiple prop
  const isMultiple = selectionMode ? selectionMode === 'multiple' : multiple;
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState(initialSelected || []);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Create a safe wrapper for onClose to prevent errors
  const handleClose = () => {
    console.log('MediaBrowser - handleClose called');
    if (typeof onClose === 'function') {
      onClose();
    } else {
      console.warn('MediaBrowser - onClose not provided or not a function');
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const response = await getMedia();
      console.log('Media fetch response:', response);
      setMedia(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching media:', error);
      showToast('Error', 'Failed to fetch media', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);

    try {
      if (files.length === 1) {
        // Single file upload
        const formData = new FormData();
        formData.append('file', files[0]);
        await uploadMedia(formData);
      } else {
        // Multiple files upload
        const formData = new FormData();
        
        // Append each file to the 'files[]' array
        files.forEach(file => {
          formData.append('files[]', file);
        });
        
        await uploadMedia(formData);
      }
      
      // Refresh the media list
      fetchMedia();
      showToast('Success', 'Files uploaded successfully', 'success');
    } catch (error) {
      console.error('Error uploading files:', error);
      showToast('Error', 'Failed to upload one or more files', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSelect = (mediaItem) => {
    console.log('MediaBrowser - handleSelect called with:', mediaItem);
    if (isMultiple) {
      // For multiple selection mode
      if (selected.some(item => item.id === mediaItem.id)) {
        setSelected(selected.filter(item => item.id !== mediaItem.id));
      } else {
        setSelected([...selected, mediaItem]);
      }
    } else {
      // For single selection mode
      setSelected([mediaItem]);
    }
  };

  const handleConfirm = () => {
    console.log('MediaBrowser - confirming selection:', selected);
    console.log('MediaBrowser - isMultiple?', isMultiple);
    
    if (selected.length === 0) {
      console.error('No items selected in MediaBrowser');
      return;
    }
    
    // Get the item to send to the parent
    const dataToSend = isMultiple ? selected : selected[0];
    console.log('MediaBrowser - will send to parent:', dataToSend);
    
    // Call the parent's onSelect function with the selected items
    if (typeof onSelect === 'function') {
      onSelect(dataToSend);
    } else {
      console.error('MediaBrowser - onSelect is not a function:', onSelect);
    }
  };

  const handleDelete = async (mediaItem, e) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${mediaItem.name || mediaItem.file_name}"?`)) {
      return;
    }

    try {
      await deleteMediaItem(mediaItem.id);
      showToast('Success', 'Media item deleted successfully', 'success');
      setMedia(media.filter(item => item.id !== mediaItem.id));
      setSelected(selected.filter(item => item.id !== mediaItem.id));
    } catch (error) {
      console.error('Error deleting media item:', error);
      showToast('Error', 'Failed to delete media item', 'error');
    }
  };

  const filteredMedia = media.filter(item => {
    // Apply media type filter if provided in props
    if (fileType) {
      const type = fileType.toLowerCase();
      if (!item.mime_type || !item.mime_type.toLowerCase().startsWith(type)) {
        return false;
      }
    }
    
    // Apply type filter from dropdown
    if (filter !== 'all') {
      if (!item.mime_type || !item.mime_type.startsWith(filter)) {
        return false;
      }
    }

    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const fileName = (item.name || item.file_name || '').toLowerCase();
      return fileName.includes(searchLower);
    }

    return true;
  });

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Media Browser</h3>
        <button
          type="button"
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <FiX size={20} />
        </button>
      </div>

      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="media-search" className="sr-only">Search</label>
            <input
              type="text"
              id="media-search"
              placeholder="Search media..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="media-filter" className="sr-only">Filter</label>
            <select
              id="media-filter"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Media</option>
              <option value="image/">Images</option>
              <option value="video/">Videos</option>
              <option value="audio/">Audio</option>
              <option value="application/pdf">PDF</option>
              <option value="application/">Documents</option>
            </select>
          </div>

          <div>
            <label htmlFor="media-upload" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer">
              <FiUpload className="mr-2" />
              Upload
              <input
                type="file"
                id="media-upload"
                multiple
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="p-4">
          {filteredMedia.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No media found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredMedia.map(item => {
                const isSelected = selected.some(selectedItem => selectedItem.id === item.id);
                const isImage = item.mime_type && item.mime_type.startsWith('image/');

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={`relative border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${
                      isSelected ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <div className="aspect-w-1 aspect-h-1 bg-gray-200">
                      {isImage ? (
                        <img
                          src={item.url || item.thumbnail || '#'}
                          alt={item.name || item.file_name}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            console.error('Image failed to load:', item.url || item.thumbnail);
                            e.target.onerror = null;
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmaWxsPSIjOTk5Ij5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gray-100">
                          <div className="text-gray-400 text-4xl">
                            {item.mime_type?.includes('pdf') ? '📄' :
                              item.mime_type?.includes('word') ? '📝' :
                              item.mime_type?.includes('excel') ? '📊' :
                              item.mime_type?.includes('audio') ? '🎵' :
                              item.mime_type?.includes('video') ? '🎬' : '📁'}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs truncate">{item.name || item.file_name}</p>
                    </div>
                    <button
                      type="button"
                      className="absolute top-1 right-1 p-1 bg-white rounded-full text-red-500 hover:text-red-700 shadow"
                      onClick={(e) => handleDelete(item, e)}
                    >
                      <FiTrash2 size={16} />
                    </button>
                    {isSelected && (
                      <div className="absolute top-0 left-0 w-full h-full bg-blue-500 bg-opacity-20 flex items-center justify-center">
                        <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white">
                          ✓
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="px-4 py-3 bg-gray-50 flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {selected.length} {selected.length === 1 ? 'item' : 'items'} selected
        </span>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleClose}
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selected.length === 0}
            className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              selected.length === 0
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isMultiple ? 'Select Items' : 'Select Item'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaBrowser;