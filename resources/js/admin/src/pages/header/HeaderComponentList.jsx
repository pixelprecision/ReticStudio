// resources/js/admin/src/pages/header/HeaderComponentList.jsx
import React from 'react';
import { useDrag } from 'react-dnd';
import { FiImage, FiMenu, FiSearch, FiUser, FiShoppingCart, FiBox } from 'react-icons/fi';

// Component item that can be dragged
const DraggableComponent = ({ component, isSource }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'HEADER_COMPONENT',
    item: { 
      id: component.id, 
      type: component.type, 
      name: component.name,
      isNew: isSource // Indicate this is a new component if from source list
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
        flex items-center p-3 mb-2 rounded-md cursor-pointer select-none
        ${isSource ? 'bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-200' : 'bg-white border border-gray-200'}
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
    >
      <div className="mr-3 text-gray-600">
        {getIcon(component.type)}
      </div>
      <div>
        <p className="font-medium text-gray-700">{component.name}</p>
        {component.description && (
          <p className="text-xs text-gray-500">{component.description}</p>
        )}
      </div>
    </div>
  );
};

// List of components that can be dragged
const HeaderComponentList = ({ components, isSource }) => {
  return (
    <div className="space-y-2">
      {components.map((component) => (
        <DraggableComponent 
          key={isSource ? component.type : component.id} 
          component={component} 
          isSource={isSource}
        />
      ))}
      
      {components.length === 0 && (
        <div className="text-center p-4 text-gray-500 italic">
          No components available
        </div>
      )}
    </div>
  );
};

export default HeaderComponentList;