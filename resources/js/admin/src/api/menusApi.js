// resources/js/admin/src/api/menusApi.js
import apiClient from './apiClient';
import cacheClient from './cacheClient';

export const getMenus = (params = {}) => {
	return cacheClient.get('/menus', params);
};

export const getMenu = (id) => {
	return cacheClient.get(`/menus/${id}`);
};

export const createMenu = async (data) => {
	const response = await apiClient.post('/menus', data);
	// Invalidate menu caches
	cacheClient.invalidateCache(['/menus']);
	return response;
};

export const updateMenu = async (id, data) => {
	const response = await apiClient.put(`/menus/${id}`, data);
	// Invalidate menu caches
	cacheClient.invalidateCache(['/menus', `/menus/${id}`, '/footer/data', '/header/data']);
	return response;
};

export const deleteMenu = async (id) => {
	const response = await apiClient.delete(`/menus/${id}`);
	// Invalidate menu caches
	cacheClient.invalidateCache(['/menus', `/menus/${id}`, '/footer/data', '/header/data']);
	return response;
};

export const getPublicMenu = (slug) => {
	return cacheClient.get(`/menus/${slug}/public`);
};
