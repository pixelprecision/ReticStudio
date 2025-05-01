// resources/js/admin/src/components/pageRenderer/PageRenderer.jsx
import React from 'react';
import ComponentRenderer from './ComponentRenderer';

/**
 * Renders an entire page based on the provided content
 */
const PageRenderer = ({ content }) => {
  // If content is a string (JSON), parse it
  const contentArray = typeof content === 'string' 
    ? JSON.parse(content) 
    : Array.isArray(content) 
      ? content 
      : [];

  // If no content or empty array, show placeholder
  if (!contentArray || contentArray.length === 0) {
    return (
      <div className="page-renderer-empty text-center py-12">
        <p className="text-gray-500">No content to display</p>
      </div>
    );
  }

  return (
    <div className="page-renderer">
      {contentArray.map((component) => (
        <ComponentRenderer key={component.id} component={component} />
      ))}
    </div>
  );
};

export default PageRenderer;