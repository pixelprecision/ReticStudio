// resources/js/admin/src/api/themesApi.js
import apiClient from './apiClient';

export const getThemes = (params = {}) => {
	return apiClient.get('/themes', { params });
};

export const getTheme = (id) => {
	return apiClient.get(`/themes/${id}`);
};

export const createTheme = (data) => {
	return apiClient.post('/themes', data);
};

export const updateTheme = (id, data) => {
	return apiClient.put(`/themes/${id}`, data);
};

export const deleteTheme = (id) => {
	return apiClient.delete(`/themes/${id}`);
};

export const activateTheme = (id) => {
	return apiClient.post(`/themes/${id}/activate`);
};

export const getActiveTheme = () => {
	return apiClient.get('/themes/active');
};

export const duplicateTheme = (id) => {
	return apiClient.post(`/themes/${id}/duplicate`);
};
