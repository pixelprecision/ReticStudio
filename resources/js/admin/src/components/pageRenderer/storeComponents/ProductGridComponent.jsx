// resources/js/admin/src/components/pageRenderer/storeComponents/ProductGridComponent.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ProductGridComponent = ({
  title,
  subtitle,
  columns = 3,
  perPage = 9,
  sortBy = 'created_at',
  sortDirection = 'desc',
  categoryId = '',
  brandId = '',
  showPagination = true,
  showPrice = true,
  showBrand = true,
  showStock = true,
  addToCartButton = true,
  emptyMessage = 'No products found',
  queryFilters = {},
  componentId,
  extraClasses = ''
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    perPage: parseInt(perPage),
    totalRecords: 0
  });

  useEffect(() => {
    fetchProducts(1);
  }, [categoryId, brandId, sortBy, sortDirection, perPage]);

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      
      // Prepare query parameters
      const params = {
        page,
        per_page: pagination.perPage,
        sort_field: sortBy,
        sort_direction: sortDirection,
        ...queryFilters
      };
      
      // Add category filter if provided
      if (categoryId) {
        params.category_id = categoryId;
      }
      
      // Add brand filter if provided
      if (brandId) {
        params.brand_id = brandId;
      }
      
      const response = await axios.get('/api/products', { params });
      
      // Extract the products data
      const responseData = response.data?.data || response.data;
      const productsData = responseData?.data || responseData || [];
      
      // If it's a complete pagination response
      if (responseData?.current_page) {
        setPagination({
          currentPage: responseData.current_page,
          totalPages: responseData.last_page || Math.ceil(responseData.total / responseData.per_page),
          perPage: responseData.per_page,
          totalRecords: responseData.total
        });
      }
      
      setProducts(Array.isArray(productsData) ? productsData : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Determine column classes based on the columns prop
  const getColumnClasses = () => {
    switch (parseInt(columns)) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 4:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      case 5:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5';
      case 6:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6';
      case 3:
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      // Make API call to add product to cart
      await axios.post('/api/cart/items', {
        product_id: productId,
        quantity: 1
      });
      
      // Show success message - in a real app, you'd use a toast or notification
      alert('Product added to cart!');
    } catch (err) {
      console.error('Error adding product to cart:', err);
      alert('Failed to add product to cart.');
    }
  };

  const handlePageChange = (page) => {
    fetchProducts(page);
  };

  const renderPagination = () => {
    if (!showPagination || pagination.totalPages <= 1) {
      return null;
    }

    const pages = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    // Previous button
    pages.push(
      <li key="prev">
        <button
          onClick={() => handlePageChange(Math.max(1, pagination.currentPage - 1))}
          disabled={pagination.currentPage === 1}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md 
            ${pagination.currentPage === 1 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-gray-700 hover:bg-gray-50'}`}
        >
          Previous
        </button>
      </li>
    );
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <li key={i}>
          <button
            onClick={() => handlePageChange(i)}
            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md 
              ${pagination.currentPage === i 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-700 hover:bg-gray-50'}`}
          >
            {i}
          </button>
        </li>
      );
    }
    
    // Next button
    pages.push(
      <li key="next">
        <button
          onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
          disabled={pagination.currentPage === pagination.totalPages}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md 
            ${pagination.currentPage === pagination.totalPages 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-gray-700 hover:bg-gray-50'}`}
        >
          Next
        </button>
      </li>
    );
    
    return (
      <div className="flex justify-center mt-8">
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <ul className="flex items-center">
            {pages}
          </ul>
        </nav>
      </div>
    );
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

  if (loading && products.length === 0) {
    return (
      <div id={componentId} className={`product-grid-component my-8 ${extraClasses}`}>
        {title && <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>}
        {subtitle && <p className="text-lg text-gray-600 mb-8 text-center">{subtitle}</p>}
        
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div id={componentId} className={`product-grid-component my-8 ${extraClasses}`}>
        {title && <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>}
        {subtitle && <p className="text-lg text-gray-600 mb-8 text-center">{subtitle}</p>}
        
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div id={componentId} className={`product-grid-component my-8 ${extraClasses}`}>
        {title && <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>}
        {subtitle && <p className="text-lg text-gray-600 mb-8 text-center">{subtitle}</p>}
        
        <div className="text-center py-8 text-gray-500">
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div id={componentId} className={`product-grid-component my-8 ${extraClasses}`}>
      {title && <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>}
      {subtitle && <p className="text-lg text-gray-600 mb-8 text-center">{subtitle}</p>}

      <div className={`grid ${getColumnClasses()} gap-6`}>
        {products.map((product) => {
          const primaryImage = product.images?.find(img => img.is_featured) || product.images?.[0];
          const imageUrl = primaryImage?.thumbnail_url || primaryImage?.url || null;
          
          return (
            <div 
              key={product.id} 
              className="product-item bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <Link to={`/product/${product.slug}`} className="block">
                <div className="relative h-64 bg-gray-200">
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={product.name} 
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
                  
                  {/* Sale badge if on sale */}
                  {product.on_sale && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                      SALE
                    </div>
                  )}
                </div>
              </Link>
              
              <div className="p-4">
                <Link to={`/product/${product.slug}`} className="block">
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">{product.name}</h3>
                </Link>
                
                {showBrand && product.brand && (
                  <p className="mt-1 text-sm text-gray-500">{product.brand.name}</p>
                )}
                
                {showPrice && (
                  <div className="mt-2">
                    {product.sale_price && product.sale_price < product.regular_price ? (
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-red-600">
                          {formatPrice(product.sale_price)}
                        </span>
                        <span className="ml-2 text-sm text-gray-500 line-through">
                          {formatPrice(product.regular_price)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(product.regular_price || product.default_price)}
                      </span>
                    )}
                  </div>
                )}
                
                {showStock && (
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.stock_status === 'in_stock' ? 'bg-green-100 text-green-800' :
                      product.stock_status === 'out_of_stock' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {product.stock_status === 'in_stock' ? 'In Stock' :
                       product.stock_status === 'out_of_stock' ? 'Out of Stock' :
                       'Coming Soon'}
                    </span>
                  </div>
                )}
                
                {addToCartButton && product.stock_status === 'in_stock' && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(product.id);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-200"
                    >
                      Add to Cart
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {renderPagination()}
    </div>
  );
};

export default ProductGridComponent;