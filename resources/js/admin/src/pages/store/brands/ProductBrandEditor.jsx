import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../../components/common/PageHeader';
import { storeApi } from '../../../api/storeApi';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Tabs from '../../../components/common/Tabs';
import RichTextEditor from '../../../components/editors/RichTextEditor';
import MediaChooser from '../../../components/media/MediaChooser';

const ProductBrandEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'create';
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [errors, setErrors] = useState({});
  const [brand, setBrand] = useState({
    name: '',
    slug: '',
    description: '',
    logo_id: null,
    website: '',
    featured: false,
    sort_order: 0,
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
  });
  
  useEffect(() => {
    if (!isNew) {
      const fetchBrand = async () => {
        try {
          const response = await storeApi.getBrand(id);
          setBrand(response.data);
        } catch (error) {
          console.error('Error fetching brand:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchBrand();
    }
  }, [id, isNew]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBrand({
      ...brand,
      [name]: type === 'checkbox' ? checked : value,
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handleDescriptionChange = (content) => {
    setBrand({
      ...brand,
      description: content,
    });
    
    if (errors.description) {
      setErrors({
        ...errors,
        description: null,
      });
    }
  };

  const handleLogoSelect = (mediaItem) => {
    setBrand({
      ...brand,
      logo_id: mediaItem ? mediaItem.id : null,
    });
  };

  const autoGenerateSlug = () => {
    if (brand.name && (!brand.slug || brand.slug === '')) {
      const slug = brand.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      setBrand({
        ...brand,
        slug,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!brand.name.trim()) {
      newErrors.name = 'Brand name is required';
    }
    
    if (!brand.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(brand.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }
    
    if (brand.website && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(brand.website)) {
      newErrors.website = 'Please enter a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    
    try {
      if (isNew) {
        await storeApi.createBrand(brand);
      } else {
        await storeApi.updateBrand(id, brand);
      }
      
      navigate('/admin/store/brands');
    } catch (error) {
      console.error('Error saving brand:', error);
      
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: 'Failed to save brand. Please try again.' });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'seo', label: 'SEO' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title={isNew ? 'Create Brand' : `Edit Brand: ${brand.name}`}
        backUrl="/admin/store/brands"
      />
      
      {errors.general && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errors.general}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg overflow-hidden">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        
        <div className="p-6">
          {activeTab === 'general' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={brand.name}
                    onChange={handleInputChange}
                    onBlur={autoGenerateSlug}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={brand.slug}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.slug ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.slug && (
                    <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
                  )}
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <RichTextEditor
                    initialContent={brand.description}
                    onChange={handleDescriptionChange}
                    height="200px"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={brand.website}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.website ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.website && (
                    <p className="mt-1 text-sm text-red-600">{errors.website}</p>
                  )}
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    name="sort_order"
                    value={brand.sort_order}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Lower numbers appear first
                  </p>
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand Logo
                  </label>
                  <MediaChooser
                    selectedMedia={brand.logo_id}
                    onSelect={handleLogoSelect}
                    className="w-full"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={brand.featured}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Featured Brand (display prominently in store)
                    </span>
                  </label>
                </div>
              </div>
            </>
          )}
          
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  name="meta_title"
                  value={brand.meta_title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  If left empty, the brand name will be used
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description
                </label>
                <textarea
                  name="meta_description"
                  value={brand.meta_description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Keywords
                </label>
                <input
                  type="text"
                  name="meta_keywords"
                  value={brand.meta_keywords}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Comma separated keywords
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="px-6 py-3 bg-gray-50 text-right">
          <button
            type="button"
            onClick={() => navigate('/admin/store/brands')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {saving ? 'Saving...' : isNew ? 'Create Brand' : 'Update Brand'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductBrandEditor;