// resources/js/admin/src/pages/footer/ComponentSettingsModal.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ComponentSettings from '../../components/pageBuilder/ComponentSettings';

const ComponentSettingsModal = ({ 
  component, 
  onClose, 
  onSave,
  menus = [],
  pageComponents = []
}) => {
  const [localComponent, setLocalComponent] = useState({...component});
  const [settings, setSettings] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedPageComponent, setSelectedPageComponent] = useState(null);
  const [showComponentSettings, setShowComponentSettings] = useState(false);
  
  useEffect(() => {
    // Parse settings if they're a string
    let parsedSettings = component.settings;
    if (typeof component.settings === 'string') {
      try {
        parsedSettings = JSON.parse(component.settings);
      } catch (e) {
        console.error('Error parsing component settings:', e);
        parsedSettings = {};
      }
    }
    setSettings(parsedSettings || {});
    
    // If this is a page_component type, try to find the associated page component
    if (component.type === 'page_component' && component.page_component_id) {
      const pageComponent = pageComponents.find(
        comp => String(comp.id) === String(component.page_component_id)
      );
      setSelectedPageComponent(pageComponent || null);
    }
  }, [component, pageComponents]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocalComponent({
      ...localComponent,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleAddSocialNetwork = () => {
    const networks = Array.isArray(settings.networks) ? [...settings.networks] : [];
    networks.push({ name: 'twitter', url: 'https://twitter.com' });
    setSettings({
      ...settings,
      networks
    });
  };
  
  const handleRemoveSocialNetwork = (index) => {
    const networks = [...settings.networks];
    networks.splice(index, 1);
    setSettings({
      ...settings,
      networks
    });
  };
  
  const handleNetworkChange = (index, field, value) => {
    const networks = [...settings.networks];
    networks[index] = {
      ...networks[index],
      [field]: value
    };
    setSettings({
      ...settings,
      networks
    });
  };
  
  const handleSave = async () => {
    try {
      // Combine local component with settings
      const updatedComponent = {
        ...localComponent,
        settings: settings
      };
      
      // Call the parent onSave function
      onSave(updatedComponent);
    } catch (error) {
      console.error('Error saving component:', error);
      toast.error('Failed to save component. Please try again.');
    }
  };
  
  const handlePageComponentChange = (e) => {
    const selectedId = e.target.value;
    const selectedComponent = pageComponents.find(c => String(c.id) === String(selectedId));
    
    setSelectedPageComponent(selectedComponent || null);
    setLocalComponent({
      ...localComponent,
      page_component_id: selectedId,
    });
  };
  
  const handleComponentSettingsSave = (updatedProps) => {
    // Save the updated props to page_component_data
    setLocalComponent({
      ...localComponent,
      page_component_data: updatedProps
    });
    
    setShowComponentSettings(false);
    toast.success('Component settings updated');
  };
  
  const renderComponentSettings = () => {
    switch (localComponent.type) {
      case 'logo':
        return (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              The logo will be displayed based on the settings in the footer settings panel.
            </p>
          </div>
        );
        
      case 'menu':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Menu
              </label>
              <select
                name="menu_id"
                value={settings.menu_id || ''}
                onChange={handleSettingChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select a menu</option>
                {menus.map(menu => (
                  <option key={menu.id} value={menu.id}>{menu.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={settings.title || ''}
                onChange={handleSettingChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Menu Title"
              />
            </div>
          </div>
        );
        
      case 'text':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={settings.title || ''}
                onChange={handleSettingChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Section Title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text
              </label>
              <textarea
                name="text"
                value={settings.text || ''}
                onChange={handleSettingChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter your text here..."
              ></textarea>
            </div>
          </div>
        );
        
      case 'social':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={settings.title || ''}
                onChange={handleSettingChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Follow Us"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Social Networks
              </label>
              
              {Array.isArray(settings.networks) && settings.networks.map((network, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <select
                    value={network.name}
                    onChange={(e) => handleNetworkChange(index, 'name', e.target.value)}
                    className="w-1/3 px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="facebook">Facebook</option>
                    <option value="twitter">Twitter</option>
                    <option value="x">X (Twitter)</option>
                    <option value="instagram">Instagram</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="youtube">YouTube</option>
                    <option value="pinterest">Pinterest</option>
                    <option value="tiktok">TikTok</option>
                    <option value="snapchat">Snapchat</option>
                    <option value="discord">Discord</option>
                    <option value="github">GitHub</option>
                    <option value="reddit">Reddit</option>
                    <option value="telegram">Telegram</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="vimeo">Vimeo</option>
                    <option value="threads">Threads</option>
                    <option value="slack">Slack</option>
                    <option value="medium">Medium</option>
                    <option value="dribbble">Dribbble</option>
                    <option value="behance">Behance</option>
                    <option value="spotify">Spotify</option>
                    <option value="mastodon">Mastodon</option>
                  </select>
                  
                  <input
                    type="text"
                    value={network.url}
                    onChange={(e) => handleNetworkChange(index, 'url', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="https://example.com"
                  />
                  
                  <button
                    onClick={() => handleRemoveSocialNetwork(index)}
                    className="p-2 text-red-500 hover:text-red-700"
                    title="Remove network"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              ))}
              
              <button
                onClick={handleAddSocialNetwork}
                className="mt-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 text-sm"
              >
                <i className="fa-solid fa-plus mr-1"></i>
                Add Network
              </button>
            </div>
          </div>
        );
        
      case 'contact':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={settings.title || ''}
                onChange={handleSettingChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Contact Us"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={settings.address || ''}
                onChange={handleSettingChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="123 Street Name, City, Country"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                value={settings.phone || ''}
                onChange={handleSettingChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="text"
                name="email"
                value={settings.email || ''}
                onChange={handleSettingChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="info@example.com"
              />
            </div>
          </div>
        );
        
      case 'copyright':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Copyright Text
              </label>
              <input
                type="text"
                name="text"
                value={settings.text || ''}
                onChange={handleSettingChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="© 2024 Your Company. All rights reserved."
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to use the default copyright text from footer settings.
              </p>
            </div>
          </div>
        );
        
      case 'page_component':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Page Component
              </label>
              <select
                name="page_component_id"
                value={localComponent.page_component_id || ''}
                onChange={handlePageComponentChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select a page component</option>
                {pageComponents.map(comp => (
                  <option key={comp.id} value={comp.id}>
                    {comp.name} ({comp.category})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select a component from the LivePageBuilder.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title (Optional)
              </label>
              <input
                type="text"
                name="title"
                value={settings.title || ''}
                onChange={handleSettingChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Component Title"
              />
              <p className="text-xs text-gray-500 mt-1">
                This title will appear above the component.
              </p>
            </div>
            
            {localComponent.page_component_id && selectedPageComponent && (
              <div className="mt-4">
                <div className="p-3 bg-gray-50 rounded-md border border-gray-200 mb-3">
                  <p className="text-sm font-medium text-gray-700">
                    Selected Component: {selectedPageComponent.name}
                  </p>
                  {selectedPageComponent.description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedPageComponent.description}
                    </p>
                  )}
                </div>
                
                <button
                  onClick={() => setShowComponentSettings(true)}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit Component Settings
                </button>
              </div>
            )}
          </div>
        );
        
      default:
        return (
          <p className="text-sm text-gray-500">
            No settings available for this component type.
          </p>
        );
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">
            {isDeleting ? 'Confirm Delete' : `Edit ${localComponent.name}`}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        
        {isDeleting ? (
          <div className="p-6">
            <div className="text-center space-y-4">
              <div className="text-red-500 text-4xl">
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Are you sure you want to delete this component?
              </h3>
              <p className="text-sm text-gray-500">
                This action cannot be undone. The component will be permanently removed.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 overflow-y-auto">
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Basic Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={localComponent.name || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      name="is_active"
                      checked={!!localComponent.is_active}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                      Active
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Custom Classes
                    </label>
                    <input
                      type="text"
                      name="custom_classes"
                      value={localComponent.custom_classes || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="custom-class-1 custom-class-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Visibility
                    </label>
                    <select
                      name="visibility"
                      value={localComponent.visibility || 'all'}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="all">All Devices</option>
                      <option value="desktop">Desktop Only</option>
                      <option value="mobile">Mobile Only</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Component Settings */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Component Settings</h4>
                {renderComponentSettings()}
              </div>
            </div>
          </div>
        )}
        
        <div className="p-4 bg-gray-50 border-t flex justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
      </div>

      {/* Component Settings Modal for Page Components */}
      {showComponentSettings && selectedPageComponent && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-4 bg-blue-50 border-b flex justify-between items-center">
              <h3 className="font-semibold text-blue-800">
                Edit Settings for {selectedPageComponent.name}
              </h3>
              <button 
                onClick={() => setShowComponentSettings(false)}
                className="text-blue-500 hover:text-blue-700"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <div className="flex-1 overflow-auto">
              <ComponentSettings
                component={{
                  id: localComponent.id,
                  type: selectedPageComponent.slug,
                  props: localComponent.page_component_data || {}
                }}
                componentDefinition={selectedPageComponent}
                onSave={handleComponentSettingsSave}
                onCancel={() => setShowComponentSettings(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponentSettingsModal;