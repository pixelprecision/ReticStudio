// resources/js/admin/src/components/pageRenderer/storeComponents/ProductPageComponent.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const ProductPageComponent = ({ 
  productId,
  slug, 
  showRelatedProducts = true,
  showQuantitySelector = true,
  showBrand = true,
  showCategory = true,
  showSKU = true,
  showShortDescription = true,
  tabSections = true,
  componentId,
  extraClasses = ''
}) => {
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  // Use the productId from props, or slug from props, or from URL params
  const productIdentifier = productId || slug || params.slug;
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        
        let response;
        
        // If we have a numeric ID, fetch by ID
        if (productId && !isNaN(parseInt(productId))) {
          response = await axios.get(`/api/products/${productId}`);
        }
        // Otherwise fetch by slug
        else {
          const slugValue = slug || params.slug;
          response = await axios.get(`/api/products/slug/${slugValue}`);
        }
        
        const productData = response.data?.data || response.data;
        setProduct(productData);
        
        // If the product was found, fetch related products
        if (productData && productData.id && showRelatedProducts) {
          fetchRelatedProducts(productData.id);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    const fetchRelatedProducts = async (id) => {
      try {
        const response = await axios.get(`/api/products/${id}/related`);
        const relatedData = response.data?.data || response.data || [];
        setRelatedProducts(Array.isArray(relatedData) ? relatedData : []);
      } catch (err) {
        console.error('Error fetching related products:', err);
        setRelatedProducts([]);
      }
    };
    
    if (productIdentifier) {
      fetchProduct();
    }
  }, [productIdentifier]);
  
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };
  
  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  const handleAddToCart = async () => {
    try {
      // Make API call to add product to cart
      await axios.post('/api/cart/items', {
        product_id: product.id,
        quantity: quantity
      });
      
      // Show success message - in a real app, you'd use a toast or notification
      alert(`${quantity} item(s) added to cart!`);
    } catch (err) {
      console.error('Error adding product to cart:', err);
      alert('Failed to add product to cart.');
    }
  };
  
  const openLightbox = (index) => {
    setSelectedImageIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };
  
  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'auto'; // Restore scrolling
  };
  
  const nextImage = () => {
    if (product?.images && product.images.length > 0) {
      setSelectedImageIndex((prevIndex) => (prevIndex + 1) % product.images.length);
    }
  };
  
  const prevImage = () => {
    if (product?.images && product.images.length > 0) {
      setSelectedImageIndex((prevIndex) => (prevIndex - 1 + product.images.length) % product.images.length);
    }
  };
  
  // Format price with currency
  const formatPrice = (price) => {
    if (!price && price !== 0) return '';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };
  
  if (loading) {
    return (
      <div id={componentId} className={`product-page-component my-8 ${extraClasses}`}>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div id={componentId} className={`product-page-component my-8 ${extraClasses}`}>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error || 'Product not found'}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div id={componentId} className={`product-page-component my-8 ${extraClasses}`}>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images Section */}
          <div className="product-gallery">
            {product.images && product.images.length > 0 ? (
              <>
                <div 
                  className="main-image bg-gray-100 rounded-lg overflow-hidden cursor-pointer mb-4 h-96 flex items-center justify-center"
                  onClick={() => openLightbox(selectedImageIndex)}
                >
                  <img 
                    src={product.images[selectedImageIndex]?.url || product.images[selectedImageIndex]?.thumbnail_url} 
                    alt={product.images[selectedImageIndex]?.alt_text || product.name} 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmaWxsPSIjOTk5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                    }}
                  />
                </div>
                
                {product.images.length > 1 && (
                  <div className="thumbnails-slider flex overflow-x-auto space-x-2 pb-2">
                    {product.images.map((image, index) => (
                      <div 
                        key={index}
                        className={`thumbnail-wrapper flex-shrink-0 cursor-pointer w-20 h-20 bg-gray-100 rounded-md overflow-hidden ${
                          selectedImageIndex === index ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <img 
                          src={image.thumbnail_url || image.url} 
                          alt={image.alt_text || `${product.name} - Image ${index + 1}`} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmaWxsPSIjOTk5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="main-image bg-gray-100 rounded-lg flex items-center justify-center h-96">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>
          
          {/* Product Info Section */}
          <div className="product-info">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            
            {showBrand && product.brand && (
              <div className="mb-4">
                <span className="text-sm text-gray-500">Brand: </span>
                <Link to={`/brand/${product.brand.slug}`} className="text-blue-600 hover:text-blue-800">
                  {product.brand.name}
                </Link>
              </div>
            )}
            
            {showCategory && product.categories && product.categories.length > 0 && (
              <div className="mb-4">
                <span className="text-sm text-gray-500">Category: </span>
                {product.categories.map((category, index) => (
                  <span key={category.id}>
                    <Link to={`/category/${category.slug}`} className="text-blue-600 hover:text-blue-800">
                      {category.name}
                    </Link>
                    {index < product.categories.length - 1 && ", "}
                  </span>
                ))}
              </div>
            )}
            
            {showSKU && product.sku && (
              <div className="mb-4">
                <span className="text-sm text-gray-500">SKU: </span>
                <span className="text-gray-700">{product.sku}</span>
              </div>
            )}
            
            <div className="my-4">
              {product.sale_price && product.sale_price < product.regular_price ? (
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-red-600 mr-2">
                    {formatPrice(product.sale_price)}
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(product.regular_price)}
                  </span>
                </div>
              ) : (
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(product.regular_price || product.default_price)}
                </span>
              )}
            </div>
            
            <div className="mb-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                product.stock_status === 'in_stock' ? 'bg-green-100 text-green-800' :
                product.stock_status === 'out_of_stock' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {product.stock_status === 'in_stock' ? 'In Stock' :
                 product.stock_status === 'out_of_stock' ? 'Out of Stock' :
                 'Coming Soon'}
              </span>
            </div>
            
            {showShortDescription && product.short_description && (
              <div className="my-4 text-gray-600">
                <p>{product.short_description}</p>
              </div>
            )}
            
            {product.stock_status === 'in_stock' && (
              <div className="my-6">
                {showQuantitySelector && (
                  <div className="flex items-center mb-4">
                    <label htmlFor="quantity" className="mr-4 text-sm font-medium text-gray-700">
                      Quantity:
                    </label>
                    <div className="flex items-center">
                      <button
                        type="button"
                        className="px-3 py-1 border border-gray-300 bg-gray-100 rounded-l-md focus:outline-none"
                        onClick={decrementQuantity}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        min="1"
                        value={quantity}
                        onChange={handleQuantityChange}
                        className="w-12 text-center border-t border-b border-gray-300 py-1 focus:outline-none"
                      />
                      <button
                        type="button"
                        className="px-3 py-1 border border-gray-300 bg-gray-100 rounded-r-md focus:outline-none"
                        onClick={incrementQuantity}
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 font-medium"
                >
                  Add to Cart
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Product Details Tabs Section */}
        {tabSections && (
          <div className="mt-12">
            <div className="border-b border-gray-200">
              <ul className="flex flex-wrap -mb-px">
                <li className="mr-2">
                  <button
                    className={`inline-block p-4 border-b-2 rounded-t-lg ${
                      activeTab === 'description' 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-transparent hover:text-gray-600 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('description')}
                  >
                    Description
                  </button>
                </li>
                
                {product.specifications && product.specifications.length > 0 && (
                  <li className="mr-2">
                    <button
                      className={`inline-block p-4 border-b-2 rounded-t-lg ${
                        activeTab === 'specifications' 
                          ? 'border-blue-600 text-blue-600' 
                          : 'border-transparent hover:text-gray-600 hover:border-gray-300'
                      }`}
                      onClick={() => setActiveTab('specifications')}
                    >
                      Specifications
                    </button>
                  </li>
                )}
                
                {product.reviews && product.reviews.length > 0 && (
                  <li className="mr-2">
                    <button
                      className={`inline-block p-4 border-b-2 rounded-t-lg ${
                        activeTab === 'reviews' 
                          ? 'border-blue-600 text-blue-600' 
                          : 'border-transparent hover:text-gray-600 hover:border-gray-300'
                      }`}
                      onClick={() => setActiveTab('reviews')}
                    >
                      Reviews ({product.reviews.length})
                    </button>
                  </li>
                )}
              </ul>
            </div>
            
            <div className="py-4">
              {activeTab === 'description' && (
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: product.description || 'No description available.' }}></div>
              )}
              
              {activeTab === 'specifications' && product.specifications && (
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="bg-white divide-y divide-gray-200">
                      {product.specifications.map((spec, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {spec.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {spec.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {activeTab === 'reviews' && product.reviews && (
                <div className="space-y-4">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-4">
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <svg 
                              key={index}
                              className={`w-5 h-5 ${index < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">{review.author} - {new Date(review.created_at).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-lg font-medium text-gray-900">{review.title}</h4>
                      <p className="text-gray-600">{review.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Related Products Section */}
        {showRelatedProducts && relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((relatedProduct) => {
                const relatedImage = relatedProduct.images?.find(img => img.is_featured) || relatedProduct.images?.[0];
                const imageUrl = relatedImage?.thumbnail_url || relatedImage?.url || null;
                
                return (
                  <div 
                    key={relatedProduct.id} 
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-transform duration-300 hover:-translate-y-1"
                  >
                    <Link to={`/product/${relatedProduct.slug}`} className="block">
                      <div className="relative h-48 bg-gray-200">
                        {imageUrl ? (
                          <img 
                            src={imageUrl} 
                            alt={relatedProduct.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmaWxsPSIjOTk5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">{relatedProduct.name}</h3>
                        <div className="mt-2">
                          {relatedProduct.sale_price && relatedProduct.sale_price < relatedProduct.regular_price ? (
                            <div className="flex items-center">
                              <span className="text-lg font-bold text-red-600">
                                {formatPrice(relatedProduct.sale_price)}
                              </span>
                              <span className="ml-2 text-sm text-gray-500 line-through">
                                {formatPrice(relatedProduct.regular_price)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-lg font-bold text-gray-900">
                              {formatPrice(relatedProduct.regular_price || relatedProduct.default_price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      {/* Lightbox */}
      {lightboxOpen && product.images && product.images.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button 
              className="absolute top-4 right-4 text-white z-10 p-2"
              onClick={closeLightbox}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Previous button */}
            {product.images.length > 1 && (
              <button 
                className="absolute left-4 text-white z-10 p-2"
                onClick={prevImage}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            
            {/* Next button */}
            {product.images.length > 1 && (
              <button 
                className="absolute right-4 text-white z-10 p-2"
                onClick={nextImage}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            
            {/* Main image */}
            <img 
              src={product.images[selectedImageIndex]?.url} 
              alt={product.images[selectedImageIndex]?.alt_text || product.name} 
              className="max-h-screen max-w-full object-contain p-4"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmaWxsPSIjOTk5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
              }}
            />
            
            {/* Image count indicator */}
            {product.images.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 text-center text-white">
                {selectedImageIndex + 1} / {product.images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPageComponent;