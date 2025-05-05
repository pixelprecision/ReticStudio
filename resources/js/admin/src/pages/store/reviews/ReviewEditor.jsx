import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { storeApi } from '../../../api/storeApi';
import PageHeader from '../../../components/common/PageHeader';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import RichTextEditor from '../../../components/editors/RichTextEditor';
import MediaChooser from '../../../components/media/MediaChooser';

const ReviewEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Products and customers for selection
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  
  // Review state
  const [review, setReview] = useState({
    product_id: '',
    customer_id: '',
    customer_name: '',
    customer_email: '',
    rating: 5,
    title: '',
    content: '',
    is_approved: false,
    is_verified_purchase: false,
    is_featured: false,
    images: []
  });
  
  // Fetch review data if editing
  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true);
      try {
        const [productsResponse, customersResponse] = await Promise.all([
          storeApi.getProducts({ per_page: 100 }),
          storeApi.getCustomers({ per_page: 100 })
        ]);
        
        setProducts(productsResponse.data.data);
        setCustomers(customersResponse.data.data);
      } catch (err) {
        console.error('Error fetching options:', err);
      } finally {
        setLoadingOptions(false);
      }
    };
    
    fetchOptions();
    
    if (isEditing) {
      const fetchReview = async () => {
        try {
          const response = await storeApi.getReview(id);
          setReview(response.data.data);
        } catch (err) {
          console.error('Error fetching review:', err);
          setError('Failed to load review data.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchReview();
    }
  }, [id, isEditing]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setReview(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle rich text editor changes
  const handleContentChange = (content) => {
    setReview(prev => ({
      ...prev,
      content
    }));
  };
  
  // Handle customer selection
  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    
    if (customerId) {
      const selectedCustomer = customers.find(c => c.id.toString() === customerId);
      if (selectedCustomer) {
        setReview(prev => ({
          ...prev,
          customer_id: customerId,
          customer_name: `${selectedCustomer.first_name} ${selectedCustomer.last_name}`,
          customer_email: selectedCustomer.email
        }));
      }
    } else {
      setReview(prev => ({
        ...prev,
        customer_id: '',
      }));
    }
  };
  
  // Handle media selection
  const handleMediaSelect = (media) => {
    setReview(prev => ({
      ...prev,
      images: [...prev.images, media]
    }));
  };
  
  // Remove image
  const handleRemoveImage = (index) => {
    setReview(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };
  
  // Save review
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage('');
    
    // Validate required fields
    if (!review.product_id) {
      setError('Product is required');
      setSaving(false);
      return;
    }
    
    if (!review.customer_id && (!review.customer_name || !review.customer_email)) {
      setError('Either select a customer or provide a name and email');
      setSaving(false);
      return;
    }
    
    try {
      // Format the data for submission
      const reviewData = {
        ...review,
        rating: parseInt(review.rating),
        images: review.images.map(img => img.id || img.path)
      };
      
      if (isEditing) {
        await storeApi.updateReview(id, reviewData);
        setSuccessMessage('Review updated successfully');
      } else {
        await storeApi.createReview(review.product_id, reviewData);
        setSuccessMessage('Review created successfully');
      }
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/admin/store/reviews');
      }, 1500);
    } catch (err) {
      console.error('Error saving review:', err);
      setError(err.response?.data?.message || 'Failed to save review');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title={isEditing ? 'Edit Review' : 'Add Review'}
        backUrl="/admin/store/reviews" 
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
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Selection */}
          <div>
            <label className="block mb-2 font-medium">Product</label>
            <select 
              name="product_id" 
              value={review.product_id} 
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
              required
            >
              <option value="">Select a product</option>
              {loadingOptions ? (
                <option value="" disabled>Loading products...</option>
              ) : (
                products.map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))
              )}
            </select>
          </div>
          
          {/* Rating */}
          <div>
            <label className="block mb-2 font-medium">Rating</label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReview(prev => ({ ...prev, rating: star }))}
                  className="focus:outline-none"
                >
                  <svg 
                    className={`h-8 w-8 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
              <span className="ml-2 self-center">{review.rating}/5</span>
            </div>
          </div>
          
          {/* Customer Information */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium">Customer</label>
                <select 
                  value={review.customer_id || ''} 
                  onChange={handleCustomerChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="">Guest / Manual Entry</option>
                  {loadingOptions ? (
                    <option value="" disabled>Loading customers...</option>
                  ) : (
                    customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.first_name} {customer.last_name} ({customer.email})
                      </option>
                    ))
                  )}
                </select>
              </div>
              
              {!review.customer_id && (
                <>
                  <div>
                    <label className="block mb-2 font-medium">Name</label>
                    <input 
                      type="text" 
                      name="customer_name" 
                      value={review.customer_name} 
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md p-2"
                      required={!review.customer_id}
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 font-medium">Email</label>
                    <input 
                      type="email" 
                      name="customer_email" 
                      value={review.customer_email} 
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md p-2"
                      required={!review.customer_id}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Review Content */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Review Content</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-medium">Review Title</label>
                <input 
                  type="text" 
                  name="title" 
                  value={review.title} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Review Content</label>
                <RichTextEditor
                  value={review.content}
                  onChange={handleContentChange}
                />
              </div>
            </div>
          </div>
          
          {/* Review Images */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Review Images</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-medium">Add Images</label>
                <MediaChooser
                  value=""
                  onChange={handleMediaSelect}
                  mediaType="image"
                  showSelectedItem={false}
                />
              </div>
              
              {review.images && review.images.length > 0 && (
                <div>
                  <label className="block mb-2 font-medium">Selected Images</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {review.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={image.url || `/storage/${image.path}`} 
                          alt={`Review image ${index + 1}`} 
                          className="w-full h-32 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Review Options */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Review Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="inline-flex items-center">
                  <input 
                    type="checkbox" 
                    name="is_approved" 
                    checked={review.is_approved} 
                    onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2">
                    Approved (visible to customers)
                  </span>
                </label>
              </div>
              
              <div>
                <label className="inline-flex items-center">
                  <input 
                    type="checkbox" 
                    name="is_verified_purchase" 
                    checked={review.is_verified_purchase} 
                    onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2">
                    Verified Purchase
                  </span>
                </label>
              </div>
              
              <div>
                <label className="inline-flex items-center">
                  <input 
                    type="checkbox" 
                    name="is_featured" 
                    checked={review.is_featured} 
                    onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2">
                    Featured Review
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-4">
          <button 
            type="button" 
            onClick={() => navigate('/admin/store/reviews')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewEditor;