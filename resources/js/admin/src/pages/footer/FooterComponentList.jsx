// resources/js/admin/src/pages/footer/FooterComponentList.jsx
import React, { useState } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { createComponent } from '../../api/footerApi';
import { toast } from 'react-toastify';
import ComponentPalette from './ComponentPalette';

const FooterComponentList = ({ 
  components, 
  layoutId, 
  position,
  onEdit, 
  onUpdate, 
  onAdd,
  onDelete,
  onSave,
  menus,
  pageComponents,
  isDragging,
  setIsDragging
}) => {
  const [isAddingComponent, setIsAddingComponent] = useState(false);

  // Filter components by position
  const filteredComponents = components.filter(
    comp => comp.position === position
  ).sort((a, b) => a.order - b.order);

  // Drag handlers are now in the parent component - FooterEditor

  const handleAddComponent = async (type) => {
    try {
      // Get the highest order number for the current position
      const maxOrder = filteredComponents.length > 0
        ? Math.max(...filteredComponents.map(comp => comp.order))
        : 0;
        
      // Default settings based on component type
      let settings = {};
      let name = '';
      
      switch (type) {
        case 'logo':
          name = 'Logo';
          settings = {};
          break;
        case 'menu':
          name = 'Menu';
          settings = { menu_id: menus.length > 0 ? menus[0].id : null, title: 'Menu' };
          break;
        case 'text':
          name = 'Text';
          settings = { text: 'Add your content here', title: 'About Us' };
          break;
        case 'social':
          name = 'Social Links';
          settings = {
            title: 'Follow Us',
            networks: [
              { name: 'facebook', url: 'https://facebook.com' },
              { name: 'twitter', url: 'https://twitter.com' },
              { name: 'instagram', url: 'https://instagram.com' }
            ]
          };
          break;
        case 'contact':
          name = 'Contact Info';
          settings = {
            title: 'Contact Us',
            address: '123 Street Name, City, Country',
            phone: '+1 (555) 123-4567',
            email: 'info@example.com'
          };
          break;
        case 'copyright':
          name = 'Copyright';
          settings = { text: `© ${new Date().getFullYear()} Your Company. All rights reserved.` };
          break;
        case 'component':
          name = 'Component';
          settings = { 
            component_id: pageComponents.length > 0 ? pageComponents[0].id : null,
            title: 'Component' 
          };
          break;
        default:
          name = 'New Component';
          settings = {};
      }
      
      // Create new component data
      const newComponentData = {
        name,
        type,
        position,
        column: position.startsWith('column_') ? parseInt(position.split('_')[1]) : null,
        footer_layout_id: layoutId,
        settings,
        is_active: true,
        order: maxOrder + 1,
        visibility: 'all'
      };
      
      // Save to server
      const response = await createComponent(newComponentData);
      
      if (response.data.success) {
        toast.success(`Added new ${type} component`);
        onAdd(response.data.data);
      } else {
        toast.error('Failed to add component');
      }
      
      setIsAddingComponent(false);
    } catch (error) {
      console.error('Error adding component:', error);
      toast.error('Failed to add component. Please try again.');
      setIsAddingComponent(false);
    }
  };

  const renderComponentIcon = (type) => {
    switch (type) {
      case 'logo':
        return <i className="fa-solid fa-image text-blue-500"></i>;
      case 'menu':
        return <i className="fa-solid fa-bars text-green-500"></i>;
      case 'text':
        return <i className="fa-solid fa-align-left text-purple-500"></i>;
      case 'social':
        return <i className="fa-solid fa-share-nodes text-pink-500"></i>;
      case 'contact':
        return <i className="fa-solid fa-address-card text-yellow-500"></i>;
      case 'copyright':
        return <i className="fa-solid fa-copyright text-gray-500"></i>;
      case 'component':
        return <i className="fa-solid fa-puzzle-piece text-indigo-500"></i>;
      default:
        return <i className="fa-solid fa-cube text-gray-500"></i>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
        <h3 className="font-semibold text-gray-700">
          {position === 'footer_bar' ? 'Footer Bar Components' : 'Footer Components'}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsAddingComponent(!isAddingComponent)}
            className="p-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <i className="fa-solid fa-plus mr-1"></i>
            Add
          </button>
          <button
            onClick={() => onSave(components)}
            className="p-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <i className="fa-solid fa-floppy-disk mr-1"></i>
            Save
          </button>
        </div>
      </div>

      {isAddingComponent && (
        <ComponentPalette 
          onSelect={handleAddComponent}
          onCancel={() => setIsAddingComponent(false)}
        />
      )}

      <div className="p-4">
        {filteredComponents.length === 0 ? (
          <p className="text-center text-gray-500 my-8">
            No components in this section yet.
            <br />
            Click "Add" to add a component.
          </p>
        ) : (
          <Droppable droppableId={`footer-components-${position}`}>
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {filteredComponents.map((component, index) => (
                  <Draggable
                    key={component.id.toString()}
                    draggableId={component.id.toString()}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`border rounded-md p-3 bg-white ${
                          snapshot.isDragging
                            ? 'shadow-lg border-indigo-300'
                            : 'shadow-sm'
                        } ${component.is_active ? '' : 'opacity-60'}`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3 flex-1">
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-move text-gray-400 hover:text-gray-600"
                            >
                              <i className="fa-solid fa-grip-vertical"></i>
                            </div>
                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
                              {renderComponentIcon(component.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">
                                {component.name}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {component.type.charAt(0).toUpperCase() + component.type.slice(1)}
                                {component.position.startsWith('column_') && 
                                  ` - Column ${component.column}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => onEdit(component)}
                              className="p-1 text-gray-500 hover:text-indigo-600"
                              title="Edit component"
                            >
                              <i className="fa-solid fa-pen-to-square"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        )}
      </div>
    </div>
  );
};

export default FooterComponentList;