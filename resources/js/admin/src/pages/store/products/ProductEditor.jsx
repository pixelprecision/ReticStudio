import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { storeApi } from '../../../api/storeApi';
import PageHeader from '../../../components/common/PageHeader';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import RichTextEditor from '../../../components/editors/RichTextEditor';
import MediaChooser from '../../../components/media/MediaChooser';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const ProductEditor = ({ isViewOnly = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Product state
  const [product, setProduct] = useState({
    name: '',
    slug: '',
    description: '',
    brand_id: '',
    product_type: 'physical',
    sku: '',
    barcode: '',
    default_price: '',
    cost: '',
    msrp: '',
    sale_price: '',
    weight: '',
    width: '',
    height: '',
    depth: '',
    free_shipping: false,
    fixed_shipping_price: '',
    origin_location: '',
    dimension_rules: '',
    availability: 'available',
    stock_status: 'in_stock',
    bin_picking_number: '',
    warranty_information: '',
    template_page: 'default',
    search_keywords: '',
    is_visible: true,
    is_featured: false,
    gift_wrapping: 'all',
    sort_order: 0,
    condition: 'new',
    min_purchase_qty: 1,
    max_purchase_qty: '',
    seo_object_type: 'product',
    seo_title: '',
    seo_description: '',
    seo_image: '',
    track_inventory: true,
    inventory_level: 0,
    inventory_warning_level: 5,
    categories: [],
    // For specifications
    specifications: [],
    // For images
    images: []
  });

  // State for handling images
  const [productImages, setProductImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Options for select fields
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  // Fetch product data if editing
  useEffect(() => {
    // Fetch brands
    storeApi.getBrands()
      .then(response => {
        setBrands(response.data.data.data);
      })
      .catch(error => {
        console.error('Error fetching brands:', error);
      });

    // Fetch categories
    storeApi.getCategories()
      .then(response => {
        setCategories(response.data.data.data);
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
      });

    // Fetch product data if editing
    if (isEditing) {
      storeApi.getProduct(id)
        .then(response => {
          const productData = response.data.data;

          // Convert category IDs to array
          const categoryIds = productData.categories?.map(cat => cat.id) || [];

          // Format the product data
          setProduct({
            ...productData,
            categories: categoryIds,
            specifications: productData.specifications || [],
            images: productData.images || []
          });

          // Set product images separately
          if (productData.images) {
            setProductImages(productData.images);
          }

          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching product:', error);
          setError('Failed to load product data');
          setLoading(false);
        });
    }
  }, [id, isEditing]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct(prevProduct => ({
      ...prevProduct,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle rich text editor changes
  const handleRichTextChange = (content) => {
    setProduct(prevProduct => ({
      ...prevProduct,
      description: content
    }));
  };

  // Handle media selection for fields like SEO image
  const handleMediaSelect = (field, media) => {
    setProduct(prevProduct => ({
      ...prevProduct,
      [field]: media.path
    }));
  };

  // Handle product image upload
  const handleProductImageUpload = (mediaResponse) => {
    console.log('Media Response:', mediaResponse);

    // Handle the case when the entire media response is passed back
    if (mediaResponse && typeof mediaResponse === 'object') {
      if (!isEditing) {
        // If we're creating a new product, store the media data temporarily
        // The relationship will be created after the product is saved
          // This is a selected media from the library
          const newImage = {
            temp_id: Date.now(),
            media_id: mediaResponse.id,
            image_id: mediaResponse.id,
            url: mediaResponse.url || `/storage/${mediaResponse.id}/${mediaResponse.file_name}`,
            thumbnail_url: mediaResponse.thumbnail,
            is_featured: productImages.length === 0,
            alt_text: mediaResponse.alt_text || mediaResponse.name || '',
            sort_order: productImages.length
          };

          setProductImages(prev => [...prev, newImage]);

        return;
      }

      // If we're editing an existing product, create the relationship immediately
      setUploadingImage(true);
      setError('');

      // If the media has already been uploaded (from media browser), create relationship
      if (mediaResponse.id) {
        // Create a product image record with the media_id
        // Format the data to match the expected format of the attachMedia endpoint
        const productImageData = {
          media_id: mediaResponse.id, // Changed from image_id to media_id to match the controller parameter
          alt_text: mediaResponse.alt_text || mediaResponse.name || '', // Changed from alt to alt_text to match controller parameter
          is_featured: productImages.length === 0,
          sort_order: productImages.length,
          url: mediaResponse.url,
          thumbnail_url: mediaResponse.thumbnail,
        };

        // Create the product image relationship using the existing images endpoint
        storeApi.createProductImageRelation(id, productImageData)
          .then(response => {
            if (response.data.success) {
              const newImage = response.data.data;
              // Add the url for preview
              newImage.url = mediaResponse.url || `/storage/${mediaResponse.id}/${mediaResponse.file_name}`;

              setProductImages(prev => [...prev, newImage]);

              // Also update the product.images array
              setProduct(prev => ({
                ...prev,
                images: [...prev.images, newImage]
              }));

              setSuccessMessage('Image added successfully');
            } else {
              setError(response.data.message || 'Failed to add image');
            }
          })
          .catch(error => {
            console.error('Error creating image relation:', error);
            setError(error.response?.data?.message || 'Failed to add image');

            // Fallback - if the API doesn't support creating a relation directly,
            // we can still show the image in the UI by using the media data
            const fallbackImage = {
              id: `temp-${Date.now()}`,
              image_id: mediaResponse.id,
              url: mediaResponse.url || `/storage/${mediaResponse.id}/${mediaResponse.file_name}`,
              is_featured: productImages.length === 0,
              alt_text: mediaResponse.alt_text || mediaResponse.name || '',
              sort_order: productImages.length
            };

            setProductImages(prev => [...prev, fallbackImage]);

            // Also update the product.images array
            setProduct(prev => ({
              ...prev,
              images: [...prev.images, fallbackImage]
            }));
          })
          .finally(() => {
            setUploadingImage(false);
          });
      } else if (mediaResponse.file) {
        // This is a new file upload
        storeApi.uploadProductImage(id, {
          file: mediaResponse.file,
          alt: mediaResponse.alt_text || '',
          is_featured: productImages.length === 0,
          sort_order: productImages.length
        })
          .then(response => {
            if (response.data.success) {
              const newImage = response.data.data;
              setProductImages(prev => [...prev, newImage]);

              // Also update the product.images array
              setProduct(prev => ({
                ...prev,
                images: [...prev.images, newImage]
              }));

              setSuccessMessage('Image uploaded successfully');
            } else {
              setError(response.data.message || 'Failed to upload image');
            }
          })
          .catch(error => {
            console.error('Error uploading image:', error);
            setError(error.response?.data?.message || 'Failed to upload image');
          })
          .finally(() => {
            setUploadingImage(false);
          });
      } else {
        setError('Invalid media response');
        setUploadingImage(false);
      }
    } else {
      console.error('Invalid media response format');
      setError('Invalid media response format');
    }
  };

  // Handle product image deletion
  const handleDeleteProductImage = (imageId) => {
    if (!isEditing) {
      // If we're creating a new product, just remove from local state
      setProductImages(prev => prev.filter(img => img.temp_id !== imageId));
      return;
    }

    // Show confirmation dialog (could use a custom dialog component)
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    storeApi.deleteProductImage(id, imageId)
      .then(response => {
        if (response.data.success) {
          setProductImages(prev => prev.filter(img => img.id !== imageId));

          // Also update the product.images array
          setProduct(prev => ({
            ...prev,
            images: prev.images.filter(img => img.id !== imageId)
          }));

          setSuccessMessage('Image deleted successfully');
        } else {
          setError(response.data.message || 'Failed to delete image');
        }
      })
      .catch(error => {
        console.error('Error deleting image:', error);
        setError(error.response?.data?.message || 'Failed to delete image');
      });
  };

  // Mark an image as primary
  const handleSetPrimaryImage = (imageId) => {
    if (!isEditing) {
      // If we're creating a new product, just update local state
      setProductImages(prev => prev.map(img => ({
        ...img,
        is_featured: img.temp_id === imageId
      })));
      return;
    }

    // For existing products, update the primary status on the server
    const updatedImages = productImages.map(img => ({
      ...img,
      is_featured: img.id === imageId
    }));

    setProduct(prev => ({
      ...prev,
      images: updatedImages
    }));

    setProductImages(updatedImages);

    // We could make an API call to update the primary image status here
    // but this will be handled when product is saved
  };

  // Handle category selection
  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    const categoryId = parseInt(value);

    setProduct(prevProduct => {
      if (checked) {
        return {
          ...prevProduct,
          categories: [...prevProduct.categories, categoryId]
        };
      } else {
        return {
          ...prevProduct,
          categories: prevProduct.categories.filter(id => id !== categoryId)
        };
      }
    });
  };

  // Handle specifications
  const handleAddSpecification = () => {
    setProduct(prevProduct => ({
      ...prevProduct,
      specifications: [...prevProduct.specifications, { name: '', value: '', group: '', sort_order: prevProduct.specifications.length }]
    }));
  };

  const handleRemoveSpecification = (index) => {
    setProduct(prevProduct => ({
      ...prevProduct,
      specifications: prevProduct.specifications.filter((_, i) => i !== index)
    }));
  };

  const handleSpecificationChange = (index, field, value) => {
    setProduct(prevProduct => {
      const updatedSpecs = [...prevProduct.specifications];
      updatedSpecs[index] = {
        ...updatedSpecs[index],
        [field]: value
      };
      return {
        ...prevProduct,
        specifications: updatedSpecs
      };
    });
  };

  // Generate slug from name
  const generateSlug = () => {
    const slug = product.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setProduct(prevProduct => ({
      ...prevProduct,
      slug
    }));
  };

  // Save product
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage('');

    try {
      // Format the data for API
      const productData = {
        ...product,
        // Ensure numeric fields are sent as numbers
        default_price: parseFloat(product.default_price) || 0,
        cost: product.cost ? parseFloat(product.cost) : null,
        msrp: product.msrp ? parseFloat(product.msrp) : null,
        sale_price: product.sale_price ? parseFloat(product.sale_price) : null,
        weight: product.weight ? parseFloat(product.weight) : null,
        width: product.width ? parseFloat(product.width) : null,
        height: product.height ? parseFloat(product.height) : null,
        depth: product.depth ? parseFloat(product.depth) : null,
        fixed_shipping_price: product.fixed_shipping_price ? parseFloat(product.fixed_shipping_price) : null,
        sort_order: parseInt(product.sort_order) || 0,
        min_purchase_qty: parseInt(product.min_purchase_qty) || 1,
        max_purchase_qty: product.max_purchase_qty ? parseInt(product.max_purchase_qty) : null,
        inventory_level: parseInt(product.inventory_level) || 0,
        inventory_warning_level: parseInt(product.inventory_warning_level) || 5,
      };

      let savedProductId;

      if (isEditing) {
        const response = await storeApi.updateProduct(id, productData);
        savedProductId = id;
      } else {
        const response = await storeApi.createProduct(productData);
        savedProductId = response.data.data.id;

        // Upload any pending images for new products
        if (savedProductId && productImages.length > 0) {
          setSuccessMessage('Product created. Uploading images...');

          // Upload images one by one
          for (const image of productImages) {
            try {
              await storeApi.uploadProductImage(savedProductId, {
                file: image.file,
                alt: image.alt_text || '',
                is_featured: image.is_featured,
                sort_order: image.sort_order
              });
            } catch (imageError) {
              console.error('Error uploading image:', imageError);
              // Continue with the next image even if one fails
            }
          }
        }
      }

      setSuccessMessage('Product saved successfully');

      // Redirect to product list after a short delay
      setTimeout(() => {
        navigate('/admin/store/products');
      }, 1500);
    } catch (error) {
      console.error('Error saving product:', error);
      setError(error.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title={isViewOnly ? 'View Product' : isEditing ? 'Edit Product' : 'Add New Product'}
        backUrl="/admin/store/products"
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

      <form onSubmit={handleSubmit} className={isViewOnly ? 'pointer-events-none opacity-90' : ''}>
        <Tabs selectedIndex={tabIndex} onSelect={index => setTabIndex(index)}>
          <TabList className="flex flex-wrap border-b">
            <Tab className="px-4 py-2 cursor-pointer">Basic Information</Tab>
            <Tab className="px-4 py-2 cursor-pointer">Pricing & Inventory</Tab>
            <Tab className="px-4 py-2 cursor-pointer">Images & Media</Tab>
            <Tab className="px-4 py-2 cursor-pointer">Categories</Tab>
            <Tab className="px-4 py-2 cursor-pointer">Specifications</Tab>
            <Tab className="px-4 py-2 cursor-pointer">Shipping</Tab>
            <Tab className="px-4 py-2 cursor-pointer">Other Details</Tab>
            <Tab className="px-4 py-2 cursor-pointer">SEO</Tab>
          </TabList>

          {/* Basic Information Tab */}
          <TabPanel>
            <div className="bg-white p-6 rounded-md shadow-sm mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block mb-2 font-medium">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    value={product.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">Slug</label>
                  <div className="flex">
                    <input
                      type="text"
                      name="slug"
                      value={product.slug}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-l-md p-2"
                    />
                    <button
                      type="button"
                      onClick={generateSlug}
                      className="bg-gray-200 text-gray-700 px-4 rounded-r-md"
                    >
                      Generate
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-medium">Brand</label>
                  <select
                    name="brand_id"
                    value={product.brand_id || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="">Select Brand</option>
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-medium">Product Type</label>
                  <select
                    name="product_type"
                    value={product.product_type}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="physical">Physical Product</option>
                    <option value="digital">Digital Product</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-medium">SKU</label>
                  <input
                    type="text"
                    name="sku"
                    value={product.sku || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">Barcode (UPC/EAN)</label>
                  <input
                    type="text"
                    name="barcode"
                    value={product.barcode || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block mb-2 font-medium">Description</label>
                  <RichTextEditor
                    value={product.description}
                    onChange={handleRichTextChange}
                  />
                </div>
              </div>
            </div>
          </TabPanel>

          {/* Pricing & Inventory Tab */}
          <TabPanel>
            <div className="bg-white p-6 rounded-md shadow-sm mt-4">
              <h3 className="text-lg font-semibold mb-4">Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-medium">Default Price ($)</label>
                  <input
                    type="number"
                    name="default_price"
                    value={product.default_price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-md p-2"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">Cost Price ($)</label>
                  <input
                    type="number"
                    name="cost"
                    value={product.cost || ''}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">MSRP / Retail Price ($)</label>
                  <input
                    type="number"
                    name="msrp"
                    value={product.msrp || ''}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">Sale Price ($)</label>
                  <input
                    type="number"
                    name="sale_price"
                    value={product.sale_price || ''}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
              </div>

              <h3 className="text-lg font-semibold my-6">Inventory</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center mb-2 font-medium">
                    <input
                      type="checkbox"
                      name="track_inventory"
                      checked={product.track_inventory}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Track Inventory
                  </label>
                </div>

                <div className="col-span-2"></div>

                <div>
                  <label className="block mb-2 font-medium">Inventory Level</label>
                  <input
                    type="number"
                    name="inventory_level"
                    value={product.inventory_level}
                    onChange={handleChange}
                    min="0"
                    className="w-full border border-gray-300 rounded-md p-2"
                    disabled={!product.track_inventory}
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">Low Stock Warning Level</label>
                  <input
                    type="number"
                    name="inventory_warning_level"
                    value={product.inventory_warning_level}
                    onChange={handleChange}
                    min="0"
                    className="w-full border border-gray-300 rounded-md p-2"
                    disabled={!product.track_inventory}
                  />
                </div>
              </div>
            </div>
          </TabPanel>

          {/* Images & Media Tab */}
          <TabPanel>
            <div className="bg-white p-6 rounded-md shadow-sm mt-4">
              <h3 className="text-lg font-semibold mb-4">Product Images</h3>

              {/* Product Image Management */}
              <div className="mb-6">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700">Add Product Images</h4>
                  <MediaChooser
                    label=""
                    value=""
                    onChange={handleProductImageUpload}
                    mediaType="image"
                    placeholder="Select an image to add to this product"
                    disabled={uploadingImage}
                    sendBackWholeResponse={true}
                  />
                </div>

                {uploadingImage && (
                  <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded mb-4">
                    Uploading image... Please wait.
                  </div>
                )}

                <h4 className="font-medium text-gray-700 mb-2 mt-6">Current Images</h4>
                {productImages.length === 0 ? (
                  <div className="text-gray-500 italic mb-4">
                    No images have been added to this product yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {productImages.map(image => (
                      <div key={image.id || image.temp_id} className="relative group">
                        <img
                          src={image.url || image.image_url || (image.file ? URL.createObjectURL(image.file) : `/storage/${image.path}`)}
                          alt={image.alt_text || 'Product image'}
                          className="w-full h-40 object-cover rounded border"
                        />
                        {image.is_featured && (
                          <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            Primary
                          </span>
                        )}

                        {/* Image Actions Overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                          {!image.is_featured && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(image.id || image.temp_id)}
                              className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
                              title="Set as primary image"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteProductImage(image.id || image.temp_id)}
                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                            title="Delete image"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 text-sm text-gray-600">
                  <p>
                    <strong>Tip:</strong> Hover over an image to show action buttons. You can mark an image as
                    primary or delete it. The primary image will be displayed first in product listings.
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">SEO Image</h3>
                <MediaChooser
                  value={product.seo_image}
                  onChange={(media) => handleMediaSelect('seo_image', media)}
                  mediaType="image"
                />
              </div>
            </div>
          </TabPanel>

          {/* Categories Tab */}
          <TabPanel>
            <div className="bg-white p-6 rounded-md shadow-sm mt-4">
              <h3 className="text-lg font-semibold mb-4">Product Categories</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categories.map(category => (
                  <div key={category.id} className="flex items-start">
                    <input
                      type="checkbox"
                      id={`category-${category.id}`}
                      value={category.id}
                      checked={product.categories.includes(category.id)}
                      onChange={handleCategoryChange}
                      className="mt-1 mr-2"
                    />
                    <label htmlFor={`category-${category.id}`} className="cursor-pointer">
                      <span className="font-medium">{category.name}</span>
                      {category.parent_id && <span className="text-gray-500 text-sm"> (Sub-category)</span>}
                    </label>
                  </div>
                ))}
              </div>

              {categories.length === 0 && (
                <p className="text-gray-600 italic">No categories found. <a href="/admin/store/categories/new" className="text-blue-500">Add a category</a>.</p>
              )}
            </div>
          </TabPanel>

          {/* Specifications Tab */}
          <TabPanel>
            <div className="bg-white p-6 rounded-md shadow-sm mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Product Specifications</h3>
                <button
                  type="button"
                  onClick={handleAddSpecification}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Add Specification
                </button>
              </div>

              {product.specifications.length === 0 ? (
                <p className="text-gray-600 italic">No specifications added yet. Click 'Add Specification' to add one.</p>
              ) : (
                <div className="space-y-4">
                  {product.specifications.map((spec, index) => (
                    <div key={index} className="border p-4 rounded">
                      <div className="flex justify-between mb-2">
                        <h4 className="font-medium">Specification {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecification(index)}
                          className="text-red-500"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block mb-1 text-sm font-medium">Name</label>
                          <input
                            type="text"
                            value={spec.name}
                            onChange={(e) => handleSpecificationChange(index, 'name', e.target.value)}
                            className="w-full border border-gray-300 rounded-md p-2"
                            placeholder="e.g. Material, Size, Color"
                            required
                          />
                        </div>

                        <div>
                          <label className="block mb-1 text-sm font-medium">Value</label>
                          <input
                            type="text"
                            value={spec.value}
                            onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                            className="w-full border border-gray-300 rounded-md p-2"
                            placeholder="e.g. Cotton, Large, Blue"
                            required
                          />
                        </div>

                        <div>
                          <label className="block mb-1 text-sm font-medium">Group (Optional)</label>
                          <input
                            type="text"
                            value={spec.group || ''}
                            onChange={(e) => handleSpecificationChange(index, 'group', e.target.value)}
                            className="w-full border border-gray-300 rounded-md p-2"
                            placeholder="e.g. Physical, Technical, Materials"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabPanel>

          {/* Shipping Tab */}
          <TabPanel>
            <div className="bg-white p-6 rounded-md shadow-sm mt-4">
              <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center mb-2 font-medium">
                    <input
                      type="checkbox"
                      name="free_shipping"
                      checked={product.free_shipping}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Free Shipping
                  </label>
                </div>

                <div>
                  <label className="block mb-2 font-medium">Fixed Shipping Price ($)</label>
                  <input
                    type="number"
                    name="fixed_shipping_price"
                    value={product.fixed_shipping_price || ''}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-md p-2"
                    disabled={product.free_shipping}
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">Origin Location</label>
                  <input
                    type="text"
                    name="origin_location"
                    value={product.origin_location || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                    placeholder="e.g. Warehouse 1, Dallas"
                  />
                </div>

                <div className="col-span-2">
                  <h4 className="font-medium mb-2">Physical Dimensions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block mb-1 text-sm">Weight</label>
                      <input
                        type="number"
                        name="weight"
                        value={product.weight || ''}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full border border-gray-300 rounded-md p-2"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-sm">Width</label>
                      <input
                        type="number"
                        name="width"
                        value={product.width || ''}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full border border-gray-300 rounded-md p-2"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-sm">Height</label>
                      <input
                        type="number"
                        name="height"
                        value={product.height || ''}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full border border-gray-300 rounded-md p-2"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-sm">Depth</label>
                      <input
                        type="number"
                        name="depth"
                        value={product.depth || ''}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full border border-gray-300 rounded-md p-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>

          {/* Other Details Tab */}
          <TabPanel>
            <div className="bg-white p-6 rounded-md shadow-sm mt-4">
              <h3 className="text-lg font-semibold mb-4">Other Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-medium">Bin Picking Number</label>
                  <input
                    type="text"
                    name="bin_picking_number"
                    value={product.bin_picking_number || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">Product Page Template</label>
                  <select
                    name="template_page"
                    value={product.template_page}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="default">Default Template</option>
                    <option value="side-image">Side Image Template</option>
                    <option value="full-width">Full Width Template</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block mb-2 font-medium">Warranty Information</label>
                  <textarea
                    name="warranty_information"
                    value={product.warranty_information || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                    rows="3"
                  ></textarea>
                </div>

                <div className="col-span-2">
                  <label className="block mb-2 font-medium">Search Keywords</label>
                  <textarea
                    name="search_keywords"
                    value={product.search_keywords || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                    rows="2"
                    placeholder="Comma-separated keywords to improve search results"
                  ></textarea>
                </div>

                <div>
                  <label className="block mb-2 font-medium">Availability</label>
                  <select
                    name="availability"
                    value={product.availability}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="available">Available (can be purchased)</option>
                    <option value="preorder">Pre-order (coming soon)</option>
                    <option value="unavailable">Unavailable (not purchasable)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-medium">Stock Status</label>
                  <select
                    name="stock_status"
                    value={product.stock_status}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="coming_soon">Coming Soon</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center mb-2 font-medium">
                    <input
                      type="checkbox"
                      name="is_visible"
                      checked={product.is_visible}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Visible in Store
                  </label>
                </div>

                <div>
                  <label className="flex items-center mb-2 font-medium">
                    <input
                      type="checkbox"
                      name="is_featured"
                      checked={product.is_featured}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Featured Product
                  </label>
                </div>

                <div>
                  <label className="block mb-2 font-medium">Gift Wrapping</label>
                  <select
                    name="gift_wrapping"
                    value={product.gift_wrapping}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="all">Use all visible gift wrapping options</option>
                    <option value="none">Don't allow this item to be gift wrapped</option>
                    <option value="specific">Specify specific gift wrapping options</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-medium">Sort Order</label>
                  <input
                    type="number"
                    name="sort_order"
                    value={product.sort_order}
                    onChange={handleChange}
                    min="0"
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">Product Condition</label>
                  <select
                    name="condition"
                    value={product.condition}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="new">New</option>
                    <option value="used">Used</option>
                    <option value="refurbished">Refurbished</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-medium">Minimum Purchase Quantity</label>
                  <input
                    type="number"
                    name="min_purchase_qty"
                    value={product.min_purchase_qty}
                    onChange={handleChange}
                    min="1"
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">Maximum Purchase Quantity</label>
                  <input
                    type="number"
                    name="max_purchase_qty"
                    value={product.max_purchase_qty || ''}
                    onChange={handleChange}
                    min="0"
                    className="w-full border border-gray-300 rounded-md p-2"
                    placeholder="Leave blank for unlimited"
                  />
                </div>
              </div>
            </div>
          </TabPanel>

          {/* SEO Tab */}
          <TabPanel>
            <div className="bg-white p-6 rounded-md shadow-sm mt-4">
              <h3 className="text-lg font-semibold mb-4">SEO Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-medium">Object Type</label>
                  <select
                    name="seo_object_type"
                    value={product.seo_object_type}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="product">Product</option>
                    <option value="album">Album</option>
                    <option value="book">Book</option>
                    <option value="drink">Drink</option>
                    <option value="food">Food</option>
                    <option value="game">Game</option>
                    <option value="movie">Movie</option>
                    <option value="song">Song</option>
                    <option value="tv_show">TV Show</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-medium">SEO Image</label>
                  <p className="text-sm text-gray-600 mb-2">Selected on the Images tab</p>
                </div>

                <div>
                  <label className="block mb-2 font-medium">SEO Title</label>
                  <input
                    type="text"
                    name="seo_title"
                    value={product.seo_title || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                    placeholder="Leave blank to use product name"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block mb-2 font-medium">SEO Description</label>
                  <textarea
                    name="seo_description"
                    value={product.seo_description || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                    rows="3"
                  ></textarea>
                </div>
              </div>
            </div>
          </TabPanel>
        </Tabs>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/store/products')}
            className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            {isViewOnly ? 'Back' : 'Cancel'}
          </button>
          {!isViewOnly && (
            <button
              type="submit"
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Product'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProductEditor;
