// resources/js/admin/src/pages/header/HeaderSettingsPanel.jsx
import React, { useState, useEffect } from 'react';
import {FiRefreshCw, FiUpload} from 'react-icons/fi';
import MediaChooser from '../../components/media/MediaChooser';

const HeaderSettingsPanel = ({ settings, onSave, saving }) => {
  const [localSettings, setLocalSettings] = useState({
    logo_url: '',
    favicon_url: '',
    site_name: '',
    show_topbar: false,
    topbar_message: '',
    topbar_badge_color: 'badge-info',
    show_search: true,
    show_auth_buttons: true,
    show_cart: true,
    sticky_header: false,
    header_style: 'standard',
    transparent_header: false,
    mobile_menu_type: 'drawer',
    custom_header_classes: '',
    custom_topbar_classes: '',
    custom_subheader_classes: '',
    custom_logo_classes: '',
    custom_css: '',
  });

  // Favicon preview state
  const [faviconPreview, setFaviconPreview] = useState('');

  // Favicon file upload state
  const [faviconFile, setFaviconFile] = useState(null);

  useEffect(() => {
    if (settings) {
      console.log('Settings received in panel:', settings);

      setLocalSettings({
        logo_url: settings.logo_url || '',
        favicon_url: settings.favicon_url || '',
        site_name: settings.site_name || '',
        show_topbar: settings.show_topbar || false,
        topbar_message: settings.topbar_message || '',
        topbar_badge_color: settings.topbar_badge_color || 'badge-info',
        show_search: settings.show_search || false,
        show_auth_buttons: settings.show_auth_buttons || false,
        show_cart: settings.show_cart || false,
        sticky_header: settings.sticky_header || false,
        transparent_header: settings.transparent_header || false,
        header_style: settings.header_style || 'standard',
        mobile_menu_type: settings.mobile_menu_type || 'drawer',
        custom_header_classes: settings.custom_header_classes || '',
        custom_topbar_classes: settings.custom_topbar_classes || '',
        custom_subheader_classes: settings.custom_subheader_classes || '',
        custom_logo_classes: settings.custom_logo_classes || '',
        custom_css: settings.custom_css || '',
      });

      // Set favicon preview
      if (settings.favicon_url) {
        console.log('Setting favicon preview:', settings.favicon_url);
        setFaviconPreview(settings.favicon_url);
      }
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocalSettings({
      ...localSettings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Handle logo change from MediaChooser
  const handleLogoChange = (path) => {
    setLocalSettings({
      ...localSettings,
      logo_url: path
    });
  };

  const handleFaviconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFaviconFile(file);
      const previewUrl = URL.createObjectURL(file);
      setFaviconPreview(previewUrl);
    }
  };

  const handleRemoveFavicon = () => {
    setFaviconFile(null);
    setFaviconPreview('');
    setLocalSettings({
      ...localSettings,
      favicon_url: '',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log('Form submitted', localSettings);

    // Create form data to handle file uploads and settings
    const formData = new FormData();

    // Create a copy of the settings object
    const settingsObj = { ...localSettings };

    // Note: We keep the logo_url in the settings object since it's managed by MediaChooser
    // and will be updated through the API, not through form upload

    // Remove only the favicon URL from settings since we handle it manually
    delete settingsObj.favicon_url;

    // Append all settings to FormData
    Object.keys(settingsObj).forEach(key => {
      if (settingsObj[key] !== null && settingsObj[key] !== undefined) {
        // Convert booleans to strings for FormData
        if (typeof settingsObj[key] === 'boolean') {
          formData.append(key, settingsObj[key] ? '1' : '0');
        } else {
          formData.append(key, settingsObj[key]);
        }
      }
    });

    // Append favicon file if it exists
    if (faviconFile) {
      formData.append('favicon', faviconFile);
      console.log('Favicon file appended', faviconFile.name);
    }

    // Log formData entries for debugging
    console.log('FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    onSave(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Header Settings</h3>

      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          {/* Logo Upload */}
          <div>
            <h4 className="font-medium text-gray-700 mb-4">Logo Settings</h4>
            <div className="flex flex-col space-y-4">
              <div className="border border-gray-200 rounded-md p-4">
                <MediaChooser
                  value={localSettings.logo_url || ''}
                  onChange={handleLogoChange}
                  label="Choose or Upload Logo"
                  accept="image/*"
                  previewType="image"
                  endpoint="/api/header/upload-logo"
                  maxSize={2 * 1024 * 1024} // 2MB
                  placeholder="No logo selected"
                  fileParamName="logo"
                />

                <p className="mt-2 text-sm text-gray-500">
                  Upload a logo to display in your header. For best results, use a transparent PNG file.
                </p>
              </div>

              <div>
                <label htmlFor="custom_logo_classes" className="block text-sm font-medium text-gray-700">
                  Custom Logo Classes
                </label>
                <input
                  type="text"
                  id="custom_logo_classes"
                  name="custom_logo_classes"
                  value={localSettings.custom_logo_classes}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g. shadow-lg rounded-full"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Add custom Tailwind CSS classes to the logo image.
                </p>
              </div>
            </div>
          </div>

          {/* Favicon Upload */}
          <div>
            <h4 className="font-medium text-gray-700 mb-4">Favicon Settings</h4>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-16 h-16 border rounded-md flex items-center justify-center bg-gray-50">
                {faviconPreview ? (
                  <img
                    src={faviconPreview}
                    alt="Favicon preview"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <span className="text-gray-400 text-sm text-center">No favicon</span>
                )}
              </div>

              <div className="flex-grow">
                <div className="flex flex-col space-y-2">
                  <label htmlFor="favicon-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                    <div className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm">
                      <FiUpload className="mr-2" />
                      <span>{faviconPreview ? 'Change Favicon' : 'Upload Favicon'}</span>
                    </div>
                    <input
                      id="favicon-upload"
                      name="favicon"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleFaviconChange}
                    />
                  </label>

                  {faviconPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveFavicon}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                      <FiTrash2 className="mr-2" />
                      Remove Favicon
                    </button>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Upload a favicon (16x16 or 32x32 pixels) for browser tabs and bookmarks.
                </p>
              </div>
            </div>
          </div>

          {/* Top Bar Settings */}
          <div>
            <h4 className="font-medium text-gray-700 mb-4">Top Bar Settings</h4>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="show_topbar"
                  name="show_topbar"
                  type="checkbox"
                  checked={localSettings.show_topbar}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="show_topbar" className="ml-2 block text-sm text-gray-700">
                  Enable Top Bar
                </label>
              </div>

              {localSettings.show_topbar && (
                <>
                  <div>
                    <label htmlFor="topbar_message" className="block text-sm font-medium text-gray-700">
                      Top Bar Message
                    </label>
                    <input
                      type="text"
                      id="topbar_message"
                      name="topbar_message"
                      value={localSettings.topbar_message}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Free shipping on all orders over $50!"
                    />
                  </div>

                  <div>
                    <label htmlFor="topbar_badge_color" className="block text-sm font-medium text-gray-700">
                      Top Bar Badge Color
                    </label>
                    <div className="mt-1">
                      <select
                        id="topbar_badge_color"
                        name="topbar_badge_color"
                        value={localSettings.topbar_badge_color}
                        onChange={handleChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="badge-info">Blue (Info)</option>
                        <option value="badge-success">Green (Success)</option>
                        <option value="badge-warning">Yellow (Warning)</option>
                        <option value="badge-error">Red (Error)</option>
                        <option value="badge-neutral">Gray (Neutral)</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Header Behavior */}
          <div>
            <h4 className="font-medium text-gray-700 mb-4">Header Behavior</h4>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="sticky_header"
                  name="sticky_header"
                  type="checkbox"
                  checked={localSettings.sticky_header}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="sticky_header" className="ml-2 block text-sm text-gray-700">
                  Sticky Header (stays fixed at the top when scrolling)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="transparent_header"
                  name="transparent_header"
                  type="checkbox"
                  checked={localSettings.transparent_header}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="transparent_header" className="ml-2 block text-sm text-gray-700">
                  Transparent Header (on homepage)
                </label>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div>
            <h4 className="font-medium text-gray-700 mb-4">Advanced Settings</h4>
            <div className="space-y-4">
              <div>
                <label htmlFor="custom_topbar_classes" className="block text-sm font-medium text-gray-700">
                  Custom Topbar Classes
                </label>
                <input
                  type="text"
                  id="custom_topbar_classes"
                  name="custom_topbar_classes"
                  value={localSettings.custom_topbar_classes}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g. bg-blue-900 text-white"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Add custom Tailwind CSS classes to the top bar container.
                </p>
              </div>

              <div>
                <label htmlFor="custom_header_classes" className="block text-sm font-medium text-gray-700">
                  Custom Header Classes
                </label>
                <input
                  type="text"
                  id="custom_header_classes"
                  name="custom_header_classes"
                  value={localSettings.custom_header_classes}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g. bg-gradient-to-r from-blue-500 to-purple-600"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Add custom Tailwind CSS classes to the main header container.
                </p>
              </div>

              <div>
                <label htmlFor="custom_subheader_classes" className="block text-sm font-medium text-gray-700">
                  Custom Subheader Classes
                </label>
                <input
                  type="text"
                  id="custom_subheader_classes"
                  name="custom_subheader_classes"
                  value={localSettings.custom_subheader_classes}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g. bg-gray-100 border-t border-gray-200"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Add custom Tailwind CSS classes to the subheader container.
                </p>
              </div>

              <div>
                <label htmlFor="custom_css" className="block text-sm font-medium text-gray-700">
                  Custom CSS
                </label>
                <textarea
                  id="custom_css"
                  name="custom_css"
                  rows={4}
                  value={localSettings.custom_css}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder=".header-logo { transform: scale(1.2); }"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Add custom CSS for fine-grained control over header styling.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            disabled={saving}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <FiRefreshCw className="animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HeaderSettingsPanel;
