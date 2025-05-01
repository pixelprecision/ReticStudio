// resources/js/admin/src/components/pageRenderer/ComponentRenderer.jsx
import React from 'react';
import HeadingComponent from './components/HeadingComponent';
import TextComponent from './components/TextComponent';
import ButtonComponent from './components/ButtonComponent';

/**
 * Component that renders different components based on their type
 */
const ComponentRenderer = ({ component }) => {
  if (!component || !component.type) {
    return null;
  }

  // Map of component types to their React components
  const componentMap = {
    heading: HeadingComponent,
    text: TextComponent,
    button: ButtonComponent,
    // Add more component types here as needed
  };

  // Get the component from the map
  const Component = componentMap[component.type];

  // If no matching component is found, render a placeholder
  if (!Component) {
    return (
      <div className="bg-gray-100 border border-gray-300 p-4 rounded my-4">
        <p className="text-gray-500">Unknown component type: {component.type}</p>
      </div>
    );
  }

  // Render the component with its props
  return <Component {...component.props} componentId={component.id} />;
};

export default ComponentRenderer;