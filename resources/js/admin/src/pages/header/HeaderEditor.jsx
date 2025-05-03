// resources/js/admin/src/pages/header/HeaderEditor.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FiSettings, FiPlus, FiEye, FiSave, FiTrash2 } from 'react-icons/fi';
import HeaderSettingsPanel from './HeaderSettingsPanel';
import ComponentSettingsModal from './ComponentSettingsModal';
import HeaderPreview from './HeaderPreview';
import HeaderDropZone from './HeaderDropZone';
import ComponentPalette from './ComponentPalette';
import Tabs from '../../components/common/Tabs';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  getHeaderData,
  updateHeaderSettings,
  uploadLogo,
  uploadFavicon,
  createComponent,
  updateComponent,
  deleteComponent,
  updateComponentPosition,
  reorderComponents
} from '../../api/headerApi';
import {toast} from "react-toastify";

const HeaderEditor = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('components');
  const [showPreview, setShowPreview] = useState(false);
  const [componentModalOpen, setComponentModalOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // State for header data
  const [headerData, setHeaderData] = useState({
    settings: {},
    components: [],
    menus: [],
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
        menu_style: 'horizontal'
      }
    },
    {
      type: 'search',
      name: 'Search Box',
      description: 'Search functionality',
      defaultSettings: {
        search_style: 'expandable',
        placeholder: 'Search...'
      }
    },
    {
      type: 'auth',
      name: 'Auth Buttons',
      description: 'Login/Register buttons',
      defaultSettings: {
        show_login: true,
        show_register: true,
        login_text: 'Login',
        register_text: 'Register'
      }
    },
    {
      type: 'cart',
      name: 'Shopping Cart',
      description: 'Cart icon with dropdown',
      defaultSettings: {
        show_count: true,
        show_total: false
      }
    },
    {
      type: 'custom',
      name: 'Custom Component',
      description: 'Custom HTML content',
      defaultSettings: {
        html_content: '<div>Custom component content</div>'
      }
    }
  ];

  // Fetch header data
  const fetchHeaderData = useCallback(async () => {
    console.log('Fetching header data...');
    setLoading(true);
    try {
      const data = await getHeaderData();
      console.log('Received header data:', data);
      console.log('Components count:', data.components?.length || 0);
      setHeaderData(data);
    } catch (error) {
      console.error('Error fetching header data:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHeaderData();
  }, [fetchHeaderData]);

  const handleSaveSettings = async (formData) => {
    setSaving(true);
    try {
      console.log('HeaderEditor: Saving settings');

      // Extract files from formData
      const logoFile = formData.get('logo');
      const faviconFile = formData.get('favicon');

      // Create settings object from FormData (excluding files)
      const settingsObj = {};
      for (let [key, value] of formData.entries()) {
        // Skip files
        if (key === 'logo' || key === 'favicon') continue;

        // Convert "0" and "1" strings to proper booleans for boolean fields
        if (value === '1' || value === '0') {
          settingsObj[key] = value === '1';
        } else {
          settingsObj[key] = value;
        }
      }

      console.log('HeaderEditor: Settings object to save:', settingsObj);

      // Update settings - apiClient will handle sending it as JSON
      await updateHeaderSettings(settingsObj);

      // Upload logo if provided
      if (logoFile && logoFile instanceof File) {
        console.log('HeaderEditor: Uploading logo');
        const logoFormData = new FormData();
        logoFormData.append('logo', logoFile);
        await uploadLogo(logoFormData);
      }

      // Upload favicon if provided
      if (faviconFile && faviconFile instanceof File) {
        console.log('HeaderEditor: Uploading favicon');
        const faviconFormData = new FormData();
        faviconFormData.append('favicon', faviconFile);
        await uploadFavicon(faviconFormData);
      }

      console.log('HeaderEditor: All settings saved successfully');
      await fetchHeaderData();

      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('HeaderEditor: Error saving header settings:', error);
      console.error('HeaderEditor: Error response:', error.response?.data);

      toast.error('Failed to save header settings. See console for details.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveComponent = async (componentData) => {
    setSaving(true);
    try {
      if (componentData.id) {
        await updateComponent(componentData.id, componentData);
      } else {
        await createComponent(componentData);
      }
      setComponentModalOpen(false);
      fetchHeaderData();
    } catch (error) {
      console.error('Error saving component:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEditComponent = (component) => {
    // Clone the component to avoid modifying the original
    const componentToEdit = { ...component };
    
    // Make sure the component has the header_layout_id
    if (!componentToEdit.header_layout_id && headerData.activeLayoutId) {
      componentToEdit.header_layout_id = headerData.activeLayoutId;
    }

    // If settings is a string, parse it
    if (typeof componentToEdit.settings === 'string' && componentToEdit.settings) {
      try {
        componentToEdit.settings = JSON.parse(componentToEdit.settings);
      } catch (e) {
        console.error('Error parsing component settings:', e);
        console.log('Invalid settings string:', componentToEdit.settings);
        // Fallback to empty object if parsing fails
        componentToEdit.settings = {};
      }
    } else if (componentToEdit.settings === null) {
      componentToEdit.settings = {};
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
      console.log('DELETE REQUEST - Deleting component with ID:', confirmDelete.id);
      const response = await deleteComponent(confirmDelete.id);
      console.log('Delete component response:', response);

      setConfirmDelete(null);

      console.log('Refreshing component data after deletion');
      await fetchHeaderData();

      // Show success message

      toast.success(`Component "${confirmDelete.name}" has been deleted`);
    } catch (error) {
      console.error('Error deleting component:', error);
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error response data:', error.response.data);
      }

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
        if (!headerData.activeLayoutId) {
          console.log('No active layout ID found. Creating a default layout first...');

          // Create a default layout on the fly
          const defaultLayoutData = {
            name: 'Default Header Layout',
            description: 'Default header layout created automatically',
            layout_type: 'standard',
            show_topbar: true,
            show_header: true,
            show_subheader: true,
            is_default: true,
            is_active: true
          };

          const layoutResponse = await createLayout(defaultLayoutData);
          console.log('Created new layout response:', layoutResponse);

          // Extract the new layout ID
          let newLayoutId = null;
          if (layoutResponse && layoutResponse.data) {
            if (layoutResponse.data.id) {
              newLayoutId = layoutResponse.data.id;
            } else if (layoutResponse.data.data && layoutResponse.data.data.id) {
              newLayoutId = layoutResponse.data.data.id;
            }
          }

          if (!newLayoutId) {
            console.error('Failed to get layout ID from response');
            throw new Error('Failed to create header layout');
          }

          // Update state with the new layout ID
          setHeaderData(prev => ({
            ...prev,
            activeLayoutId: newLayoutId
          }));

          // Continue with the new layout ID
          const newComponent = {
            name: item.name,
            type: item.type,
            position: position,
            is_active: true,
            visibility: 'all',
            settings: JSON.stringify(item.settings || {}), // Convert to JSON string
            header_layout_id: newLayoutId,
          };

          console.log('Creating new component with new layout:', newComponent);
          await createComponent(newComponent);
        } else {
          // We already have a layout ID
          const newComponent = {
            name: item.name,
            type: item.type,
            position: position,
            is_active: true,
            visibility: 'all',
            settings: JSON.stringify(item.settings || {}), // Convert to JSON string
            header_layout_id: headerData.activeLayoutId,
          };

          console.log('Creating new component with existing layout:', newComponent);
          await createComponent(newComponent);
        }
      }
      // When moved from another section
      else if (item.id) {
        console.log('Moving component', item.id, 'to', position);
        await updateComponentPosition(item.id, position);
      }

      // Refresh the data regardless of what happened
      await fetchHeaderData();
    } catch (error) {
      console.error('Error handling component drop:', error);
      if (error.response && error.response.data) {
        console.error('Error response data:', error.response.data);
      }

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
        position: position, // Make sure position is included for each component
        order: index
      }));

      console.log('Sending reordering request with data:', componentOrder);
      await reorderComponents(componentOrder);
      await fetchHeaderData();
    } catch (error) {
      console.error('Error reordering components:', error);
    } finally {
      setSaving(false);
    }
  };

  // Legacy function - kept for compatibility
  const handleMoveComponent = async (componentId, newPosition, newSection) => {
    setSaving(true);
    try {
      await updateComponentPosition(componentId, newPosition, newSection);
      fetchHeaderData();
    } catch (error) {
      console.error('Error moving component:', error);
    } finally {
      setSaving(false);
    }
  };

  const getComponentsBySection = (section) => {
    return headerData.components.filter(comp => comp.position === section);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <PageHeader
        title="Header Management"
        description="Configure your site header appearance and components"
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
          { id: 'components', label: 'Header Components' },
          { id: 'settings', label: 'Header Settings' }
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
                <ComponentPalette templates={componentTemplates} />
              </div>

              {/* Header Sections - Right Side */}
              <div className="lg:col-span-3 space-y-8">
                {/* Top Bar */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="bg-blue-50 px-4 py-3 border-b border-blue-100">
                    <h3 className="text-sm font-medium text-blue-800">Top Bar</h3>
                    <p className="text-xs text-gray-500">Displayed above the main header</p>
                  </div>
                  <div className="p-4">
                    <HeaderDropZone
                      position="topbar"
                      components={getComponentsBySection('topbar')}
                      onDrop={handleDropComponent}
                      onReorder={handleReorderComponents}
                      onDelete={(component) => setConfirmDelete(component)}
                      onEdit={handleEditComponent}
                    />
                  </div>
                </div>

                {/* Main Header */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="bg-green-50 px-4 py-3 border-b border-green-100">
                    <h3 className="text-sm font-medium text-green-800">Main Header</h3>
                    <p className="text-xs text-gray-500">Primary header with logo and main navigation</p>
                  </div>
                  <div className="p-4">
                    <HeaderDropZone
                      position="header"
                      components={getComponentsBySection('header')}
                      onDrop={handleDropComponent}
                      onReorder={handleReorderComponents}
                      onDelete={(component) => setConfirmDelete(component)}
                      onEdit={handleEditComponent}
                    />
                  </div>
                </div>

                {/* Sub Header */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="bg-purple-50 px-4 py-3 border-b border-purple-100">
                    <h3 className="text-sm font-medium text-purple-800">Sub Header</h3>
                    <p className="text-xs text-gray-500">Secondary navigation or promotional content</p>
                  </div>
                  <div className="p-4">
                    <HeaderDropZone
                      position="subheader"
                      components={getComponentsBySection('subheader')}
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
          <HeaderSettingsPanel
            settings={headerData.settings}
            onSave={handleSaveSettings}
            saving={saving}
          />
        )}
      </div>

      {/* Component Settings Modal */}
      {componentModalOpen && (
        <ComponentSettingsModal
          component={selectedComponent}
          menus={headerData.menus}
          onSave={handleSaveComponent}
          onClose={() => {
            setComponentModalOpen(false);
            setSelectedComponent(null);
          }}
        />
      )}

      {/* Preview Modal */}
      {showPreview && (
        <HeaderPreview
          headerData={headerData}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete Component"
        message={confirmDelete ? `Are you sure you want to delete the "${confirmDelete.name}" component (ID: ${confirmDelete.id})? This action cannot be undone.` : ''}
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

// Component Card - Represents a header component with edit/delete actions
const ComponentCard = ({ component, onEdit, onDelete, onMove }) => {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'logo':
        return '🖼️';
      case 'menu':
        return '📋';
      case 'search':
        return '🔍';
      case 'auth':
        return '👤';
      case 'cart':
        return '🛒';
      case 'custom':
        return '✨';
      default:
        return '📦';
    }
  };

  return (
    <div className="border rounded-md p-3 bg-white shadow-sm hover:shadow">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <span className="text-xl mr-2">{getTypeIcon(component.type)}</span>
          <div>
            <h4 className="font-medium text-gray-900">{component.name}</h4>
            <p className="text-xs text-gray-500 capitalize">{component.type}</p>
          </div>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={onEdit}
            className="p-1 text-gray-400 hover:text-blue-500 rounded-full hover:bg-gray-100"
            title="Edit component"
          >
            <FiSettings size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
            title="Delete component"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>

      {component.is_active ? (
        <span className="inline-flex mt-2 items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
          Active
        </span>
      ) : (
        <span className="inline-flex mt-2 items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
          Inactive
        </span>
      )}

      {component.visibility !== 'all' && (
        <span className="inline-flex ml-1 mt-2 items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
          {component.visibility === 'desktop' ? 'Desktop Only' : 'Mobile Only'}
        </span>
      )}
    </div>
  );
};

export default HeaderEditor;
