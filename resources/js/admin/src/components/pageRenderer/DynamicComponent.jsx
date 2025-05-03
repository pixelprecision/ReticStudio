import React, { useEffect, useRef } from 'react';

/**
 * Dynamic Component that renders HTML, CSS and JS created at runtime
 * without requiring a static component file
 */
const DynamicComponent = ({ content, settings }) => {
  const containerRef = useRef(null);
  
  // Apply the dynamic content and execute JS when the component mounts or content changes
  useEffect(() => {
    if (!containerRef.current || !content) return;
    
    // Create a stable ID for the style tag
    const styleId = `dynamic-style-${content.id || Date.now()}`;
    let styleTag = document.getElementById(styleId);
    
    // Apply HTML content
    if (content.html) {
      containerRef.current.innerHTML = content.html;
    }
    
    // Apply CSS by creating a style tag
    if (content.css) {
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = styleId;
        document.head.appendChild(styleTag);
      }
      
      styleTag.textContent = content.css;
    }
    
    // Execute JavaScript if provided
    if (content.js) {
      try {
        // Create a function that will execute in the context of the component
        const executeScript = new Function('container', 'settings', content.js);
        executeScript(containerRef.current, settings);
      } catch (error) {
        console.error('Error executing dynamic component script:', error);
      }
    }
    
    // Clean up function to remove the style tag when component unmounts
    return () => {
      if (styleTag && document.getElementById(styleId)) {
        document.head.removeChild(styleTag);
      }
    };
    // Ensure we only depend on stable identifiers to prevent re-running unnecessarily
  }, [content?.id, content?.html, content?.css, content?.js, JSON.stringify(settings)]);
  
  return (
    <div className="dynamic-component ai-component" id={content.id} ref={containerRef}></div>
  );
};

export default DynamicComponent;