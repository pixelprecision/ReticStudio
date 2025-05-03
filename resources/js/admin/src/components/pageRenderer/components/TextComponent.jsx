// resources/js/admin/src/components/pageRenderer/components/TextComponent.jsx
import React, { useEffect, useMemo } from 'react';
import { extractArbitraryStyles, processArbitraryClasses } from '../../../utils/tailwindUtils';

const TextComponent = ({ content, componentId, extraClasses }) => {
  // Function to create markup for HTML content
  const createMarkup = () => {
    return { __html: content };
  };

  // Process the extraClasses for Tailwind
  const processedExtraClasses = useMemo(() => {
    if (!extraClasses) return '';
    
    // First, try to convert any arbitrary values to standard format
    return processArbitraryClasses(extraClasses);
  }, [extraClasses]);
  
  // Also extract any arbitrary styles for inline application
  const { styles, remainingClasses } = useMemo(() => {
    return extractArbitraryStyles(extraClasses);
  }, [extraClasses]);
  
  // Log for debugging
  useEffect(() => {
    if (extraClasses && extraClasses.includes('[')) {
      console.log('TextComponent received class:', extraClasses);
      console.log('Processed to:', processedExtraClasses);
      console.log('Extracted inline styles:', styles);
    }
  }, [extraClasses, processedExtraClasses, styles]);

  // Base classes - use both approaches for maximum compatibility
  const baseClasses = `text-component mb-6 ${processedExtraClasses}`;

  return (
    <div
      id={componentId}
      className={baseClasses}
      dangerouslySetInnerHTML={createMarkup()}
      style={styles} // Apply extracted arbitrary values as inline styles
    />
  );
};

export default TextComponent;
