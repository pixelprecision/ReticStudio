// resources/js/admin/src/api/footerApi.js
import apiClient from './apiClient';
import cacheClient from './cacheClient';

// Footer settings
export const getFooterSettings = () => {
  return cacheClient.get('/footer/settings');
};

export const updateFooterSettings = async (data) => {
  try {
    console.log('Sending footer settings update request');

    // Create a clean object to send to the server
    let cleanData = {};
    
    // Handle FormData properly
    if (data instanceof FormData) {
      // Check if logo is present
      const hasLogo = data.has('logo');
      console.log('FormData has logo field:', hasLogo, data.get('logo'));
      
      // Convert FormData to clean object, ensuring proper types
      for (let [key, value] of data.entries()) {
        if (key === 'id') {
          // Properly handle ID field (should be a number, not a boolean)
          const idValue = parseInt(value, 10);
          if (!isNaN(idValue)) {
            cleanData[key] = idValue;
          }
        } else if (value === '1' || value === '0') {
          // Convert string booleans to actual booleans
          cleanData[key] = value === '1';
        } else {
          cleanData[key] = value;
        }
      }
    } else {
      // If it's already an object, just copy it
      cleanData = { ...data };
      
      // Make sure the logo field is included if it exists
      if (data.logo || data.logo_url) {
        cleanData.logo = data.logo || data.logo_url;
      }
    }

    console.log('Clean settings data to send:', cleanData);

    // Use application/json for PUT requests to Laravel
    const response = await apiClient.put('/footer/settings', cleanData);

    // Invalidate footer-related caches
    cacheClient.invalidateCache(['/footer/', '/footer/data', '/footer/settings']);
    
    console.log('Footer settings update response:', response);
    return response;
  } catch (error) {
    console.error('Footer settings update error:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

export const uploadLogo = (formData) => {
  return apiClient.post('/footer/upload-logo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// Footer layouts
export const getLayouts = () => {
  return cacheClient.get('/footer/layouts');
};

export const getLayout = (id) => {
  return cacheClient.get(`/footer/layouts/${id}`);
};

export const createLayout = (data) => {
  return apiClient.post('/footer/layouts', data);
};

export const updateLayout = (id, data) => {
  return apiClient.put(`/footer/layouts/${id}`, data);
};

export const deleteLayout = (id) => {
  return apiClient.delete(`/footer/layouts/${id}`);
};

// Footer components
export const getComponents = (layoutId) => {
  return cacheClient.get(`/footer/layouts/${layoutId}/components`);
};

export const createComponent = async (data) => {
  console.log('Creating component with data:', data);
  
  // Ensure settings is passed as a JSON string
  let componentData = { ...data };
  
  // Convert settings to JSON string if it's not already
  if (componentData.settings && typeof componentData.settings !== 'string') {
    componentData.settings = JSON.stringify(componentData.settings);
  }
  
  // Ensure footer_layout_id is present
  if (!componentData.footer_layout_id) {
    console.error('No footer_layout_id provided for component creation');
  }
  
  const response = await apiClient.post('/footer/components', componentData);
  
  // Invalidate footer component caches
  cacheClient.invalidateCache(['/footer/data', '/footer/layouts', `/footer/layouts/${componentData.footer_layout_id}/components`]);
  
  return response;
};

export const updateComponent = async (id, data) => {
  console.log('Updating component with data:', data);
  
  // Ensure settings is passed as a JSON string
  let componentData = { ...data };
  
  // Convert settings to JSON string if it's not already
  if (componentData.settings && typeof componentData.settings !== 'string') {
    componentData.settings = JSON.stringify(componentData.settings);
  }
  
  const response = await apiClient.put(`/footer/components/${id}`, componentData);
  
  // Invalidate footer component caches
  cacheClient.invalidateCache(['/footer/data', '/footer/layouts', `/footer/layouts/${componentData.footer_layout_id}/components`]);
  
  return response;
};

export const deleteComponent = async (id) => {
  if (!id) {
    console.error('Invalid component ID for deletion:', id);
    throw new Error('Invalid component ID');
  }
  
  console.log('API - Deleting component with ID:', id);
  try {
    // First get the component to know its layout_id
    const component = await cacheClient.get(`/footer/components/${id}`).catch(() => null);
    const footer_layout_id = component?.data?.footer_layout_id || component?.data?.data?.footer_layout_id;
    
    const response = await apiClient.delete(`/footer/components/${id}`);
    console.log('Delete component API response:', response);
    
    // Invalidate footer component caches
    const cacheKeys = ['/footer/data'];
    if (footer_layout_id) {
      cacheKeys.push(`/footer/layouts/${footer_layout_id}/components`);
    }
    cacheClient.invalidateCache(cacheKeys);
    
    return response;
  } catch (error) {
    console.error('API - Error deleting component:', error);
    console.error('API - Error response data:', error.response?.data);
    throw error;
  }
};

export const reorderComponents = (components) => {
  return apiClient.post('/footer/components/reorder', { components });
};

export const updateComponentPosition = (id, positionData) => {
  console.log('Updating component position:', id, positionData);
  return apiClient.put(`/footer/components/${id}/position`, positionData);
};

// Footer API bundled functions
export const getFooterData = async () => {
  try {
    const response = await cacheClient.get('/footer/data');
    console.log('Footer data response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching footer data:', error);
    throw error;
  }
};

// Get available menus for footer components
export const getAvailableMenus = async () => {
  try {
    const response = await cacheClient.get('/footer/available-menus');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching available menus:', error);
    throw error;
  }
};

// Get available page components for use in footer
export const getAvailableComponents = async () => {
  try {
    const response = await cacheClient.get('/footer/available-components');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching available components:', error);
    throw error;
  }
};