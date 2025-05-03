// resources/js/admin/src/components/pageBuilder/LiveBuilderToolbar.jsx
import React, { useState } from 'react';
import { FiSave, FiArrowLeft, FiSettings, FiEye, FiSmartphone, FiMonitor, FiTablet } from 'react-icons/fi';

const LiveBuilderToolbar = ({
  onSave,
  onExit,
  hasPendingChanges,
  pageData
}) => {
  const [viewportSize, setViewportSize] = useState('desktop');
  const [showPageSettings, setShowPageSettings] = useState(false);
  
  // Page settings needed for the toolbar
  const pageTitle = pageData?.title || 'Untitled Page';
  const isPublished = pageData?.is_published || false;
  
  // Handle viewport size changes
  const handleViewportChange = (size) => {
    setViewportSize(size);
    
    // Apply viewport size to the main content area
    const contentEl = document.querySelector('.live-builder-content');
    if (contentEl) {
      // Remove existing viewport classes
      contentEl.classList.remove('viewport-mobile', 'viewport-tablet', 'viewport-desktop');
      
      // Add the selected viewport class
      if (size === 'mobile') {
        contentEl.classList.add('viewport-mobile');
        contentEl.style.maxWidth = '375px';
      } else if (size === 'tablet') {
        contentEl.classList.add('viewport-tablet');
        contentEl.style.maxWidth = '768px';
      } else {
        contentEl.classList.add('viewport-desktop');
        contentEl.style.maxWidth = '100%';
      }
      
      // Center content for mobile and tablet
      if (size !== 'desktop') {
        contentEl.style.margin = '0 auto';
      } else {
        contentEl.style.margin = '';
      }
    }
  };
  
  return (
    <div className="live-builder-toolbar fixed top-0 left-0 right-0 bg-gray-800 text-white h-16 z-50 shadow-md">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* Left side: Back button and page title */}
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={onExit}
            className="text-white hover:text-gray-300"
            title="Exit Live Builder"
          >
            <FiArrowLeft size={20} />
          </button>
          
          <div className="font-medium truncate max-w-md">
            {pageTitle}
          </div>
          
          {isPublished ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Published
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Draft
            </span>
          )}
        </div>
        
        {/* Middle: Viewport controls */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => handleViewportChange('mobile')}
            className={`p-2 rounded ${viewportSize === 'mobile' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            title="Mobile View"
          >
            <FiSmartphone size={20} />
          </button>
          
          <button
            type="button"
            onClick={() => handleViewportChange('tablet')}
            className={`p-2 rounded ${viewportSize === 'tablet' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            title="Tablet View"
          >
            <FiTablet size={20} />
          </button>
          
          <button
            type="button"
            onClick={() => handleViewportChange('desktop')}
            className={`p-2 rounded ${viewportSize === 'desktop' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            title="Desktop View"
          >
            <FiMonitor size={20} />
          </button>
        </div>
        
        {/* Right side: Actions */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowPageSettings(true)}
            className="px-3 py-2 rounded hover:bg-gray-700"
            title="Page Settings"
          >
            <FiSettings size={18} />
          </button>
          
          <button
            type="button"
            onClick={() => window.open(`/preview/${pageData?.slug}`, '_blank')}
            className="px-3 py-2 rounded hover:bg-gray-700"
            title="Preview Page"
          >
            <FiEye size={18} />
          </button>
          
          <button
            type="button"
            onClick={onSave}
            disabled={!hasPendingChanges}
            className={`flex items-center px-4 py-2 rounded ${
              hasPendingChanges 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-blue-500 opacity-50 cursor-not-allowed'
            }`}
            title="Save Changes"
          >
            <FiSave size={18} className="mr-2" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveBuilderToolbar;