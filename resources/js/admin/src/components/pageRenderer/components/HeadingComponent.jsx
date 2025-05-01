// resources/js/admin/src/components/pageRenderer/components/HeadingComponent.jsx
import React from 'react';

const HeadingComponent = ({ level = 'h1', text, alignment, componentId }) => {
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };
  
  const alignClass = alignmentClasses[alignment] || '';
  
  const Tag = level;
  
  const headingClasses = {
    h1: 'text-4xl font-bold mb-6',
    h2: 'text-3xl font-bold mb-5',
    h3: 'text-2xl font-bold mb-4',
    h4: 'text-xl font-bold mb-3',
    h5: 'text-lg font-bold mb-2',
    h6: 'text-base font-bold mb-2'
  };
  
  const classes = `${headingClasses[level] || headingClasses.h1} ${alignClass}`;
  
  return (
    <Tag id={componentId} className={classes}>
      {text}
    </Tag>
  );
};

export default HeadingComponent;