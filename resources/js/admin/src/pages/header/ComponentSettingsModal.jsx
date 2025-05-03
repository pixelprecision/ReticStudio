// resources/js/admin/src/pages/header/ComponentSettingsModal.jsx
import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const ComponentSettingsModal = ({ component, menus, onSave, onClose }) => {
  const [settings, setSettings] = useState({
    name: '',
    type: '',
    position: '',
    is_active: true,
    custom_classes: '',
    visibility: 'all',
    settings: {},
  });

  // Initialize settings when component changes
  useEffect(() => {
    if (component) {
      setSettings({
        name: component.name || '',
        type: component.type || '',
        position: component.position || 'header',
        is_active: component.is_active !== undefined ? component.is_active : true,
        custom_classes: component.custom_classes || '',
        visibility: component.visibility || 'all',
        settings: component.settings || {},
      });
    }
  }, [component]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      settings: {
        ...settings.settings,
        [name]: type === 'checkbox' ? checked : value,
      },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare data for API - convert settings to JSON string
    const formattedData = {
      ...settings,
      settings: JSON.stringify(settings.settings || {}),
      header_layout_id: component.header_layout_id // Add header_layout_id from the component
    };
    
    console.log('Saving component with formatted data:', formattedData);
    onSave(formattedData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-medium">
            {component ? `Edit ${component.type} Component` : 'Component Settings'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-130px)]">
          <div className="space-y-6">
            {/* Basic Settings */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Basic Settings</h4>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Component Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={settings.name}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                    Position
                  </label>
                  <select
                    id="position"
                    name="position"
                    value={settings.position}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="topbar">Top Bar</option>
                    <option value="header">Header</option>
                    <option value="subheader">Subheader</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="visibility" className="block text-sm font-medium text-gray-700">
                    Visibility
                  </label>
                  <select
                    id="visibility"
                    name="visibility"
                    value={settings.visibility}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="all">All Devices</option>
                    <option value="desktop">Desktop Only</option>
                    <option value="mobile">Mobile Only</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="custom_classes" className="block text-sm font-medium text-gray-700">
                    Custom CSS Classes
                  </label>
                  <input
                    type="text"
                    id="custom_classes"
                    name="custom_classes"
                    value={settings.custom_classes}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="e.g. ml-4 text-lg"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    id="is_active"
                    name="is_active"
                    type="checkbox"
                    checked={settings.is_active}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                    Active
                  </label>
                </div>
              </div>
            </div>
            
            {/* Component-specific Settings */}
            {settings.type === 'logo' && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Logo Settings</h4>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      id="show_text"
                      name="show_text"
                      type="checkbox"
                      checked={settings.settings.show_text}
                      onChange={handleSettingsChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="show_text" className="ml-2 block text-sm text-gray-700">
                      Show Text with Logo
                    </label>
                  </div>
                  
                  <div>
                    <label htmlFor="logo_size" className="block text-sm font-medium text-gray-700">
                      Logo Size
                    </label>
                    <select
                      id="logo_size"
                      name="logo_size"
                      value={settings.settings.logo_size || 'medium'}
                      onChange={handleSettingsChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            {settings.type === 'menu' && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Menu Settings</h4>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="menu_id" className="block text-sm font-medium text-gray-700">
                      Select Menu
                    </label>
                    <select
                      id="menu_id"
                      name="menu_id"
                      value={settings.settings.menu_id || ''}
                      onChange={handleSettingsChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="">Select a menu</option>
                      {menus.map(menu => (
                        <option key={menu.id} value={menu.id}>
                          {menu.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="menu_style" className="block text-sm font-medium text-gray-700">
                      Menu Style
                    </label>
                    <select
                      id="menu_style"
                      name="menu_style"
                      value={settings.settings.menu_style || 'horizontal'}
                      onChange={handleSettingsChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="horizontal">Horizontal</option>
                      <option value="dropdown">Dropdown</option>
                      <option value="mega">Mega Menu</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            {settings.type === 'search' && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Search Settings</h4>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="search_style" className="block text-sm font-medium text-gray-700">
                      Search Style
                    </label>
                    <select
                      id="search_style"
                      name="search_style"
                      value={settings.settings.search_style || 'icon'}
                      onChange={handleSettingsChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="icon">Icon Only</option>
                      <option value="input">Input Field</option>
                      <option value="expandable">Expandable</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="placeholder" className="block text-sm font-medium text-gray-700">
                      Placeholder Text
                    </label>
                    <input
                      type="text"
                      id="placeholder"
                      name="placeholder"
                      value={settings.settings.placeholder || 'Search...'}
                      onChange={handleSettingsChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {settings.type === 'auth' && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Auth Buttons Settings</h4>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      id="show_login"
                      name="show_login"
                      type="checkbox"
                      checked={settings.settings.show_login !== false}
                      onChange={handleSettingsChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="show_login" className="ml-2 block text-sm text-gray-700">
                      Show Login Button
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="show_register"
                      name="show_register"
                      type="checkbox"
                      checked={settings.settings.show_register !== false}
                      onChange={handleSettingsChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="show_register" className="ml-2 block text-sm text-gray-700">
                      Show Register Button
                    </label>
                  </div>
                  
                  <div>
                    <label htmlFor="login_text" className="block text-sm font-medium text-gray-700">
                      Login Button Text
                    </label>
                    <input
                      type="text"
                      id="login_text"
                      name="login_text"
                      value={settings.settings.login_text || 'Login'}
                      onChange={handleSettingsChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="register_text" className="block text-sm font-medium text-gray-700">
                      Register Button Text
                    </label>
                    <input
                      type="text"
                      id="register_text"
                      name="register_text"
                      value={settings.settings.register_text || 'Register'}
                      onChange={handleSettingsChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {settings.type === 'cart' && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Cart Settings</h4>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      id="show_count"
                      name="show_count"
                      type="checkbox"
                      checked={settings.settings.show_count !== false}
                      onChange={handleSettingsChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="show_count" className="ml-2 block text-sm text-gray-700">
                      Show Item Count
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="show_total"
                      name="show_total"
                      type="checkbox"
                      checked={settings.settings.show_total || false}
                      onChange={handleSettingsChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="show_total" className="ml-2 block text-sm text-gray-700">
                      Show Cart Total
                    </label>
                  </div>
                </div>
              </div>
            )}
            
            {settings.type === 'custom' && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Custom Component Settings</h4>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="html_content" className="block text-sm font-medium text-gray-700">
                      HTML Content
                    </label>
                    <textarea
                      id="html_content"
                      name="html_content"
                      value={settings.settings.html_content || ''}
                      onChange={handleSettingsChange}
                      rows={5}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="<div>Custom HTML content</div>"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComponentSettingsModal;