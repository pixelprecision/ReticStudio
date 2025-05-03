// resources/js/admin/src/components/pageBuilder/LiveBuilder.jsx
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getComponents } from '../../api/componentsApi';
import { FiPlus, FiSettings, FiX, FiEye, FiSave, FiArrowLeft } from 'react-icons/fi';
import LiveComponentEditor from './LiveComponentEditor';
import LiveBuilderToolbar from './LiveBuilderToolbar';
import LiveBuilderComponentList from './LiveBuilderComponentList';
import MediaLibraryModal from '../media/MediaBrowser';
import AIComponentAssistant from './AIComponentAssistant';

/**
 * LiveBuilder - A full page, WYSIWYG page builder that allows editing components in place
 */
const LiveBuilder = ({ 
  value, 
  onChange, 
  onSave, 
  onExit, 
  pageData 
}) => {
  // State for component data and UI
  const [components, setComponents] = useState([]);
  const [availableComponents, setAvailableComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeComponentId, setActiveComponentId] = useState(null);
  const [showComponentList, setShowComponentList] = useState(false);
  const [insertPosition, setInsertPosition] = useState(null);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [activeMediaField, setActiveMediaField] = useState(null);
  const [pendingChanges, setPendingChanges] = useState(false);
  
  const pageRef = useRef(null);

  // Initialize components from prop value
  useEffect(() => {
    if (value) {
      try {
        const parsedComponents = Array.isArray(value) ? value : JSON.parse(value);
        setComponents(parsedComponents);
      } catch (error) {
        console.error('Error parsing page components:', error);
        setComponents([]);
      }
    } else {
      setComponents([]);
    }
  }, [value]);

  // Fetch available component types
  useEffect(() => {
    fetchAvailableComponents();
  }, []);

  const fetchAvailableComponents = async () => {
    setLoading(true);
    try {
      const response = await getComponents({ is_active: true });
      setAvailableComponents(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching components:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save changes to the parent component
  const saveChanges = () => {
    if (onChange) {
      // First, update the parent component with the current components
      onChange(components);
      
      // Then trigger the save action
      if (onSave) {
        // We're not passing components directly to onSave anymore
        // because the parent needs to use its updated state
        onSave();
      }
      
      setPendingChanges(false);
    }
  };

  // Handle component updates
  const handleComponentUpdate = (componentId, updatedProps) => {
    // For debugging
    console.log('Updating component:', componentId);
    console.log('Updated props:', updatedProps);
    
    // Use the functional form of setState to ensure we're working with the latest state
    setComponents(currentComponents => {
      const updatedComponents = currentComponents.map(component => {
        if (component.id === componentId) {
          // Create a clean copy to prevent reference issues
          const updatedComponent = {
            ...component,
            props: {
              ...component.props
            }
          };
          
          // Special handling for dynamic AI components
          if (component.type === 'dynamic-ai' && component.props.settings) {
            // Copy the existing settings
            updatedComponent.props.settings = { ...component.props.settings };
            
            // Process each updated prop
            Object.keys(updatedProps).forEach(key => {
              if (key === 'description') {
                // Update the component description
                updatedComponent.props.description = updatedProps[key];
              } 
              else if (key.startsWith('setting_')) {
                // Update the settings object for settings fields
                const settingKey = key.replace('setting_', '');
                updatedComponent.props.settings[settingKey] = updatedProps[key];
              } 
              else {
                // For other fields, update directly
                updatedComponent.props[key] = updatedProps[key];
              }
            });
          } 
          else {
            // Standard component updates
            // Apply updates, making sure arrays are copied properly
            Object.keys(updatedProps).forEach(key => {
              if (Array.isArray(updatedProps[key])) {
                // For arrays, do a deep copy
                updatedComponent.props[key] = JSON.parse(JSON.stringify(updatedProps[key]));
              } else {
                updatedComponent.props[key] = updatedProps[key];
              }
            });
          }
          
          return updatedComponent;
        }
        return component;
      });
      
      // Immediately notify the parent of the updated components
      // This ensures changes propagate up to the page data without waiting for a save
      if (onChange) {
        setTimeout(() => {
          onChange(updatedComponents);
        }, 0);
      }
      
      return updatedComponents;
    });
    
    setPendingChanges(true);
  };

  // Handle adding a new component
  const handleAddComponent = (componentType, position) => {
    const componentDefinition = availableComponents.find(c => c.slug === componentType);
    if (!componentDefinition) return;

    // Parse the schema if it's a string
    const schema = typeof componentDefinition.schema === 'string' 
      ? JSON.parse(componentDefinition.schema) 
      : componentDefinition.schema;

    // Create a new component with default values
    const newComponent = {
      id: `${componentType}-${Date.now()}`,
      type: componentType,
      props: schema && schema.properties ? Object.keys(schema.properties).reduce((acc, key) => {
        const prop = schema.properties[key];
        
        // Handle arrays
        if (prop.type === 'array' && typeof prop.default === 'string') {
          try {
            acc[key] = JSON.parse(prop.default);
          } catch (e) {
            console.error('Error parsing default array value:', e);
            acc[key] = [];
          }
        } else {
          acc[key] = prop.default !== undefined ? prop.default : '';
        }
        
        return acc;
      }, {}) : {},
    };

    // Use functional state update to ensure consistency
    setComponents(currentComponents => {
      // Insert the component at the specified position
      const updatedComponents = [...currentComponents];
      if (position !== undefined && position >= 0 && position <= currentComponents.length) {
        updatedComponents.splice(position, 0, newComponent);
      } else {
        updatedComponents.push(newComponent);
      }
      
      return updatedComponents;
    });
    
    setPendingChanges(true);
    setShowComponentList(false);
    setActiveComponentId(newComponent.id);
  };

  // Handle component removal
  const handleRemoveComponent = (componentId) => {
    if (window.confirm('Are you sure you want to remove this component?')) {
      setComponents(currentComponents => 
        currentComponents.filter(component => component.id !== componentId)
      );
      
      setPendingChanges(true);
      
      if (activeComponentId === componentId) {
        setActiveComponentId(null);
      }
    }
  };

  // Handle moving components
  const handleMoveComponent = (componentId, direction) => {
    setComponents(currentComponents => {
      const currentIndex = currentComponents.findIndex(c => c.id === componentId);
      if (currentIndex === -1) return currentComponents;
      
      const newIndex = direction === 'up' 
        ? Math.max(0, currentIndex - 1) 
        : Math.min(currentComponents.length - 1, currentIndex + 1);
      
      if (newIndex === currentIndex) return currentComponents;
      
      const updatedComponents = [...currentComponents];
      const [movedComponent] = updatedComponents.splice(currentIndex, 1);
      updatedComponents.splice(newIndex, 0, movedComponent);
      
      return updatedComponents;
    });
    
    setPendingChanges(true);
  };

  // Add button between components
  const ComponentAddButton = ({ position }) => {
    return (
      <div className="component-add-button flex justify-center my-2">
        <button 
          type="button"
          onClick={() => {
            setInsertPosition(position);
            setShowComponentList(true);
          }}
          className="p-2 bg-blue-500 rounded-full text-white hover:bg-blue-600 shadow-sm transition-colors"
        >
          <FiPlus />
        </button>
      </div>
    );
  };

  // Update media field for a component
  const handleMediaSelected = (mediaItem) => {
    if (!activeMediaField || !activeComponentId) return;
    
    handleComponentUpdate(activeComponentId, {
      [activeMediaField]: mediaItem.url
    });
    
    setShowMediaLibrary(false);
    setActiveMediaField(null);
  };
  
  // Handle AI-generated component
  const handleAIComponentCreated = (componentData) => {
    // Generate a unique ID for the component
    const aiComponent = {
      ...componentData,
      id: `${componentData.type}-${Date.now()}`
    };
    
    // Add the new component to the end of the list using functional update
    setComponents(currentComponents => [...currentComponents, aiComponent]);
    setPendingChanges(true);
    
    // Activate the new component
    setActiveComponentId(aiComponent.id);
    
    // Scroll to the new component (using setTimeout to wait for render)
    setTimeout(() => {
      const newComponentElement = document.getElementById(aiComponent.id);
      if (newComponentElement) {
        newComponentElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Render the LiveBuilder
  return (
    <div className="live-builder relative min-h-screen">
      {/* Top Toolbar */}
      <LiveBuilderToolbar 
        onSave={saveChanges} 
        onExit={onExit} 
        hasPendingChanges={pendingChanges}
        pageData={pageData}
      />
      
      {/* Main Content Area */}
      <div 
        className="live-builder-content pt-16 pb-8 min-h-screen"
        ref={pageRef}
      >
        {/* Placeholder if no components */}
        {components.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg mx-4 my-8">
            <p className="text-gray-500 mb-4">This page is empty</p>
            <button
              type="button"
              onClick={() => {
                setInsertPosition(0);
                setShowComponentList(true);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              <FiPlus className="inline-block mr-2" />
              Add Component
            </button>
          </div>
        )}
        
        {/* Component List */}
        {components.length > 0 && (
          <div className="live-components">
            {/* First add button */}
            <ComponentAddButton position={0} />
            
            {/* Render each component with edit capabilities */}
            {components.map((component, index) => (
              <React.Fragment key={component.id}>
                <LiveComponentEditor
                  component={component}
                  isActive={activeComponentId === component.id}
                  onActivate={() => setActiveComponentId(component.id)}
                  onDeactivate={() => setActiveComponentId(null)}
                  onUpdate={(props) => handleComponentUpdate(component.id, props)}
                  onRemove={() => handleRemoveComponent(component.id)}
                  onMoveUp={() => handleMoveComponent(component.id, 'up')}
                  onMoveDown={() => handleMoveComponent(component.id, 'down')}
                  onMediaFieldClick={(fieldName) => {
                    setActiveComponentId(component.id);
                    setActiveMediaField(fieldName);
                    setShowMediaLibrary(true);
                  }}
                  availableComponents={availableComponents}
                />
                {/* Add button after each component */}
                <ComponentAddButton position={index + 1} />
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
      
      {/* Component Selection Modal */}
      {showComponentList && (
        <LiveBuilderComponentList
          components={availableComponents}
          onSelect={(componentType) => handleAddComponent(componentType, insertPosition)}
          onClose={() => setShowComponentList(false)}
        />
      )}
      
      {/* Media Library Modal */}
      {showMediaLibrary && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-medium">Select Media</h3>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowMediaLibrary(false)}
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
              <MediaLibraryModal 
                onSelect={handleMediaSelected}
                onClose={() => setShowMediaLibrary(false)} 
              />
            </div>
          </div>
        </div>
      )}
      
      {/* AI Component Assistant */}
      <AIComponentAssistant onCreateComponent={handleAIComponentCreated} />
    </div>
  );
};

export default LiveBuilder;