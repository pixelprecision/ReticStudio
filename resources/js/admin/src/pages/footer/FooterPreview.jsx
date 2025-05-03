// resources/js/admin/src/pages/footer/FooterPreview.jsx
import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import FooterDropZone from './FooterDropZone';
import FooterComponentRenderer from './FooterComponentRenderer';

const FooterPreview = ({ 
  settings,
  layout,
  components,
  menus,
  activeSection,
  onEditComponent,
  onDropComponent,
  isDragging,
  setIsDragging
}) => {
  // Parse component settings safely
  const parseComponentSettings = (component) => {
    if (typeof component.settings === 'string' && component.settings) {
      try {
        return JSON.parse(component.settings);
      } catch (e) {
        console.error(`Error parsing settings for component ${component.id}:`, e);
        return {};
      }
    }
    return component.settings || {};
  };
  
  // Get components for a specific position
  const getComponentsByPosition = (position) => {
    return components
      .filter(comp => comp.position === position && comp.is_active)
      .sort((a, b) => a.order - b.order);
  };
  
  // Get components for a specific column
  const getComponentsByColumn = (column) => {
    return components
      .filter(comp => 
        comp.position.startsWith('column_') && 
        comp.column === column && 
        comp.is_active
      )
      .sort((a, b) => a.order - b.order);
  };
  
  // Use the FooterComponentRenderer to render components
  const renderComponent = (component) => {
    return <FooterComponentRenderer 
      component={component}
      settings={settings}
      menus={menus}
    />;
  };
  
  // Render the footer
  const renderFooter = () => {
    if (activeSection !== 'footer') {
      return null;
    }
    
    const footerStyle = settings.footer_style || 'standard';
    const columns = layout.columns || 3;
    
    // For column layout - create array of columns
    const columnArray = [];
    for (let i = 1; i <= columns; i++) {
      columnArray.push(i);
    }
    
    return (
      <div 
        className="bg-gray-800 text-white py-12"
        style={{
          backgroundColor: settings.footer_background_color || undefined,
          color: settings.footer_text_color || undefined
        }}
      >
        <div className="container mx-auto px-4">
          {footerStyle === 'standard' && (
            <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-8`}>
              {columnArray.map(columnIndex => (
                <Droppable
                  key={`column_${columnIndex}`}
                  droppableId={`column_${columnIndex}`}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-6"
                    >
                      <FooterDropZone 
                        position={`column_${columnIndex}`}
                        layoutId={layout.id}
                      />
                      
                      {getComponentsByColumn(columnIndex).map((component, index) => (
                        <Draggable
                          key={component.id.toString()}
                          draggableId={component.id.toString()}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`relative p-3 transition-all rounded ${
                                snapshot.isDragging ? 'opacity-70 scale-105' : ''
                              }`}
                              onClick={() => onEditComponent(component)}
                            >
                              {renderComponent(component)}
                              
                              <div className="absolute top-0 right-0 p-1 opacity-0 hover:opacity-100 bg-gray-800 rounded-full cursor-pointer">
                                <i className="fas fa-edit text-white"></i>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          )}
          
          {footerStyle === 'centered' && (
            <div className="text-center space-y-6">
              <Droppable droppableId="footer">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-6"
                  >
                    <FooterDropZone 
                      position="footer"
                      layoutId={layout.id}
                    />
                    
                    {getComponentsByPosition('footer').map((component, index) => (
                      <Draggable
                        key={component.id.toString()}
                        draggableId={component.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`relative p-3 transition-all rounded ${
                              snapshot.isDragging ? 'opacity-70 scale-105' : ''
                            }`}
                            onClick={() => onEditComponent(component)}
                          >
                            {renderComponent(component)}
                            
                            <div className="absolute top-0 right-0 p-1 opacity-0 hover:opacity-100 bg-gray-800 rounded-full cursor-pointer">
                              <i className="fas fa-edit text-white"></i>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Render the footer bar
  const renderFooterBar = () => {
    if (activeSection !== 'footer_bar' || !settings.show_footer_bar) {
      return null;
    }
    
    return (
      <div 
        className={`py-4 bg-gray-900 text-gray-400 border-t border-gray-700 ${settings.custom_footer_bar_classes || ''}`}
      >
        <div className="container mx-auto px-4">
          <Droppable droppableId="footer_bar">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex justify-between items-center flex-wrap"
              >
                <FooterDropZone 
                  position="footer_bar"
                  layoutId={layout.id}
                />
                
                {getComponentsByPosition('footer_bar').map((component, index) => (
                  <Draggable
                    key={component.id.toString()}
                    draggableId={component.id.toString()}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`relative p-3 transition-all rounded ${
                          snapshot.isDragging ? 'opacity-70 scale-105' : ''
                        }`}
                        onClick={() => onEditComponent(component)}
                      >
                        {renderComponent(component)}
                        
                        <div className="absolute top-0 right-0 p-1 opacity-0 hover:opacity-100 bg-gray-700 rounded-full cursor-pointer">
                          <i className="fas fa-edit text-white"></i>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </div>
    );
  };
  
  return (
    <div className="footer-preview border overflow-hidden">
      {settings.show_footer && renderFooter()}
      {settings.show_footer_bar && renderFooterBar()}
      
      {!settings.show_footer && activeSection === 'footer' && (
        <div className="p-8 bg-gray-100 text-center">
          <p className="text-gray-500">
            Footer is currently disabled in settings. Enable it to edit footer components.
          </p>
        </div>
      )}
      
      {!settings.show_footer_bar && activeSection === 'footer_bar' && (
        <div className="p-8 bg-gray-100 text-center">
          <p className="text-gray-500">
            Footer bar is currently disabled in settings. Enable it to edit footer bar components.
          </p>
        </div>
      )}
    </div>
  );
};

export default FooterPreview;