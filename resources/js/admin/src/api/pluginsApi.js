// resources/js/admin/src/api/pluginsApi.js
import apiClient from './apiClient';

export const getPlugins = (params = {}) => {
	return apiClient.get('/plugins', { params });
};

export const getPlugin = (id) => {
	return apiClient.get(`/plugins/${id}`);
};

export const activatePlugin = (id) => {
	return apiClient.post(`/plugins/${id}/activate`);
};

export const deactivatePlugin = (id) => {
	return apiClient.post(`/plugins/${id}/deactivate`);
};

export const configurePlugin = (id, config) => {
	return apiClient.put(`/plugins/${id}/configure`, { config });
};

export const installPlugin = (data) => {
	return apiClient.post('/plugins/install', data);
};

export const uninstallPlugin = (id) => {
	return apiClient.delete(`/plugins/${id}`);
};
