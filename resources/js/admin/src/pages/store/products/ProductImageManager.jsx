import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageHeader from '../../../components/common/PageHeader';
import MediaChooser from '../../../components/media/MediaChooser';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const ProductImageManager = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    imageId: null
  });
  
  // Fetch product and images
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productResponse, imagesResponse] = await Promise.all([
          axios.get(`/api/products/${id}`),
          axios.get(`/api/products/${id}/images`)
        ]);
        
        setProduct(productResponse.data.data);
        setImages(imagesResponse.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load product information');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  // Upload a new image
  const handleImageUpload = async (file) => {
    setUploading(true);
    setError(null);
    setSuccessMessage('');
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('alt_text', product.name);
    
    try {
      const response = await axios.post(`/api/products/${id}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Add the new image to the list
      setImages(prevImages => [...prevImages, response.data.data]);
      setSuccessMessage('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };
  
  // Open delete confirmation dialog
  const confirmDeleteImage = (imageId) => {
    setDeleteDialog({
      isOpen: true,
      imageId
    });
  };
  
  // Delete image
  const deleteImage = async () => {
    try {
      await axios.delete(`/api/products/${id}/images/${deleteDialog.imageId}`);
      
      // Remove the deleted image from the list
      setImages(prevImages => prevImages.filter(image => image.id !== deleteDialog.imageId));
      
      setDeleteDialog({
        isOpen: false,
        imageId: null
      });
      
      setSuccessMessage('Image deleted successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
      setError('Failed to delete image');
      
      setDeleteDialog({
        isOpen: false,
        imageId: null
      });
    }
  };
  
  // Set primary image
  const setPrimaryImage = async (imageId) => {
    try {
      const updatedImages = images.map(image => ({
        ...image,
        is_primary: image.id === imageId
      }));
      
      // Update the image list right away for a snappy UI feel
      setImages(updatedImages);
      
      // Update on the server
      await axios.put(`/api/products/${id}/images/${imageId}`, {
        is_primary: true
      });
      
      setSuccessMessage('Primary image updated');
    } catch (error) {
      console.error('Error setting primary image:', error);
      setError('Failed to update primary image');
      
      // Reload images to ensure correctness
      const response = await axios.get(`/api/products/${id}/images`);
      setImages(response.data.data);
    }
  };
  
  // Update image alt text
  const updateImageAltText = async (imageId, altText) => {
    try {
      await axios.put(`/api/products/${id}/images/${imageId}`, {
        alt_text: altText
      });
      
      // Update the local state
      setImages(prevImages => prevImages.map(image => 
        image.id === imageId ? { ...image, alt_text: altText } : image
      ));
      
      setSuccessMessage('Image updated successfully');
    } catch (error) {
      console.error('Error updating image:', error);
      setError('Failed to update image');
    }
  };
  
  // Reorder images
  const moveImage = (imageId, direction) => {
    const currentIndex = images.findIndex(image => image.id === imageId);
    if (
      (direction === 'up' && currentIndex === 0) || 
      (direction === 'down' && currentIndex === images.length - 1)
    ) {
      return; // Can't move further
    }
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newImages = [...images];
    const temp = newImages[currentIndex];
    newImages[currentIndex] = newImages[newIndex];
    newImages[newIndex] = temp;
    
    // Update sort_order values
    const updatedImages = newImages.map((image, index) => ({
      ...image,
      sort_order: index
    }));
    
    setImages(updatedImages);
    
    // TODO: Send batch update to server to save the new order
    // This would normally be done with a specific API endpoint
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title={`Manage Images: ${product?.name}`}
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
      
      {/* Upload New Image */}
      <div className="bg-white p-6 rounded-md shadow-sm mb-6">
        <h3 className="text-lg font-medium mb-4">Upload New Image</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files[0])}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <p className="mt-2 text-sm text-gray-500">
              Upload product images. The first image will be the primary image unless you specify otherwise.
            </p>
          </div>
        </div>
      </div>
      
      {/* Image Gallery */}
      <div className="bg-white p-6 rounded-md shadow-sm mb-6">
        <h3 className="text-lg font-medium mb-4">Product Images</h3>
        
        {images.length === 0 ? (
          <p className="text-gray-600 italic">No images have been uploaded for this product yet.</p>
        ) : (
          <div className="space-y-6">
            {images.map((image, index) => (
              <div key={image.id} className="border rounded-md p-4 grid grid-cols-1 md:grid-cols-6 gap-6 items-center">
                <div className="md:col-span-1">
                  <img 
                    src={`/storage/${image.path}`} 
                    alt={image.alt_text || product.name} 
                    className="w-full h-32 object-contain"
                  />
                </div>
                
                <div className="md:col-span-3">
                  <div className="mb-2">
                    <label className="block text-sm font-medium mb-1">Alt Text</label>
                    <input 
                      type="text" 
                      value={image.alt_text || ''}
                      onChange={(e) => updateImageAltText(image.id, e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-2"
                      placeholder="Describe the image for accessibility"
                    />
                  </div>
                  
                  <div className="flex items-center mt-4">
                    <label className="inline-flex items-center cursor-pointer">
                      <input 
                        type="radio" 
                        checked={image.is_primary} 
                        onChange={() => setPrimaryImage(image.id)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm font-medium">Primary Image</span>
                    </label>
                  </div>
                </div>
                
                <div className="md:col-span-2 flex space-x-2 justify-end">
                  <button 
                    onClick={() => moveImage(image.id, 'up')}
                    disabled={index === 0}
                    className={`px-3 py-1 rounded-md ${
                      index === 0 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    ↑
                  </button>
                  
                  <button 
                    onClick={() => moveImage(image.id, 'down')}
                    disabled={index === images.length - 1}
                    className={`px-3 py-1 rounded-md ${
                      index === images.length - 1 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    ↓
                  </button>
                  
                  <button 
                    onClick={() => confirmDeleteImage(image.id)}
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
        isOpen={deleteDialog.isOpen}
        title="Delete Image"
        message="Are you sure you want to delete this image? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={deleteImage}
        onCancel={() => setDeleteDialog({ isOpen: false, imageId: null })}
      />
    </div>
  );
};

export default ProductImageManager;