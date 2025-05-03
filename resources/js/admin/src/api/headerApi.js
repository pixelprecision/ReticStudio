// resources/js/admin/src/api/headerApi.js
import apiClient from './apiClient';
import cacheClient from './cacheClient';

// Header settings
export const getHeaderSettings = () => {
  return cacheClient.get('/header/settings');
};

export const updateHeaderSettings = async (data) => {
  try {
    console.log('Sending header settings update request');

    // Data can be either FormData or a plain object
    let settingsData = data;

    // Convert FormData to plain object if needed
    if (data instanceof FormData) {
      settingsData = {};
      for (let [key, value] of data.entries()) {
        // Handle boolean conversions explicitly
        if (value === '1' || value === '0') {
          settingsData[key] = value === '1';
        } else {
          settingsData[key] = value;
        }
      }
    }

    console.log('Settings data to send:', settingsData);

    // Use application/json for PUT requests to Laravel
    const response = await apiClient.put('/header/settings', settingsData);
    
    // Invalidate header-related caches
    cacheClient.invalidateCache(['/header/', '/header/data', '/header/settings']);

    console.log('Header settings update response:', response);
    return response;
  } catch (error) {
    console.error('Header settings update error:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

export const uploadLogo = (formData) => {
  return apiClient.post('/header/upload-logo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const uploadFavicon = (formData) => {
  return apiClient.post('/header/upload-favicon', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// Header layouts
export const getLayouts = () => {
  return cacheClient.get('/header/layouts');
};

export const getLayout = (id) => {
  return cacheClient.get(`/header/layouts/${id}`);
};

export const createLayout = (data) => {
  return apiClient.post('/header/layouts', data);
};

export const updateLayout = (id, data) => {
  return apiClient.put(`/header/layouts/${id}`, data);
};

export const deleteLayout = (id) => {
  return apiClient.delete(`/header/layouts/${id}`);
};

// Header components
export const getComponents = (layoutId) => {
  return cacheClient.get(`/header/layouts/${layoutId}/components`);
};

export const createComponent = async (data) => {
  console.log('Creating component with data:', data);
  
  // Ensure settings is passed as a JSON string
  let componentData = { ...data };
  
  // Convert settings to JSON string if it's not already
  if (componentData.settings && typeof componentData.settings !== 'string') {
    componentData.settings = JSON.stringify(componentData.settings);
  }
  
  // Ensure header_layout_id is present
  if (!componentData.header_layout_id) {
    console.error('No header_layout_id provided for component creation');
  }
  
  const response = await apiClient.post('/header/components', componentData);
  
  // Invalidate header component caches
  cacheClient.invalidateCache(['/header/data', '/header/layouts', `/header/layouts/${componentData.header_layout_id}/components`]);
  
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
  
  const response = await apiClient.put(`/header/components/${id}`, componentData);
  
  // Invalidate header component caches
  cacheClient.invalidateCache(['/header/data', '/header/layouts', `/header/layouts/${componentData.header_layout_id}/components`]);
  
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
    const component = await cacheClient.get(`/header/components/${id}`).catch(() => null);
    const header_layout_id = component?.data?.header_layout_id || component?.data?.data?.header_layout_id;
    
    const response = await apiClient.delete(`/header/components/${id}`);
    console.log('Delete component API response:', response);
    
    // Invalidate header component caches
    const cacheKeys = ['/header/data'];
    if (header_layout_id) {
      cacheKeys.push(`/header/layouts/${header_layout_id}/components`);
    }
    cacheClient.invalidateCache(cacheKeys);
    
    return response;
  } catch (error) {
    console.error('API - Error deleting component:', error);
    console.error('API - Error response data:', error.response?.data);
    throw error;
  }
};

export const updateComponentPosition = (id, position) => {
  return apiClient.put(`/header/components/${id}/position`, {
    position
  });
};

export const reorderComponents = (components) => {
  return apiClient.post('/header/components/reorder', { components });
};

// Header API bundled functions
export const getHeaderData = async () => {
  try {
    const [headerSettingsResponse, headerLayoutsResponse, menusResponse] = await Promise.all([
      cacheClient.get('/header/settings'),
      cacheClient.get('/header/layouts'),
      cacheClient.get('/menus')
    ]);

    // Log the responses for debugging
    console.log('Header settings response:', headerSettingsResponse.data);
    console.log('Header layouts response:', headerLayoutsResponse.data);
    console.log('Menus response:', menusResponse.data);

    // Get the default/active layout
    let components = [];
    let activeLayoutId = null;
    let layouts = [];

    // Check if we have any layouts
    if (headerLayoutsResponse.data) {
      // Extract the layouts array based on the response structure
      layouts = Array.isArray(headerLayoutsResponse.data) ?
        headerLayoutsResponse.data :
        (headerLayoutsResponse.data.data || []);
    }

    // If we have layouts, use the default or first one
    if (layouts.length > 0) {
      const defaultLayout = layouts.find(layout => layout.is_default) || layouts[0];
      activeLayoutId = defaultLayout.id;
      const componentsResponse = await cacheClient.get(`/header/layouts/${activeLayoutId}/components`);
      console.log('Components response:', componentsResponse);
      // Make sure we're getting the data array correctly
      const rawComponents = componentsResponse.data && componentsResponse.data.data ?
        componentsResponse.data.data :
        (componentsResponse.data || []);
      
      // Process components to ensure they have header_layout_id
      components = rawComponents.map(comp => ({
        ...comp,
        header_layout_id: comp.header_layout_id || activeLayoutId
      }));
    } else {
      // No layouts exist, create a default layout
      console.log('No header layouts found. Creating a default layout...');
      try {
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

        const newLayoutResponse = await createLayout(defaultLayoutData);
        console.log('Created new default layout:', newLayoutResponse);

        // Extract layout ID from response
        if (newLayoutResponse.data && (newLayoutResponse.data.id || (newLayoutResponse.data.data && newLayoutResponse.data.data.id))) {
          activeLayoutId = newLayoutResponse.data.id || newLayoutResponse.data.data.id;
          // New layout should have default components, fetch them
          const componentsResponse = await cacheClient.get(`/header/layouts/${activeLayoutId}/components`);
          const rawComponents = componentsResponse.data && componentsResponse.data.data ?
            componentsResponse.data.data :
            (componentsResponse.data || []);
          
          // Process components to ensure they have header_layout_id
          components = rawComponents.map(comp => ({
            ...comp,
            header_layout_id: comp.header_layout_id || activeLayoutId
          }));
        }
      } catch (layoutError) {
        console.error('Error creating default layout:', layoutError);
      }
    }

    return {
      settings: headerSettingsResponse.data && headerSettingsResponse.data.settings ?
        headerSettingsResponse.data.settings :
        (headerSettingsResponse.data || {}),
      components: components,
      menus: menusResponse.data.data || [],
      activeLayoutId: activeLayoutId
    };
  } catch (error) {
    console.error('Error fetching header data:', error);
    throw error;
  }
};
