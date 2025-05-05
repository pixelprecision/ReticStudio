// resources/js/admin/src/pages/header/HeaderDropZone.jsx
import React, { useState, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { FiEdit2, FiTrash2, FiMove } from 'react-icons/fi';
import { useDrag } from 'react-dnd';

// A component that can be both dragged and have things dropped on it
const DraggableItem = ({ component, index, position, moveItem, onDelete, onReorder, localComponents, onEdit }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'HEADER_COMPONENT',
    item: {
      id: component.id,
      type: component.type,
      index,
      position,
      name: component.name,
      component: component // Pass the entire component for easier handling
    },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();

      // If there's no drop result, the drag was cancelled
      if (!dropResult) {
        return;
      }

      console.log('Drag ended with result:', dropResult);

      // If this was a drag within the same section, tell the parent component to save changes
      if (dropResult.draggedWithinSection) {
        onReorder(position, localComponents);
      }
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  // Ref for the item itself
  const itemRef = React.useRef(null);

  const [{ isOver }, drop] = useDrop({
    accept: 'HEADER_COMPONENT',
    hover(item, monitor) {
      if (!itemRef.current) {
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

      // Get current item's dimensions and position
      const hoverBoundingRect = itemRef.current.getBoundingClientRect();

      // Get middle Y position of the item
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Get mouse position
      const clientOffset = monitor.getClientOffset();

      // Get mouse Y position relative to the item
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only reorder if in the same section
      if (item.position === position) {
        // Dragging downwards, only move when cursor is below 50% of the item height
        if (item.index < index && hoverClientY < hoverMiddleY) {
          return;
        }

        // Dragging upwards, only move when cursor is above 50% of the item height
        if (item.index > index && hoverClientY > hoverMiddleY) {
          return;
        }

        // Perform the move
        moveItem(item.index, index);

        // Update the index in the monitor item
        item.index = index;

        // Flag to indicate this is an internal drag/drop
        item.draggedWithinSection = true;
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div
      ref={(node) => {
        drag(drop(node));
        itemRef.current = node;
      }}
      onMouseUp={() => {
        // This helps with drag operations within the same section
        if (isDragging) {
          console.log('Mouse up while dragging - cancelling drag');
          setIsDragging(false);
        }
      }}
      className={`
        p-4 my-4 border rounded-md shadow-sm flex items-center justify-between
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
    // Create a new copy of the components array to avoid mutation issues
    const updatedComponents = [...localComponents];

    // Get the component being moved
    const [movedItem] = updatedComponents.splice(fromIndex, 1);

    // Insert at the new position
    updatedComponents.splice(toIndex, 0, movedItem);

    console.log('Moving item from index', fromIndex, 'to index', toIndex);
    console.log('Updated components:', updatedComponents.map(c => c.name));

    // Only update local state - we'll call onReorder when the drag is complete
    setLocalComponents(updatedComponents);
  }, [localComponents, position]);

  // State variables for drag tracking
  const [hoverIndex, setHoverIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Create a ref for the drop zone element
  const dropRef = React.useRef(null);

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'HEADER_COMPONENT',
    hover: (item, monitor) => {
      // Set dragging state to true when any hover is detected
      setIsDragging(true);

      const draggedIndex = item.index;
      const hoverBoundingRect = dropRef.current?.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();

      if (!hoverBoundingRect || !clientOffset) return;

      // Get mouse position within the drop zone
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Calculate the height of the drop zone and individual items
      const dropZoneHeight = hoverBoundingRect.height;
      const itemHeight = localComponents.length > 0 ? dropZoneHeight / localComponents.length : dropZoneHeight;

      // Determine which index we're hovering over
      let newHoverIndex;

      if (localComponents.length === 0) {
        // If no components, we're hovering over the empty dropzone
        newHoverIndex = 0;
      } else {
        // Calculate the index based on mouse position
        // Use percentage of the way through the drop zone
        const relativePosition = hoverClientY / dropZoneHeight;
        newHoverIndex = Math.floor(relativePosition * (localComponents.length + 1));

        // Clamp to valid range
        newHoverIndex = Math.max(0, Math.min(newHoverIndex, localComponents.length));
      }

      // Update hover index if it changed
      if (newHoverIndex !== hoverIndex) {
        setHoverIndex(newHoverIndex);
      }
    },
    drop: (item, monitor) => {
      // Reset dragging state when drop completes
      setIsDragging(false);
      console.log('Drop detected in position:', position);
      console.log('Item being dropped:', item);
      console.log('Current hover index:', hoverIndex);

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
      } else if (item.position !== position) {
        // Moving component from one section to another
        console.log('Moving component between sections', item, 'to', position);
        onDrop(item, position);
        return { dropResult: 'component_moved', position };
      } else if (item.draggedWithinSection || (hoverIndex !== null && item.index !== hoverIndex)) {
        // Reordering within the same section
        console.log('Reordering within section', position, 'from index', item.index, 'to target:', hoverIndex);

        // If the item has draggedWithinSection flag, it means the reordering was
        // already handled by the hover handler, so we just need to save changes
        if (item.draggedWithinSection) {
          // Call the onReorder handler with the current local components
          onReorder(position, localComponents);
        } else {
          // Create a copy of the components array
          const updatedComponents = [...localComponents];

          // Get the component being moved
          const [movedComponent] = updatedComponents.splice(item.index, 1);

          // Adjust the target index if we're moving down
          const targetIndex = hoverIndex > item.index ?
                             (hoverIndex > updatedComponents.length ? updatedComponents.length : hoverIndex - 1) :
                             hoverIndex;

          // Insert at the new position
          updatedComponents.splice(targetIndex, 0, movedComponent);

          // Call the onReorder handler with the updated list
          onReorder(position, updatedComponents);
        }

        setHoverIndex(null);
        return { dropResult: 'component_reordered', position, draggedWithinSection: true };
      }

      // Clear the hover index even if we didn't perform an action
      setHoverIndex(null);

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
      ref={(node) => {
        drop(node);
        dropRef.current = node;
      }}
      className={`
        min-h-[120px] p-6 rounded-lg border-2 border-dashed transition-colors duration-200
        ${isOver && canDrop ? 'border-blue-500 bg-blue-50 shadow-inner' : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50/30'}
        ${localComponents.length === 0 ? 'flex items-center justify-center' : ''}
      `}
      data-testid={`dropzone-${position}`}
    >
      {/* Drop indicator at the top of the container */}
      {isOver && hoverIndex === 0 && (
        <div className="h-4 -mt-2 mb-4 border-t-4 border-blue-500 rounded-full bg-blue-100 transition-all duration-200"></div>
      )}
      {localComponents.length > 0 ? (
        <div className="space-y-6">
          {localComponents.map((component, index) => (
            <div key={component.id} className="relative">
              {/* Drop indicator before this component */}
              {isOver && hoverIndex === index && hoverIndex !== 0   && (
                  <div className="h-9 mb-4 border-b-4 border-blue-500 rounded-full bg-blue-100 transition-all duration-200"></div>
              )}

              <DraggableItem
                component={component}
                index={index}
                position={position}
                moveItem={moveItem}
                onDelete={onDelete}
                onEdit={onEdit}
                onReorder={onReorder}
                localComponents={localComponents}
              />

              {/* Drop indicator after this component */}
              {isOver && hoverIndex === index + 1 && hoverIndex !== localComponents.length && hoverIndex !== 0 && (
                  <div className="h-9 mt-4 border-t-4 border-blue-500 rounded-full bg-blue-100 transition-all duration-200"></div>
              )}
            </div>
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

      {/* Bottom drop indicator shown when position is at end of list or when list is empty */}
      {isOver && (localComponents.length === 0 || hoverIndex === localComponents.length) && (
        <div className="h-4 my-4 border-t-4 border-blue-500 rounded-full bg-blue-100 transition-all duration-200"></div>
      )}
    </div>
  );
};

export default HeaderDropZone;
