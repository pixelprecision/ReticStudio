// resources/js/admin/src/components/pageRenderer/components/ButtonComponent.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { extractArbitraryStyles, processArbitraryClasses } from '../../../utils/tailwindUtils';

const ButtonComponent = ({ 
  text, 
  link = '/', 
  style = 'primary', 
  size = 'md', 
  alignment = 'left', 
  target = '_self',
  componentId,
  extraClasses = ''
}) => {
  // Style classes based on the style prop
  const styleClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    info: 'bg-cyan-500 hover:bg-cyan-600 text-white',
    light: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    dark: 'bg-gray-800 hover:bg-gray-900 text-white'
  };

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-5 py-2.5',
    xl: 'text-lg px-6 py-3'
  };

  // Alignment classes for the container
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  // Base classes that all buttons will have
  const baseClasses = 'font-medium rounded-lg transition-colors duration-200 inline-block';
  
  // Combine all classes
  const buttonClasses = `${baseClasses} ${styleClasses[style] || styleClasses.primary} ${sizeClasses[size] || sizeClasses.md}`;
  
  // If link is external (starts with http or https), use regular anchor tag
  const isExternalLink = link.startsWith('http://') || link.startsWith('https://');
  
  // Process extraClasses to handle arbitrary Tailwind classes
  const { styles, remainingClasses } = extractArbitraryStyles(extraClasses);
  const processedExtraClasses = processArbitraryClasses(extraClasses);

  // The button container with alignment
  return (
    <div id={componentId} className={`button-component ${alignmentClasses[alignment] || ''} mb-6 ${processedExtraClasses}`} style={styles}>
      {isExternalLink ? (
        <a 
          href={link} 
          className={buttonClasses}
          target={target}
          rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        >
          {text}
        </a>
      ) : (
        <Link 
          to={link} 
          className={buttonClasses}
          target={target}
        >
          {text}
        </Link>
      )}
    </div>
  );
};

export default ButtonComponent;