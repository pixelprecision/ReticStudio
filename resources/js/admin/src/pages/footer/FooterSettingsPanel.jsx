// resources/js/admin/src/pages/footer/FooterSettingsPanel.jsx
import React, { useState, useEffect } from 'react';
import { FiSave } from 'react-icons/fi';
import MediaChooser from '../../components/media/MediaChooser';

const FooterSettingsPanel = ({ settings, saving, onSave }) => {
  // Initialize with settings, ensuring we properly capture the logo field
  const [localSettings, setLocalSettings] = useState(() => {
    // Make a copy of settings and ensure logo field exists
    const initialSettings = {...settings};
    // If logo_url exists but logo doesn't, set logo from logo_url
    if (settings && settings.logo_url && !settings.logo) {
      initialSettings.logo = settings.logo_url;
    }
    return initialSettings;
  });
  
  // Update settings when the props change
  useEffect(() => {
    if (settings) {
      console.log('Footer settings updated from props:', settings);
      
      // Create a new settings object with merged data
      const updatedSettings = {...settings};
      
      // Ensure logo is preserved
      if (settings.logo_url && !settings.logo) {
        updatedSettings.logo = settings.logo_url;
      }
      
      // Update state
      setLocalSettings(updatedSettings);
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocalSettings({
      ...localSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle logo change from MediaChooser
  const handleLogoChange = (path) => {
    console.log('Logo path changed to:', path);
    setLocalSettings({
      ...localSettings,
      logo: path
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create a new clean object for settings 
    // We'll explicitly select only the fields we want to send to the API
    const cleanSettings = {
      site_name: localSettings.site_name || '',
      copyright_text: localSettings.copyright_text || '',
      footer_style: localSettings.footer_style || 'standard',
      position: localSettings.position || 'bottom',
      columns: parseInt(localSettings.columns || 3, 10),
      show_footer: !!localSettings.show_footer,
      show_footer_bar: !!localSettings.show_footer_bar,
      footer_bar_message: localSettings.footer_bar_message || '',
      footer_bar_badge_color: localSettings.footer_bar_badge_color || 'badge-info',
      footer_background_color: localSettings.footer_background_color || '',
      footer_text_color: localSettings.footer_text_color || '',
      show_social_icons: !!localSettings.show_social_icons,
      custom_css: localSettings.custom_css || '',
      custom_footer_classes: localSettings.custom_footer_classes || '',
      custom_footer_bar_classes: localSettings.custom_footer_bar_classes || '',
      custom_logo_classes: localSettings.custom_logo_classes || ''
    };
    
    // IMPORTANT: Explicitly set the logo field
    // Try to get it from multiple possible sources
    cleanSettings.logo = localSettings.logo || localSettings.logo_url || '';
    
    console.log('Clean settings object for submission:', cleanSettings);
    
    // Create a FormData object to handle the form data
    const formData = new FormData();

    // Add all fields to the FormData
    Object.entries(cleanSettings).forEach(([key, value]) => {
      // Convert boolean values to "1" or "0" for PHP/Laravel
      console.log(`Adding to FormData: ${key} = ${value}`);
      if (typeof value === 'boolean') {
        formData.append(key, value ? '1' : '0');
      } else if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    // Debug the FormData
    console.log('FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
    
    // Check specifically for logo field
    console.log('Logo in FormData:', formData.get('logo'));
    
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-md shadow-md">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
        <div className="lg:col-span-1">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Footer Settings</h3>
          <p className="text-sm text-gray-500 mb-6">
            Configure how your site's footer appears to visitors. Changes will apply to all pages.
          </p>

          {/* Logo Upload Section with MediaChooser */}
          <div className="mt-6 border border-gray-200 rounded-md p-4">
            <h4 className="font-medium text-gray-700 mb-2">Footer Logo</h4>

            <MediaChooser
              value={localSettings.logo || ''}
              onChange={handleLogoChange}
              label="Choose or Upload Logo"
              accept="image/*"
              previewType="image"
              endpoint="/api/footer/upload-logo"
              maxSize={2 * 1024 * 1024} // 2MB
              placeholder="No logo selected"
              fileParamName="logo"
            />

            <p className="mt-3 text-xs text-gray-500">
              Recommended size: 200px × 60px. Maximum file size: 2MB.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* General Settings */}
          <div className="bg-white overflow-hidden border border-gray-200 rounded-md">
            <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">General Settings</h3>
            </div>
            <div className="px-4 py-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site Name
                </label>
                <input
                  type="text"
                  name="site_name"
                  value={localSettings.site_name || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Copyright Text
                </label>
                <input
                  type="text"
                  name="copyright_text"
                  value={localSettings.copyright_text || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use {`{year}`} to dynamically insert the current year.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Footer Style
                </label>
                <select
                  name="footer_style"
                  value={localSettings.footer_style || 'standard'}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="standard">Standard</option>
                  <option value="centered">Centered</option>
                  <option value="columns">Columns</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Columns
                </label>
                <select
                  name="columns"
                  value={localSettings.columns || 3}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="1">1 Column</option>
                  <option value="2">2 Columns</option>
                  <option value="3">3 Columns</option>
                  <option value="4">4 Columns</option>
                  <option value="5">5 Columns</option>
                  <option value="6">6 Columns</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  The number of columns to display in the footer editor and on the site.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Footer Bar Position
                </label>
                <select
                  name="position"
                  value={localSettings.position || 'bottom'}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="top">Top (Above main footer)</option>
                  <option value="bottom">Bottom (Below main footer)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Position the footer bar above or below the main footer content.
                </p>
              </div>
            </div>
          </div>

          {/* Display Options */}
          <div className="bg-white overflow-hidden border border-gray-200 rounded-md">
            <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Display Options</h3>
            </div>
            <div className="px-4 py-5 sm:p-6 space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="show_footer"
                  name="show_footer"
                  checked={!!localSettings.show_footer}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label htmlFor="show_footer" className="ml-2 text-sm text-gray-700">
                  Show Footer
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="show_footer_bar"
                  name="show_footer_bar"
                  checked={!!localSettings.show_footer_bar}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label htmlFor="show_footer_bar" className="ml-2 text-sm text-gray-700">
                  Show Footer Bar
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="show_social_icons"
                  name="show_social_icons"
                  checked={!!localSettings.show_social_icons}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label htmlFor="show_social_icons" className="ml-2 text-sm text-gray-700">
                  Show Social Icons
                </label>
              </div>
            </div>
          </div>

          {/* Footer Bar Message */}
          {localSettings.show_footer_bar && (
            <div className="bg-white overflow-hidden border border-gray-200 rounded-md">
              <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Footer Bar</h3>
              </div>
              <div className="px-4 py-5 sm:p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Footer Bar Message
                  </label>
                  <input
                    type="text"
                    name="footer_bar_message"
                    value={localSettings.footer_bar_message || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use | to separate a main and secondary message.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Badge Color
                  </label>
                  <select
                    name="footer_bar_badge_color"
                    value={localSettings.footer_bar_badge_color || 'badge-info'}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="badge-info">Info (Blue)</option>
                    <option value="badge-success">Success (Green)</option>
                    <option value="badge-warning">Warning (Yellow)</option>
                    <option value="badge-error">Error (Red)</option>
                    <option value="badge-neutral">Neutral (Gray)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Colors */}
          <div className="bg-white overflow-hidden border border-gray-200 rounded-md">
            <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Colors</h3>
            </div>
            <div className="px-4 py-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Footer Background Color
                </label>
                <input
                  type="text"
                  name="footer_background_color"
                  value={localSettings.footer_background_color || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="#000000 or rgba(0,0,0,0.5)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Footer Text Color
                </label>
                <input
                  type="text"
                  name="footer_text_color"
                  value={localSettings.footer_text_color || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="#ffffff or white"
                />
              </div>
            </div>
          </div>

          {/* Custom Classes */}
          <div className="bg-white overflow-hidden border border-gray-200 rounded-md">
            <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Custom Classes</h3>
            </div>
            <div className="px-4 py-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Footer Classes
                </label>
                <input
                  type="text"
                  name="custom_footer_classes"
                  value={localSettings.custom_footer_classes || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="custom-class-1 custom-class-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Footer Bar Classes
                </label>
                <input
                  type="text"
                  name="custom_footer_bar_classes"
                  value={localSettings.custom_footer_bar_classes || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="custom-class-1 custom-class-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Logo Classes
                </label>
                <input
                  type="text"
                  name="custom_logo_classes"
                  value={localSettings.custom_logo_classes || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="custom-class-1 custom-class-2"
                />
              </div>
            </div>
          </div>

          {/* Custom CSS */}
          <div className="bg-white overflow-hidden border border-gray-200 rounded-md">
            <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Custom CSS</h3>
            </div>
            <div className="px-4 py-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom CSS
                </label>
                <textarea
                  name="custom_css"
                  value={localSettings.custom_css || ''}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder=".footer-custom { color: blue; }"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-2">
        <button
          type="submit"
          disabled={saving}
          className={`
            px-4 py-2 flex items-center rounded-md
            ${saving 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-green-600 text-white hover:bg-green-700'
            }
          `}
        >
          {saving ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <FiSave className="mr-2" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default FooterSettingsPanel;
