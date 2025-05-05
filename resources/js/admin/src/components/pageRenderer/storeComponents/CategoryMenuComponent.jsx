// resources/js/admin/src/components/pageRenderer/storeComponents/CategoryMenuComponent.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const CategoryMenuComponent = ({ 
  title, 
  maxDepth = 2, 
  showTitle = true,
  alignment = 'left', 
  variant = 'dropdown', // dropdown, horizontal, vertical
  categoryLimit = 10,
  componentId,
  extraClasses = ''
}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const dropdownRefs = useRef({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/product-categories/tree');
        
        // Get tree structure or flat list
        let categoryData = response.data?.data || response.data || [];
        
        // If we have nested data structure
        if (categoryData.data) {
          categoryData = categoryData.data;
        }
        
        setCategories(categoryData);
        setError(null);
      } catch (err) {
        console.error('Error fetching category tree:', err);
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();

    // Handle clicks outside dropdown to close them
    const handleClickOutside = (event) => {
      Object.keys(dropdownRefs.current).forEach(key => {
        if (dropdownRefs.current[key] && !dropdownRefs.current[key].contains(event.target)) {
          setOpenDropdowns(prev => ({
            ...prev,
            [key]: false
          }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = (categoryId) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const getTextAlignmentClass = () => {
    switch (alignment) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      case 'left':
      default:
        return 'text-left';
    }
  };

  const renderCategoryMenu = (categories, currentDepth = 1) => {
    if (!categories || categories.length === 0 || currentDepth > maxDepth) {
      return null;
    }

    // Limit number of top-level categories if needed
    const displayCategories = currentDepth === 1 && categoryLimit > 0 
      ? categories.slice(0, categoryLimit) 
      : categories;

    if (variant === 'dropdown' && currentDepth === 1) {
      return (
        <ul className={`flex ${
          alignment === 'center' ? 'justify-center' : 
          alignment === 'right' ? 'justify-end' : 'justify-start'
        } flex-wrap space-x-1 md:space-x-4`}>
          {displayCategories.map(category => (
            <li key={category.id} className="relative" ref={el => dropdownRefs.current[category.id] = el}>
              <div className="group">
                <div 
                  className="flex items-center py-2 px-3 text-gray-700 hover:text-blue-600 cursor-pointer" 
                  onClick={() => toggleDropdown(category.id)}
                >
                  <span className="mr-1">{category.name}</span>
                  {(category.children && category.children.length > 0) && (
                    <svg 
                      className={`h-4 w-4 transition-transform ${openDropdowns[category.id] ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
                
                {(category.children && category.children.length > 0 && openDropdowns[category.id]) && (
                  <div className="absolute z-10 left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                    {renderCategoryMenu(category.children, currentDepth + 1)}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      );
    } else if (variant === 'horizontal' && currentDepth === 1) {
      return (
        <ul className={`flex ${
          alignment === 'center' ? 'justify-center' : 
          alignment === 'right' ? 'justify-end' : 'justify-start'
        } flex-wrap space-x-1 md:space-x-6`}>
          {displayCategories.map(category => (
            <li key={category.id}>
              <Link 
                to={`/category/${category.slug}`} 
                className="block py-2 text-gray-700 hover:text-blue-600"
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      );
    } else if (variant === 'vertical' || currentDepth > 1) {
      return (
        <ul className={`space-y-1 ${currentDepth > 1 ? 'pl-4' : ''}`}>
          {displayCategories.map(category => (
            <li key={category.id}>
              <Link 
                to={`/category/${category.slug}`} 
                className="block py-2 text-gray-700 hover:text-blue-600"
              >
                {category.name}
              </Link>
              {category.children && category.children.length > 0 && (
                renderCategoryMenu(category.children, currentDepth + 1)
              )}
            </li>
          ))}
        </ul>
      );
    }
  };

  if (loading) {
    return (
      <div id={componentId} className={`category-menu-component ${extraClasses}`}>
        <div className="py-2 text-center">
          <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div id={componentId} className={`category-menu-component ${extraClasses} text-red-500 text-sm`}>
        {error}
      </div>
    );
  }

  return (
    <div id={componentId} className={`category-menu-component ${extraClasses} ${getTextAlignmentClass()}`}>
      {showTitle && title && (
        <h3 className="text-lg font-semibold mb-3">{title}</h3>
      )}
      <nav>
        {renderCategoryMenu(categories)}
      </nav>
    </div>
  );
};

export default CategoryMenuComponent;