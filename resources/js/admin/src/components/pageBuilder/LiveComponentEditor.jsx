// resources/js/admin/src/components/pageBuilder/LiveComponentEditor.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FiSettings, FiTrash2, FiChevronUp, FiChevronDown, FiImage, FiX } from 'react-icons/fi';
import ComponentRenderer from '../pageRenderer/ComponentRenderer';
import ComponentSettings from './ComponentSettings';
import RichTextEditor from '../editors/RichTextEditor';

const LiveComponentEditor = ({
  component,
  isActive,
  onActivate,
  onDeactivate,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  onMediaFieldClick,
  availableComponents
}) => {
  const [editableFields, setEditableFields] = useState({});
  const [inlineEdit, setInlineEdit] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const componentRef = useRef(null);
  const inlineEditRef = useRef(null);
  const editorRef = useRef(null);
  
  // Memoize component definition and schema to prevent recreation on each render
  const componentDefinition = useMemo(() => 
    availableComponents.find(c => c.slug === component.type),
    [availableComponents, component.type]
  );
  
  // Parse the schema if it's a string - also memoized
  const schema = useMemo(() => {
    if (!componentDefinition || !componentDefinition.schema) return null;
    
    return typeof componentDefinition.schema === 'string'
      ? JSON.parse(componentDefinition.schema)
      : componentDefinition.schema;
  }, [componentDefinition]);
  
  // Find editable fields in the component schema - memoized
  const derivedEditableFields = useMemo(() => {
    // For standard components with a schema
    if (schema && schema.properties) {
      const fields = {};
      Object.keys(schema.properties).forEach(key => {
        const fieldSchema = schema.properties[key];
        // Consider a field editable if it's string, text, rich-text, or media type
        if (['string', 'text', 'rich-text', 'media'].includes(fieldSchema.type)) {
          fields[key] = {
            type: fieldSchema.type,
            value: component.props[key] || ''
          };
        }
      });
      return fields;
    }
    
    // Special handling for dynamic AI components
    if (component.type === 'dynamic-ai') {
      const fields = {};
      
      // Make the description editable
      if (component.props.description) {
        fields['description'] = {
          type: 'text',
          value: component.props.description
        };
      }
      
      // Make settings editable
      if (component.props.settings) {
        Object.keys(component.props.settings).forEach(key => {
          // Only add top-level string settings as editable
          const setting = component.props.settings[key];
          if (typeof setting === 'string' || typeof setting === 'number') {
            fields[`setting_${key}`] = {
              type: 'text',
              value: setting
            };
          }
        });
      }
      
      return fields;
    }
    
    return {};
  }, [schema, component.props, component.type]);
  
  // Set the editable fields once when derived values change
  useEffect(() => {
    setEditableFields(derivedEditableFields);
  }, [derivedEditableFields]);
  
  // Memoize finishInlineEdit to use it in useEffect
  const finishInlineEdit = useCallback(() => {
    if (!inlineEdit) return;
    
    // Update the component with new value
    onUpdate({
      [inlineEdit.fieldName]: inlineEdit.value
    });
    
    // Reset inline edit state
    setInlineEdit(null);
  }, [inlineEdit, onUpdate]);

  // Handle outside clicks to exit inline editing
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (inlineEditRef.current && !inlineEditRef.current.contains(e.target)) {
        finishInlineEdit();
      }
    };
    
    if (inlineEdit) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [inlineEdit, finishInlineEdit]);
  
  // Update value during inline editing
  const updateInlineEdit = useCallback((value) => {
    // Handle empty content from editor
    let processedValue = value;
    
    // Handle empty content from editor
    if (!value) {
      processedValue = '';
    }
    
    setInlineEdit(prev => ({
      ...prev,
      value: processedValue
    }));
  }, []);
  
  // Handle keydown events in inline editor
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      finishInlineEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setInlineEdit(null);
    }
  }, [finishInlineEdit]);
  
  // Start inline editing for a specific field
  const startInlineEdit = useCallback((fieldName, element) => {
    if (!isActive) return;
    
    const fieldValue = component.props[fieldName] || '';
    const fieldType = derivedEditableFields[fieldName]?.type || 'text';
    
    // Set inline edit state
    setInlineEdit({
      fieldName,
      fieldType,
      value: fieldValue,
      element
    });
  }, [isActive, component.props, derivedEditableFields]);
  
  // Helper to find text container elements
  const findTextContainer = useCallback((rootElement, textValue) => {
    // Skip empty text values
    if (!textValue) return null;
    
    // Try to find elements containing the text
    const textStr = String(textValue);
    const allElements = rootElement.querySelectorAll('h1, h2, h3, h4, h5, h6, p, div, span, a, button');
    
    for (let element of allElements) {
      // Skip elements with no direct text or with many children
      if (element.childNodes.length > 3) continue;
      
      // Check if this element or its immediate children contain the text
      if (element.textContent.includes(textStr)) {
        // Prefer the most specific element
        const childWithText = Array.from(element.childNodes)
          .filter(node => node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE)
          .find(node => node.textContent === textStr);
        
        return childWithText && childWithText.nodeType === Node.ELEMENT_NODE 
          ? childWithText 
          : element;
      }
    }
    
    return null;
  }, []);

  // Add inline editing capabilities to the rendered component
  const enhanceComponentWithEditors = useCallback(() => {
    if (!componentRef.current || !isActive) return;
    
    // Find elements to make editable
    Object.keys(derivedEditableFields).forEach(fieldName => {
      const field = derivedEditableFields[fieldName];
      
      // Find elements based on component type and field name
      if (field.type === 'media') {
        // For media fields, find images
        const imageElements = componentRef.current.querySelectorAll('img');
        imageElements.forEach(img => {
          // Add click handler to open media browser
          img.style.cursor = 'pointer';
          img.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            onMediaFieldClick(fieldName);
          };
          
          // Add visual indicator
          img.classList.add('live-editable-image');
          // Add edit icon
          const imageParent = img.parentElement;
          if (imageParent && !imageParent.querySelector('.image-edit-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'image-edit-overlay absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity';
            overlay.innerHTML = '<div class="text-white"><svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg><p class="text-sm mt-1">Click to edit</p></div>';
            imageParent.style.position = 'relative';
            imageParent.appendChild(overlay);
          }
        });
      } else {
        // For text fields, try to find elements that might contain the text
        if (component.props[fieldName]) {
          const textContainer = findTextContainer(componentRef.current, component.props[fieldName]);
          if (textContainer) {
            // Add click handler to start inline editing
            textContainer.style.cursor = 'text';
            textContainer.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              startInlineEdit(fieldName, textContainer);
            };
            
            // Add visual indicator
            textContainer.classList.add('live-editable-text');
            if (!textContainer.title) {
              textContainer.title = 'Click to edit';
            }
          }
        }
      }
    });
  }, [isActive, derivedEditableFields, component.props, onMediaFieldClick, findTextContainer, startInlineEdit]);
  
  // Apply inline editing after component renders
  useEffect(() => {
    if (isActive) {
      // Short delay to ensure the component has rendered
      const timer = setTimeout(() => {
        enhanceComponentWithEditors();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isActive, component.id, enhanceComponentWithEditors]);
  
  // No longer need editor init handler with react-draft-wysiwyg

  return (
    <div 
      className={`live-component-wrapper relative group ${isActive ? 'live-component-active' : ''}`}
      onClick={isActive ? null : onActivate}
    >
      {/* Component Toolbar */}
      {isActive && (
        <div className="component-toolbar absolute top-0 right-0 bg-blue-500 text-white p-2 rounded-bl-md z-10 flex space-x-2">
          <button 
            type="button" 
            title="Component Settings"
            onClick={() => setShowSettings(true)} 
            className="p-1 hover:bg-blue-600 rounded"
          >
            <FiSettings />
          </button>
          <button 
            type="button" 
            title="Move Up"
            onClick={onMoveUp} 
            className="p-1 hover:bg-blue-600 rounded"
          >
            <FiChevronUp />
          </button>
          <button 
            type="button" 
            title="Move Down"
            onClick={onMoveDown} 
            className="p-1 hover:bg-blue-600 rounded"
          >
            <FiChevronDown />
          </button>
          <button 
            type="button" 
            title="Delete Component"
            onClick={onRemove} 
            className="p-1 hover:bg-red-500 rounded"
          >
            <FiTrash2 />
          </button>
          <button 
            type="button" 
            title="Close Editor"
            onClick={onDeactivate} 
            className="p-1 hover:bg-blue-600 rounded"
          >
            <FiX />
          </button>
        </div>
      )}
      
      {/* Component border when active */}
      <div 
        ref={componentRef}
        className={`component-content relative transition ${
          isActive 
            ? 'outline outline-2 outline-blue-500 p-4 rounded' 
            : 'hover:outline hover:outline-2 hover:outline-blue-300 hover:p-4 hover:rounded'
        }`}
      >
        {/* Component Name Label */}
        {isActive && (
          <div className="component-label absolute top-0 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-br-md">
            {componentDefinition?.name || component.type}
          </div>
        )}
        
        {/* Actual Component Rendering */}
        <ComponentRenderer component={component} />
      </div>
      
      {/* Inline Edit Overlay */}
      {inlineEdit && (
        <div 
          className="inline-edit-overlay fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            ref={inlineEditRef}
            className="inline-edit-form bg-white rounded-lg shadow-xl p-4 max-w-2xl w-full"
          >
            <h3 className="text-lg font-medium mb-4">
              Edit {inlineEdit.fieldName}
            </h3>
            
            {inlineEdit.fieldType === 'rich-text' ? (
              <div className="mb-4">
                <RichTextEditor
                  value={(() => {
                    // Process HTML content for proper rendering
                    const value = inlineEdit.value;
                    if (typeof value === 'string' && (value.includes('&lt;') || value.includes('&gt;'))) {
                      try {
                        // If content has HTML entities that need to be decoded
                        const textarea = document.createElement('textarea');
                        textarea.innerHTML = value;
                        return textarea.value; // Returns decoded HTML
                      } catch (error) {
                        console.error('Error decoding HTML:', error);
                        return value;
                      }
                    }
                    return value;
                  })()}
                  onChange={updateInlineEdit}
                />
              </div>
            ) : (
              <textarea
                value={inlineEdit.value}
                onChange={(e) => updateInlineEdit(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full h-32 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            )}
            
            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={() => setInlineEdit(null)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => finishInlineEdit()}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Component Settings Modal */}
      {showSettings && (
        <div 
          className="settings-modal fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-lg shadow-xl p-4 max-w-3xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {componentDefinition?.name || component.type} Settings
              </h3>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <ComponentSettings 
              component={component}
              componentDefinition={componentDefinition}
              onSave={(updatedProps) => {
                onUpdate(updatedProps);
                setShowSettings(false);
              }}
              onCancel={() => setShowSettings(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveComponentEditor;