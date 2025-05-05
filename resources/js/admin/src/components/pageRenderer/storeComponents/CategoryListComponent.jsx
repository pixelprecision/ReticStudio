// resources/js/admin/src/components/pageRenderer/storeComponents/CategoryListComponent.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const CategoryListComponent = ({ 
  title, 
  subtitle, 
  showDescription = true, 
  showCount = true, 
  showImage = true,
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

  if (loading) {
    return (
      <div id={componentId} className={`category-list-component my-8 ${extraClasses}`}>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div id={componentId} className={`category-list-component my-8 ${extraClasses}`}>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div id={componentId} className={`category-list-component my-8 ${extraClasses}`}>
        <div className="text-center py-8 text-gray-500">
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div id={componentId} className={`category-list-component my-8 ${extraClasses}`}>
      {title && (
        <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>
      )}
      {subtitle && (
        <p className="text-lg text-gray-600 mb-8 text-center">{subtitle}</p>
      )}

      <ul className="divide-y divide-gray-200">
        {categories.map((category) => (
          <li key={category.id} className="py-4">
            <Link 
              to={`/category/${category.slug}`} 
              className="flex items-center space-x-4 hover:bg-gray-50 p-2 rounded transition-colors duration-200"
            >
              {showImage && category.image && (
                <div className="flex-shrink-0 h-16 w-16 bg-gray-200 rounded-md overflow-hidden">
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmaWxsPSIjOTk5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                    }}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-lg font-medium text-gray-900 truncate">{category.name}</p>
                
                {showDescription && category.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">{category.description}</p>
                )}
              </div>
              
              {showCount && (
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  <span className="text-sm font-medium">
                    {category.products_count || 0} {(category.products_count === 1) ? 'product' : 'products'}
                  </span>
                </div>
              )}
              
              <div className="flex-shrink-0 ml-2">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryListComponent;