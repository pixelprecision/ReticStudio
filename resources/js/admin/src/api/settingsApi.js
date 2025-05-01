// resources/js/admin/src/api/settingsApi.js
import apiClient from './apiClient';

export const getSettings = (group = null) => {
	const params = group ? { group } : {};
	return apiClient.get('/settings', { params });
};

export const getSetting = (key) => {
	return apiClient.get(`/settings/${key}`);
};

export const updateSetting = (key, value) => {
	return apiClient.put(`/settings/${key}`, { value });
};

export const updateBatchSettings = (settings) => {
	return apiClient.post('/settings/batch', settings);
};
