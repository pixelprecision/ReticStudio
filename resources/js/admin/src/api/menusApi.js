// resources/js/admin/src/api/menusApi.js
import apiClient from './apiClient';

export const getMenus = (params = {}) => {
	return apiClient.get('/menus', { params });
};

export const getMenu = (id) => {
	return apiClient.get(`/menus/${id}`);
};

export const createMenu = (data) => {
	return apiClient.post('/menus', data);
};

export const updateMenu = (id, data) => {
	return apiClient.put(`/menus/${id}`, data);
};

export const deleteMenu = (id) => {
	return apiClient.delete(`/menus/${id}`);
};

export const getPublicMenu = (slug) => {
	return apiClient.get(`/menus/${slug}/public`);
};
