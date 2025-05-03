// resources/js/admin/src/pages/footer/ComponentPalette.jsx
import React from 'react';
import { useDrag } from 'react-dnd';
import { FiImage, FiMenu, FiBox, FiInfo, FiMessageSquare, FiShare2, FiPhone, FiCopy, FiLayers } from 'react-icons/fi';

// Component template item that can be dragged from the palette
const DraggableTemplate = ({ template }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'FOOTER_COMPONENT',
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
      case 'text':
        return <FiMessageSquare className="w-5 h-5" />;
      case 'social':
        return <FiShare2 className="w-5 h-5" />;
      case 'contact':
        return <FiPhone className="w-5 h-5" />;
      case 'copyright':
        return <FiCopy className="w-5 h-5" />;
      case 'page_component':
        return <FiLayers className="w-5 h-5" />;
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

// Page component item for dragging
const DraggablePageComponent = ({ component }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'FOOTER_COMPONENT',
    item: { 
      type: 'page_component', 
      name: `${component.name} Component`,
      description: component.description,
      isNew: true,
      settings: { title: component.name },
      page_component_id: component.id
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  }));

  return (
    <div
      ref={drag}
      className={`
        flex items-center p-3 mb-2 rounded-md cursor-move select-none
        bg-white border border-gray-200 hover:bg-indigo-50 hover:border-indigo-200
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
    >
      <div className="mr-3 text-indigo-600">
        <FiLayers className="w-5 h-5" />
      </div>
      <div>
        <p className="font-medium text-gray-700">{component.name}</p>
        <p className="text-xs text-gray-500">
          {component.category && <span className="bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-sm mr-1">{component.category}</span>}
          {component.description ? component.description.substring(0, 40) + (component.description.length > 40 ? '...' : '') : 'Live page component'}
        </p>
      </div>
    </div>
  );
};

// Component palette that displays available component templates
const ComponentPalette = ({ templates, pageComponents = [] }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="mb-3 flex items-center">
        <FiInfo className="mr-2 text-blue-500" />
        <h3 className="text-sm font-medium text-gray-900">Component Palette</h3>
      </div>
      
      <p className="text-xs text-gray-500 mb-4">
        Drag components from here to add them to your footer sections.
      </p>
      
      <div className="space-y-2">
        <div className="py-2 mb-2">
          <h4 className="text-xs font-medium uppercase text-gray-500 mb-2">Standard Components</h4>
          {templates.map((template) => (
            <DraggableTemplate 
              key={template.type} 
              template={template} 
            />
          ))}
        </div>

        {pageComponents && pageComponents.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-xs font-medium uppercase text-gray-500 mb-2">Page Components</h4>
            {pageComponents.map((component) => (
              <DraggablePageComponent 
                key={component.id} 
                component={component} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComponentPalette;