// resources/js/admin/src/pages/header/ComponentPalette.jsx
import React from 'react';
import { useDrag } from 'react-dnd';
import { FiImage, FiMenu, FiSearch, FiUser, FiShoppingCart, FiBox, FiInfo } from 'react-icons/fi';

// Component template item that can be dragged from the palette
const DraggableTemplate = ({ template }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'HEADER_COMPONENT',
    item: { 
      type: template.type, 
      name: template.name,
      description: template.description,
      isNew: true, // Flag to indicate this is a new component from the palette
      settings: template.defaultSettings || {}, // Any default settings for this component type
    },
    end: (item, monitor) => {
      const didDrop = monitor.didDrop();
      if (!didDrop) {
        console.log('Drag ended without dropping');
      }
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  }));

  // Get the correct icon based on component type
  const getIcon = (type) => {
    switch(type) {
      case 'logo':
        return <FiImage className="w-5 h-5" />;
      case 'menu':
        return <FiMenu className="w-5 h-5" />;
      case 'search':
        return <FiSearch className="w-5 h-5" />;
      case 'auth':
        return <FiUser className="w-5 h-5" />;
      case 'cart':
        return <FiShoppingCart className="w-5 h-5" />;
      case 'custom':
      default:
        return <FiBox className="w-5 h-5" />;
    }
  };

  return (
    <div
      ref={drag}
      className={`
        flex items-center p-3 mb-2 rounded-md cursor-move select-none
        bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-200
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
    >
      <div className="mr-3 text-gray-600">
        {getIcon(template.type)}
      </div>
      <div>
        <p className="font-medium text-gray-700">{template.name}</p>
        {template.description && (
          <p className="text-xs text-gray-500">{template.description}</p>
        )}
      </div>
    </div>
  );
};

// Component palette that displays available component templates
const ComponentPalette = ({ templates }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="mb-3 flex items-center">
        <FiInfo className="mr-2 text-blue-500" />
        <h3 className="text-sm font-medium text-gray-900">Component Palette</h3>
      </div>
      
      <p className="text-xs text-gray-500 mb-4">
        Drag components from here to add them to your header sections.
      </p>
      
      <div className="space-y-2">
        {templates.map((template) => (
          <DraggableTemplate 
            key={template.type} 
            template={template} 
          />
        ))}
      </div>
    </div>
  );
};

export default ComponentPalette;