// resources/js/admin/src/components/pageRenderer/components/TextComponent.jsx
import React from 'react';

const TextComponent = ({ content, componentId }) => {
  // Function to create markup for HTML content
  const createMarkup = () => {
    return { __html: content };
  };

  return (
    <div 
      id={componentId} 
      className="text-component mb-6"
      dangerouslySetInnerHTML={createMarkup()}
    />
  );
};

export default TextComponent;