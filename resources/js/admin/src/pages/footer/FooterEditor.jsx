// resources/js/admin/src/pages/footer/FooterEditor.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FiSettings, FiPlus, FiEye, FiSave, FiTrash2 } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FooterSettingsPanel from './FooterSettingsPanel';
import FooterComponentList from './FooterComponentList';
import FooterPreview from './FooterPreview';
import ComponentSettingsModal from './ComponentSettingsModal';
import FooterDropZone from './FooterDropZone';
import ComponentPalette from './ComponentPalette';
import Tabs from '../../components/common/Tabs';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { getFooterData, updateFooterSettings, reorderComponents, createComponent, updateComponent, deleteComponent, updateComponentPosition } from '../../api/footerApi';
import { getComponents } from '../../api/componentsApi';
import { toast } from 'react-toastify';

const FooterEditor = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('components');
  const [showPreview, setShowPreview] = useState(false);
  const [componentModalOpen, setComponentModalOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [pageComponents, setPageComponents] = useState([]);

  // State for footer data
  const [footerData, setFooterData] = useState({
    settings: {},
    components: [],
    menus: [],
    layout: {},
    activeLayoutId: null // Track the active layout ID
  });

  // Predefined component templates for the palette with default settings
  const componentTemplates = [
    {
      type: 'logo',
      name: 'Logo',
      description: 'Site logo and text',
      defaultSettings: {
        show_text: true,
        logo_size: 'medium'
      }
    },
    {
      type: 'menu',
      name: 'Navigation Menu',
      description: 'Primary or secondary navigation',
      defaultSettings: {
        menu_style: 'vertical',
        menu_id: null
      }
    },
    {
      type: 'text',
      name: 'Text Content',
      description: 'Custom text with optional title',
      defaultSettings: {
        title: 'About Us',
        text: 'Add your content here'
      }
    },
    {
      type: 'social',
      name: 'Social Links',
      description: 'Social media icons',
      defaultSettings: {
        title: 'Follow Us',
        networks: [
          { name: 'facebook', url: 'https://facebook.com' },
          { name: 'instagram', url: 'https://instagram.com' },
          { name: 'linkedin', url: 'https://linkedin.com' },
          { name: 'youtube', url: 'https://youtube.com' },
          { name: 'x', url: 'https://x.com' }
        ]
      }
    },
    {
      type: 'contact',
      name: 'Contact Info',
      description: 'Contact information block',
      defaultSettings: {
        title: 'Contact Us',
        address: '123 Street Name, City, Country',
        phone: '+1 (555) 123-4567',
        email: 'info@example.com'
      }
    },
    {
      type: 'copyright',
      name: 'Copyright',
      description: 'Copyright information',
      defaultSettings: {
        text: `© ${new Date().getFullYear()} Your Company. All rights reserved.`
      }
    },
    {
      type: 'page_component',
      name: 'Page Component',
      description: 'Component from the page builder',
      defaultSettings: {
        title: 'Component',
        page_component_id: null
      }
    }
  ];

  // Fetch footer data
  const fetchFooterData = useCallback(async () => {
    console.log('Fetching footer data...');
    setLoading(true);
    try {
      const data = await getFooterData();
      console.log('Received footer data:', data);
      
      if (data.success) {
        setFooterData({
          settings: data.settings || {},
          layout: data.layout || {},
          components: data.components || [],
          menus: data.menus || [],
          pageComponents: data.pageComponents || [],
          activeLayoutId: data.layout?.id || null
        });
      } else {
        toast.error('Error loading footer data');
      }
      
      // Also fetch the available page components
      const pageComponentsResponse = await getComponents({ is_active: true });
      if (pageComponentsResponse.data) {
        setPageComponents(pageComponentsResponse.data.data || pageComponentsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching footer data:', error);
      toast.error('Failed to load footer data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFooterData();
  }, [fetchFooterData]);

  const handleSaveSettings = async (formData) => {
    setSaving(true);
    try {
      console.log('FooterEditor: Saving settings');

      // Extract the logo value from formData, but don't exclude it
      const logoValue = formData.get('logo');
      console.log('FooterEditor: Logo value:', logoValue);
      
      // Create settings object from FormData (including the logo)
      const settingsObj = {};
      for (let [key, value] of formData.entries()) {
        // Include all fields including logo
        if (value === '1' || value === '0') {
          // Convert "0" and "1" strings to proper booleans for boolean fields
          settingsObj[key] = value === '1';
        } else {
          settingsObj[key] = value;
        }
      }

      console.log('FooterEditor: Settings object to save with logo:', settingsObj);

      // Update settings (including the logo)
      await updateFooterSettings(settingsObj);
      
      await fetchFooterData();
      
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('FooterEditor: Error saving footer settings:', error);
      toast.error('Failed to save footer settings. See console for details.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveComponent = async (componentData) => {
    setSaving(true);
    try {
      console.log('Saving footer component with data:', componentData);
      
      // Ensure settings is stringified if it's an object
      if (componentData.settings && typeof componentData.settings === 'object') {
        componentData.settings = JSON.stringify(componentData.settings);
      }
      
      // Handle page_component_data if it exists and is an object
      if (componentData.page_component_data && typeof componentData.page_component_data === 'object') {
        componentData.page_component_data = JSON.stringify(componentData.page_component_data);
      }
      
      if (componentData.id) {
        await updateComponent(componentData.id, componentData);
        toast.success('Component updated successfully');
      } else {
        await createComponent(componentData);
        toast.success('Component created successfully');
      }
      
      setComponentModalOpen(false);
      fetchFooterData();
    } catch (error) {
      console.error('Error saving component:', error);
      toast.error('Failed to save component');
    } finally {
      setSaving(false);
    }
  };

  const handleEditComponent = (component) => {
    // Clone the component to avoid modifying the original
    const componentToEdit = { ...component };
    
    // Make sure the component has the footer_layout_id
    if (!componentToEdit.footer_layout_id && footerData.activeLayoutId) {
      componentToEdit.footer_layout_id = footerData.activeLayoutId;
    }

    // Parse settings if it's a string
    if (typeof componentToEdit.settings === 'string' && componentToEdit.settings) {
      try {
        componentToEdit.settings = JSON.parse(componentToEdit.settings);
      } catch (e) {
        console.error('Error parsing component settings:', e);
        componentToEdit.settings = {};
      }
    } else if (componentToEdit.settings === null) {
      componentToEdit.settings = {};
    }
    
    // Parse page_component_data if it's a string
    if (typeof componentToEdit.page_component_data === 'string' && componentToEdit.page_component_data) {
      try {
        componentToEdit.page_component_data = JSON.parse(componentToEdit.page_component_data);
      } catch (e) {
        console.error('Error parsing page_component_data:', e);
        componentToEdit.page_component_data = {};
      }
    } else if (componentToEdit.page_component_data === null || componentToEdit.page_component_data === undefined) {
      componentToEdit.page_component_data = {};
    }

    // If this is a page_component type, find its component definition
    if (componentToEdit.type === 'page_component' && componentToEdit.page_component_id) {
      const componentDefinition = pageComponents.find(
        c => String(c.id) === String(componentToEdit.page_component_id)
      );
      if (componentDefinition) {
        componentToEdit.component_definition = componentDefinition;
      }
    }

    console.log('Editing component with parsed settings:', componentToEdit);
    setSelectedComponent(componentToEdit);
    setComponentModalOpen(true);
  };

  const handleDeleteComponent = async () => {
    if (!confirmDelete) {
      console.error('No component selected for deletion');
      return;
    }

    console.log('Confirming deletion of component:', JSON.stringify(confirmDelete));

    if (!confirmDelete.id) {
      console.error('Component missing ID property:', confirmDelete);
      toast.error('Cannot delete component: missing ID');
      setConfirmDelete(null);
      return;
    }

    setSaving(true);
    try {
      console.log('Deleting component with ID:', confirmDelete.id);
      const response = await deleteComponent(confirmDelete.id);
      console.log('Delete component response:', response);

      setConfirmDelete(null);
      await fetchFooterData();

      toast.success(`Component "${confirmDelete.name}" has been deleted`);
    } catch (error) {
      console.error('Error deleting component:', error);
      toast.error('Failed to delete component. See console for details.');
    } finally {
      setSaving(false);
    }
  };

  // Handle component drop from palette (create new component)
  const handleDropComponent = async (item, position) => {
    console.log('Handling drop from palette', item, 'to position', position);
    setSaving(true);
    try {
      // When dropped from palette, create a new component
      if (item.isNew) {
        // Check if we have an active layout
        if (!footerData.activeLayoutId) {
          toast.error('No active layout found. Please refresh the page and try again.');
          return;
        }

        // Determine the column if position starts with column_
        let column = null;
        if (position.startsWith('column_')) {
          column = parseInt(position.split('_')[1]);
        }
        
        const newComponent = {
          name: item.name,
          type: item.type,
          position: position,
          is_active: true,
          visibility: 'all',
          column: column,
          settings: JSON.stringify(item.settings || {}),
          footer_layout_id: footerData.activeLayoutId,
        };
        
        // Special handling for page_component type
        if (item.type === 'page_component' && item.page_component_id) {
          newComponent.page_component_id = item.page_component_id;
        }

        console.log('Creating new component:', newComponent);
        await createComponent(newComponent);
      }
      // Move existing component to a new position
      else if (item.id) {
        console.log('Moving component', item.id, 'to', position);
        
        // Update position and column if needed
        const updateData = { position };
        if (position.startsWith('column_')) {
          updateData.column = parseInt(position.split('_')[1]);
        } else {
          updateData.column = null;
        }
        
        await updateComponentPosition(item.id, updateData);
      }

      // Refresh the data regardless of what happened
      await fetchFooterData();
    } catch (error) {
      console.error('Error handling component drop:', error);
      toast.error('Failed to add component. See console for details.');
    } finally {
      setSaving(false);
    }
  };

  // Handle reordering components within the same section
  const handleReorderComponents = async (position, updatedComponents) => {
    console.log('Reordering components in', position, updatedComponents);
    setSaving(true);
    try {
      // Extract just the IDs and positions for the API
      const componentOrder = updatedComponents.map((comp, index) => ({
        id: comp.id,
        position: position,
        column: comp.column || null,
        order: index + 1
      }));

      console.log('Sending reordering request with data:', componentOrder);
      await reorderComponents(componentOrder);
      await fetchFooterData();
    } catch (error) {
      console.error('Error reordering components:', error);
      toast.error('Failed to reorder components');
    } finally {
      setSaving(false);
    }
  };

  // Helper function to get components by section
  const getComponentsBySection = (section) => {
    return footerData.components.filter(comp => comp.position === section);
  };
  
  // Helper function to get components for a specific column
  const getComponentsByColumn = (column) => {
    return footerData.components.filter(comp => 
      comp.position.startsWith('column_') && 
      comp.column === column
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <PageHeader
        title="Footer Management"
        description="Configure your site footer appearance and components"
        actions={
          <div className="flex space-x-2">
            <button
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiEye className="mr-2" />
              Preview
            </button>
          </div>
        }
      />

      <Tabs
        tabs={[
          { id: 'components', label: 'Footer Components' },
          { id: 'settings', label: 'Footer Settings' }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <div className="mt-6">
        {activeTab === 'components' ? (
          <DndProvider backend={HTML5Backend}>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Component Palette - Left Side */}
              <div className="lg:col-span-1">
                <ComponentPalette 
                  templates={componentTemplates} 
                  pageComponents={footerData.pageComponents}
                />
              </div>

              {/* Footer Sections - Right Side */}
              <div className="lg:col-span-3 space-y-8">
                {/* Main Footer */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="bg-green-50 px-4 py-3 border-b border-green-100">
                    <h3 className="text-sm font-medium text-green-800">Main Footer</h3>
                    <p className="text-xs text-gray-500">Primary footer content</p>
                  </div>
                  
                  {/* Columns layout */}
                  <div className="p-4">
                    <div className={`grid grid-cols-1 md:grid-cols-${footerData.settings.columns || 3} gap-4`}>
                      {/* Generate columns dynamically based on settings */}
                      {Array.from({ length: footerData.settings.columns || 3 }, (_, index) => {
                        const columnIndex = index + 1;
                        return (
                          <div key={`column_${columnIndex}`}>
                            <div className="bg-gray-50 p-2 mb-2 text-xs font-medium text-gray-700 rounded">
                              Column {columnIndex}
                            </div>
                            <FooterDropZone 
                              position={`column_${columnIndex}`}
                              components={getComponentsByColumn(columnIndex)}
                              onDrop={handleDropComponent}
                              onReorder={handleReorderComponents}
                              onDelete={(component) => setConfirmDelete(component)}
                              onEdit={handleEditComponent}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer Bar */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="bg-blue-50 px-4 py-3 border-b border-blue-100">
                    <h3 className="text-sm font-medium text-blue-800">Footer Bar</h3>
                    <p className="text-xs text-gray-500">Copyright and secondary footer information</p>
                  </div>
                  <div className="p-4">
                    <FooterDropZone
                      position="footer_bar"
                      components={getComponentsBySection('footer_bar')}
                      onDrop={handleDropComponent}
                      onReorder={handleReorderComponents}
                      onDelete={(component) => setConfirmDelete(component)}
                      onEdit={handleEditComponent}
                    />
                  </div>
                </div>
              </div>
            </div>
          </DndProvider>
        ) : (
          <FooterSettingsPanel
            settings={footerData.settings}
            onSave={handleSaveSettings}
            saving={saving}
          />
        )}
      </div>
      
      {/* Component Settings Modal */}
      {componentModalOpen && (
        <ComponentSettingsModal
          component={selectedComponent}
          menus={footerData.menus}
          pageComponents={pageComponents}
          onSave={handleSaveComponent}
          onClose={() => {
            setComponentModalOpen(false);
            setSelectedComponent(null);
          }}
        />
      )}

      {/* Preview Modal */}
      {showPreview && (
        <FooterPreview
          footerData={footerData}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete Component"
        message={confirmDelete ? `Are you sure you want to delete the "${confirmDelete.name}" component? This action cannot be undone.` : ''}
        confirmButtonText="Delete"
        type="delete"
        onConfirm={() => {
          console.log('Delete confirmed for component:', confirmDelete);
          handleDeleteComponent();
        }}
        onCancel={() => {
          console.log('Delete cancelled for component:', confirmDelete);
          setConfirmDelete(null);
        }}
      />
    </>
  );
};

export default FooterEditor;