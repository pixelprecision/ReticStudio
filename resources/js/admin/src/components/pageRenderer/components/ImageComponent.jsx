// resources/js/admin/src/components/pageRenderer/components/ImageComponent.jsx
import React from 'react';
import { extractArbitraryStyles, processArbitraryClasses } from '../../../utils/tailwindUtils';

const ImageComponent = ({
  src,
  alt = '',
  width = 'auto',
  height = 'auto',
  alignment = 'center',
  caption = '',
  componentId,
  extraClasses = ''
}) => {
  // Alignment classes
  const alignmentClasses = {
    left: 'mx-0',
    center: 'mx-auto',
    right: 'ml-auto'
  };

  // Process extraClasses to handle arbitrary Tailwind classes
  const { styles, remainingClasses } = extractArbitraryStyles(extraClasses);
  const processedExtraClasses = processArbitraryClasses(extraClasses);

  return (
    <figure 
      id={componentId} 
      className={`image-component mb-6 ${processedExtraClasses}`}
      style={styles}
    >
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`max-w-full ${alignmentClasses[alignment] || 'mx-auto'}`}
        style={{ display: 'block' }}
      />
      {caption && (
        <figcaption className={`text-sm text-gray-500 mt-2 ${alignment === 'center' ? 'text-center' : alignment === 'right' ? 'text-right' : 'text-left'}`}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
};

export default ImageComponent;
