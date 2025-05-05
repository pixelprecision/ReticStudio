import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storeApi } from '../../../api/storeApi';
import PageHeader from '../../../components/common/PageHeader';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

const ProductVideosManager = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [product, setProduct] = useState(null);
  const [videos, setVideos] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, videoId: null });
  
  // New video form state
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    type: 'youtube', // youtube, vimeo, upload
    youtube_id: '',
    vimeo_id: '',
    file: null,
    thumbnail: '',
    sort_order: 0
  });
  
  // Fetch product and videos data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Assuming an API endpoint to get product videos exists
        const [productResponse, videosResponse] = await Promise.all([
          storeApi.getProduct(id),
          storeApi.getProductVideos ? storeApi.getProductVideos(id) : Promise.resolve({ data: [] })
        ]);
        
        setProduct(productResponse.data);
        setVideos(videosResponse.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load product data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setNewVideo({
        ...newVideo,
        file: files[0]
      });
    } else {
      setNewVideo({
        ...newVideo,
        [name]: value
      });
    }
  };
  
  // Handle video type change
  const handleTypeChange = (type) => {
    setNewVideo({
      ...newVideo,
      type,
      youtube_id: '',
      vimeo_id: '',
      file: null
    });
  };
  
  // Handle opening the delete confirmation dialog
  const handleConfirmDelete = (videoId) => {
    setConfirmDelete({ isOpen: true, videoId });
  };
  
  // Handle deleting a video
  const handleDeleteVideo = async () => {
    try {
      // Assuming an API endpoint to delete product videos exists
      if (storeApi.deleteProductVideo) {
        await storeApi.deleteProductVideo(id, confirmDelete.videoId);
      }
      
      // Update local state to remove the deleted video
      setVideos(videos.filter(video => video.id !== confirmDelete.videoId));
      setSuccessMessage('Video deleted successfully');
      
      // Close the dialog
      setConfirmDelete({ isOpen: false, videoId: null });
    } catch (error) {
      console.error('Error deleting video:', error);
      setError('Failed to delete video');
      setConfirmDelete({ isOpen: false, videoId: null });
    }
  };
  
  // Add new video
  const handleAddVideo = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage('');
    
    try {
      let videoData;
      
      if (newVideo.type === 'youtube') {
        if (!newVideo.youtube_id) {
          throw new Error('YouTube video ID is required');
        }
        videoData = {
          title: newVideo.title,
          description: newVideo.description,
          type: 'youtube',
          video_id: newVideo.youtube_id,
          thumbnail: newVideo.thumbnail,
          sort_order: videos.length
        };
      } else if (newVideo.type === 'vimeo') {
        if (!newVideo.vimeo_id) {
          throw new Error('Vimeo video ID is required');
        }
        videoData = {
          title: newVideo.title,
          description: newVideo.description,
          type: 'vimeo',
          video_id: newVideo.vimeo_id,
          thumbnail: newVideo.thumbnail,
          sort_order: videos.length
        };
      } else if (newVideo.type === 'upload') {
        if (!newVideo.file) {
          throw new Error('Video file is required');
        }
        setUploading(true);
        
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('video', newVideo.file);
        formData.append('title', newVideo.title);
        formData.append('description', newVideo.description);
        formData.append('type', 'upload');
        formData.append('sort_order', videos.length);
        
        // Assuming an API endpoint to upload product videos exists
        if (storeApi.uploadProductVideo) {
          const response = await storeApi.uploadProductVideo(id, formData);
          const newVideoData = response.data;
          
          // Add the new video to the list
          setVideos([...videos, newVideoData]);
          
          // Reset form
          setNewVideo({
            title: '',
            description: '',
            type: 'youtube',
            youtube_id: '',
            vimeo_id: '',
            file: null,
            thumbnail: '',
            sort_order: videos.length + 1
          });
          
          setSuccessMessage('Video uploaded successfully');
          return;
        } else {
          throw new Error('Video upload not supported yet');
        }
      }
      
      // Assuming an API endpoint to add product videos exists
      if (storeApi.addProductVideo) {
        const response = await storeApi.addProductVideo(id, videoData);
        const newVideoData = response.data;
        
        // Add the new video to the list
        setVideos([...videos, newVideoData]);
        
        // Reset form
        setNewVideo({
          title: '',
          description: '',
          type: 'youtube',
          youtube_id: '',
          vimeo_id: '',
          file: null,
          thumbnail: '',
          sort_order: videos.length + 1
        });
        
        setSuccessMessage('Video added successfully');
      } else {
        throw new Error('Adding videos not supported yet');
      }
    } catch (error) {
      console.error('Error adding video:', error);
      setError(error.message || 'Failed to add video');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };
  
  // Helper to extract YouTube ID from URL
  const extractYouTubeId = () => {
    const url = newVideo.youtube_id;
    if (!url) return;
    
    // Try to extract YouTube ID from various URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      setNewVideo({
        ...newVideo,
        youtube_id: match[2]
      });
    }
  };
  
  // Helper to extract Vimeo ID from URL
  const extractVimeoId = () => {
    const url = newVideo.vimeo_id;
    if (!url) return;
    
    // Try to extract Vimeo ID from various URL formats
    const regExp = /(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i;
    const match = url.match(regExp);
    
    if (match && match[1]) {
      setNewVideo({
        ...newVideo,
        vimeo_id: match[1]
      });
    }
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title={`Manage Videos: ${product?.name}`}
        backUrl={`/admin/store/products/${id}`} 
      />
      
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}
      
      {/* Add Video Form */}
      <div className="bg-white p-6 rounded-md shadow-sm mb-6">
        <h3 className="text-lg font-medium mb-4">Add Video</h3>
        
        <form onSubmit={handleAddVideo}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block mb-2 font-medium">Video Type</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input 
                    type="radio" 
                    checked={newVideo.type === 'youtube'} 
                    onChange={() => handleTypeChange('youtube')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">YouTube</span>
                </label>
                <label className="inline-flex items-center">
                  <input 
                    type="radio" 
                    checked={newVideo.type === 'vimeo'} 
                    onChange={() => handleTypeChange('vimeo')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">Vimeo</span>
                </label>
                <label className="inline-flex items-center">
                  <input 
                    type="radio" 
                    checked={newVideo.type === 'upload'} 
                    onChange={() => handleTypeChange('upload')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">Upload Video</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block mb-2 font-medium">Title</label>
              <input 
                type="text" 
                name="title" 
                value={newVideo.title} 
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="Video title"
              />
            </div>
            
            <div>
              <label className="block mb-2 font-medium">Description</label>
              <textarea 
                name="description" 
                value={newVideo.description} 
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="Video description"
                rows="2"
              ></textarea>
            </div>
            
            {newVideo.type === 'youtube' && (
              <div className="col-span-2">
                <label className="block mb-2 font-medium">YouTube URL or ID</label>
                <div className="flex">
                  <input 
                    type="text" 
                    name="youtube_id" 
                    value={newVideo.youtube_id} 
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-l-md p-2"
                    placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or dQw4w9WgXcQ"
                    required={newVideo.type === 'youtube'}
                  />
                  <button 
                    type="button" 
                    onClick={extractYouTubeId}
                    className="bg-gray-200 text-gray-700 px-4 rounded-r-md"
                  >
                    Extract ID
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Enter the full YouTube URL or just the video ID
                </p>
                
                {newVideo.youtube_id && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Preview:</h4>
                    <div className="aspect-w-16 aspect-h-9">
                      <iframe 
                        src={`https://www.youtube.com/embed/${newVideo.youtube_id}`} 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                        className="w-full h-48"
                      ></iframe>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {newVideo.type === 'vimeo' && (
              <div className="col-span-2">
                <label className="block mb-2 font-medium">Vimeo URL or ID</label>
                <div className="flex">
                  <input 
                    type="text" 
                    name="vimeo_id" 
                    value={newVideo.vimeo_id} 
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-l-md p-2"
                    placeholder="e.g. https://vimeo.com/123456789 or 123456789"
                    required={newVideo.type === 'vimeo'}
                  />
                  <button 
                    type="button" 
                    onClick={extractVimeoId}
                    className="bg-gray-200 text-gray-700 px-4 rounded-r-md"
                  >
                    Extract ID
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Enter the full Vimeo URL or just the video ID
                </p>
                
                {newVideo.vimeo_id && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Preview:</h4>
                    <div className="aspect-w-16 aspect-h-9">
                      <iframe 
                        src={`https://player.vimeo.com/video/${newVideo.vimeo_id}`} 
                        frameBorder="0" 
                        allow="autoplay; fullscreen; picture-in-picture" 
                        allowFullScreen
                        className="w-full h-48"
                      ></iframe>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {newVideo.type === 'upload' && (
              <div className="col-span-2">
                <label className="block mb-2 font-medium">Upload Video File</label>
                <input 
                  type="file" 
                  name="file" 
                  onChange={handleChange}
                  accept="video/*"
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  required={newVideo.type === 'upload'}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Accepted formats: MP4, WebM, MOV (max size: 100MB)
                </p>
                
                {newVideo.file && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Selected file:</h4>
                    <p>{newVideo.file.name} ({Math.round(newVideo.file.size / 1024 / 1024 * 10) / 10} MB)</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end">
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
              disabled={saving || uploading}
            >
              {uploading ? 'Uploading...' : saving ? 'Saving...' : 'Add Video'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Videos List */}
      <div className="bg-white p-6 rounded-md shadow-sm mb-6">
        <h3 className="text-lg font-medium mb-4">Product Videos</h3>
        
        {videos.length === 0 ? (
          <p className="text-gray-600 italic">No videos have been added for this product yet.</p>
        ) : (
          <div className="space-y-6">
            {videos.map((video) => (
              <div key={video.id} className="border rounded-md p-4 grid grid-cols-1 md:grid-cols-6 gap-6 items-center">
                <div className="md:col-span-1">
                  {video.type === 'youtube' && (
                    <div className="aspect-w-16 aspect-h-9">
                      <img 
                        src={`https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`} 
                        alt={video.title} 
                        className="w-full h-24 object-cover"
                      />
                    </div>
                  )}
                  {video.type === 'vimeo' && (
                    video.thumbnail ? (
                      <img 
                        src={video.thumbnail} 
                        alt={video.title} 
                        className="w-full h-24 object-cover"
                      />
                    ) : (
                      <div className="bg-gray-200 w-full h-24 flex items-center justify-center">
                        <span>Vimeo</span>
                      </div>
                    )
                  )}
                  {video.type === 'upload' && (
                    video.thumbnail ? (
                      <img 
                        src={video.thumbnail} 
                        alt={video.title} 
                        className="w-full h-24 object-cover"
                      />
                    ) : (
                      <div className="bg-gray-200 w-full h-24 flex items-center justify-center">
                        <span>Video</span>
                      </div>
                    )
                  )}
                </div>
                
                <div className="md:col-span-3">
                  <h4 className="font-medium">{video.title || 'Untitled Video'}</h4>
                  {video.description && <p className="text-sm text-gray-600 mt-1">{video.description}</p>}
                  <p className="text-xs text-gray-500 mt-2">
                    Type: {video.type.charAt(0).toUpperCase() + video.type.slice(1)}
                    {video.type === 'youtube' && ` (ID: ${video.video_id})`}
                    {video.type === 'vimeo' && ` (ID: ${video.video_id})`}
                    {video.type === 'upload' && video.file_size && ` (${Math.round(video.file_size / 1024 / 1024 * 10) / 10} MB)`}
                  </p>
                </div>
                
                <div className="md:col-span-2 flex space-x-2 justify-end">
                  <button 
                    onClick={() => handleConfirmDelete(video.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-6 flex justify-end">
        <button 
          onClick={() => navigate(`/admin/store/products/${id}`)}
          className="px-6 py-2 bg-blue-600 text-white rounded-md"
        >
          Done
        </button>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Delete Video"
        message="Are you sure you want to delete this video? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteVideo}
        onCancel={() => setConfirmDelete({ isOpen: false, videoId: null })}
      />
    </div>
  );
};

export default ProductVideosManager;