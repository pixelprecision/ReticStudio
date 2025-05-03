// resources/js/admin/src/pages/header/HeaderDropZone.jsx
import React, { useState, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { FiEdit2, FiTrash2, FiMove } from 'react-icons/fi';
import { useDrag } from 'react-dnd';

// A component that can be both dragged and have things dropped on it
const DraggableItem = ({ component, index, position, moveItem, onDelete, onEdit }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'HEADER_COMPONENT',
    item: { 
      id: component.id, 
      type: component.type, 
      index, 
      position,
      name: component.name 
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'HEADER_COMPONENT',
    hover(item, monitor) {
      if (!drag) {
        return;
      }
      
      // Don't replace items with themselves
      if (item.id === component.id) {
        return;
      }
      
      // Don't process hover for new components from palette
      if (item.isNew) {
        return;
      }
      
      // Only reorder if in the same section
      if (item.position === position) {
        moveItem(item.index, index);
        // Note: we're mutating the monitor item here, but it's fine for DnD since
        // we're dealing with indices rather than specific data
        item.index = index;
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div 
      ref={(node) => drag(drop(node))}
      className={`
        p-3 mb-2 border rounded-md shadow-sm flex items-center justify-between
        ${isDragging ? 'opacity-50 bg-gray-50' : 'bg-white'}
        ${isOver ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}
      `}
    >
      <div className="flex items-center">
        <FiMove className="text-gray-400 mr-3 cursor-move" />
        <div>
          <p className="font-medium">{component.name}</p>
          <p className="text-xs text-gray-500">{component.type}</p>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => onEdit(component)}
          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
          title="Edit component"
        >
          <FiEdit2 size={16} />
        </button>
        
        <button
          type="button"
          onClick={() => onDelete(component)}
          className="p-1 text-red-600 hover:bg-red-50 rounded"
          title="Delete component"
        >
          <FiTrash2 size={16} />
        </button>
      </div>
    </div>
  );
};

// Component for dropping items into a specific position
const HeaderDropZone = ({ position, components, onDrop, onReorder, onDelete, onEdit }) => {
  const [localComponents, setLocalComponents] = useState(components);
  
  // Update local state when props change
  React.useEffect(() => {
    setLocalComponents(components);
  }, [components]);
  
  // Move an item in the ordered list
  const moveItem = useCallback((fromIndex, toIndex) => {
    const updatedComponents = [...localComponents];
    const [movedItem] = updatedComponents.splice(fromIndex, 1);
    updatedComponents.splice(toIndex, 0, movedItem);
    
    setLocalComponents(updatedComponents);
    onReorder(position, updatedComponents);
  }, [localComponents, onReorder, position]);
  
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'HEADER_COMPONENT',
    drop: (item, monitor) => {
      console.log('Drop detected in position:', position);
      console.log('Item being dropped:', item);
      
      // Detect if this is a drop from palette
      const isPaletteComponent = item.isNew === true;
      console.log('Is palette component:', isPaletteComponent);
      
      // Handle three cases:
      // 1. A new component from the palette
      // 2. A component from another section (header/topbar/subheader)
      // 3. Reordering within the same section
      if (isPaletteComponent) {
        // New component from palette
        console.log('Dropping new component from palette', item);
        onDrop(item, position);
        return { dropResult: 'new_component_added', position };
      } else if (item.index !== undefined && item.position !== position) {
        // Moving component from one section to another
        console.log('Moving component between sections', item, 'to', position);
        onDrop(item, position);
        return { dropResult: 'component_moved', position };
      } else if (item.index !== undefined) {
        // Just reordering within the same section - already handled by moveItem
        console.log('Reordering within section', position);
        return { dropResult: 'component_reordered', position };
      }
      
      // Return a result to confirm the drop was handled
      return { position, handled: true };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`
        min-h-[120px] p-4 rounded-lg border-2 border-dashed transition-colors duration-200
        ${isOver && canDrop ? 'border-blue-500 bg-blue-50 shadow-inner' : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50/30'}
        ${localComponents.length === 0 ? 'flex items-center justify-center' : ''}
      `}
      data-testid={`dropzone-${position}`}
    >
      {localComponents.length > 0 ? (
        <div className="space-y-2">
          {localComponents.map((component, index) => (
            <DraggableItem
              key={component.id}
              component={component}
              index={index}
              position={position}
              moveItem={moveItem}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-4">
          <svg className="w-8 h-8 text-gray-400 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
          </svg>
          <p className="text-gray-500 text-sm font-medium">
            Drag components here
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Drop items from the palette to add them to this section
          </p>
        </div>
      )}
    </div>
  );
};

export default HeaderDropZone;