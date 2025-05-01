// resources/js/admin/src/components/pageRenderer/components/DividerComponent.jsx
import React from 'react';

const DividerComponent = ({
  style = 'solid',
  color = 'gray',
  width = 'full',
  thickness = 'thin',
  margin = 'normal',
  componentId
}) => {
  // Style classes
  const styleClasses = {
    solid: 'border-solid',
    dashed: 'border-dashed',
    dotted: 'border-dotted',
    double: 'border-double'
  };

  // Color classes
  const colorClasses = {
    gray: 'border-gray-200',
    black: 'border-black',
    primary: 'border-blue-500',
    secondary: 'border-purple-500',
    success: 'border-green-500',
    danger: 'border-red-500',
    warning: 'border-yellow-500',
    info: 'border-blue-300'
  };

  // Width classes
  const widthClasses = {
    full: 'w-full',
    '3/4': 'w-3/4 mx-auto',
    '1/2': 'w-1/2 mx-auto',
    '1/4': 'w-1/4 mx-auto'
  };

  // Thickness classes
  const thicknessClasses = {
    thin: 'border-t',
    medium: 'border-t-2',
    thick: 'border-t-4'
  };

  // Margin classes
  const marginClasses = {
    small: 'my-2',
    normal: 'my-4',
    large: 'my-8',
    xlarge: 'my-12'
  };

  return (
    <hr
      id={componentId}
      className={`divider-component ${styleClasses[style] || 'border-solid'} ${colorClasses[color] || 'border-gray-200'} ${widthClasses[width] || 'w-full'} ${thicknessClasses[thickness] || 'border-t'} ${marginClasses[margin] || 'my-4'}`}
    />
  );
};

export default DividerComponent;
