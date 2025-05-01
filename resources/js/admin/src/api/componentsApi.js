// resources/js/admin/src/api/componentsApi.js
import apiClient from './apiClient';

export const getComponents = (params = {}) => {
	return apiClient.get('/components', { params });
};

export const getComponent = (id) => {
	return apiClient.get(`/components/${id}`);
};

export const createComponent = (data) => {
	return apiClient.post('/components', data);
};

export const updateComponent = (id, data) => {
	return apiClient.put(`/components/${id}`, data);
};

export const deleteComponent = (id) => {
	return apiClient.delete(`/components/${id}`);
};
