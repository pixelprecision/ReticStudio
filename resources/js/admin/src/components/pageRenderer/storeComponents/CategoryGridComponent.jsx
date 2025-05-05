// resources/js/admin/src/components/pageRenderer/storeComponents/CategoryGridComponent.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const CategoryGridComponent = ({ 
  title, 
  subtitle, 
  columns = 3, 
  showDescription = true, 
  showCount = true, 
  parentId = null,
  parentSlug = null,
  emptyMessage = 'No categories found', 
  componentId, 
  extraClasses = '' 
}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        let response;
        
        // If we have a parentId or parentSlug, fetch subcategories
        if (parentId) {
          response = await axios.get(`/api/product-categories/${parentId}/subcategories`);
        } else if (parentSlug) {
          response = await axios.get(`/api/product-categories/slug/${parentSlug}/subcategories`);
        } else {
          // Fetch top-level categories
          response = await axios.get('/api/product-categories');
        }
        
        // If the response has a data property containing the categories
        const categoriesData = response.data?.data || response.data || [];
        
        // If we have nested data structure
        const categories = Array.isArray(categoriesData) 
          ? categoriesData 
          : (categoriesData.data || []);
          
        setCategories(categories);
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [parentId, parentSlug]);

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
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
      case 6:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6';
      case 3:
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
  };

  if (loading) {
    return (
      <div id={componentId} className={`category-grid-component my-8 ${extraClasses}`}>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div id={componentId} className={`category-grid-component my-8 ${extraClasses}`}>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div id={componentId} className={`category-grid-component my-8 ${extraClasses}`}>
        <div className="text-center py-8 text-gray-500">
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div id={componentId} className={`category-grid-component my-8 ${extraClasses}`}>
      {title && (
        <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>
      )}
      {subtitle && (
        <p className="text-lg text-gray-600 mb-8 text-center">{subtitle}</p>
      )}

      <div className={`grid ${getColumnClasses()} gap-6`}>
        {categories.map((category) => (
          <div 
            key={category.id} 
            className="category-item bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <Link to={`/category/${category.slug}`} className="block">
              {category.image && (
                <div className="relative h-48 bg-gray-200">
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmaWxsPSIjOTk5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                    }}
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                
                {showDescription && category.description && (
                  <p className="mt-2 text-gray-600 line-clamp-2">{category.description}</p>
                )}
                
                {showCount && (
                  <p className="mt-2 text-sm text-gray-500">
                    {category.products_count || 0} {(category.products_count === 1) ? 'product' : 'products'}
                  </p>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryGridComponent;