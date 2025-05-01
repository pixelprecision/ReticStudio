// resources/js/admin/src/api/mediaApi.js
import apiClient from './apiClient';

export const getMedia = (params = {}) => {
	return apiClient.get('/media', { params });
};

export const uploadMedia = (formData) => {
	return apiClient.post('/media', formData, {
		headers: {
			'Content-Type': 'multipart/form-data'
		}
	});
};

export const getMediaItem = (id) => {
	return apiClient.get(`/media/${id}`);
};

export const updateMediaItem = (id, data) => {
	return apiClient.put(`/media/${id}`, data);
};

export const deleteMediaItem = (id) => {
	return apiClient.delete(`/media/${id}`);
};

export const getMediaCollections = () => {
	return apiClient.get('/media-collections');
};

export const createMediaCollection = (data) => {
	return apiClient.post('/media-collections', data);
};

export const updateMediaCollection = (id, data) => {
	return apiClient.put(`/media-collections/${id}`, data);
};

export const deleteMediaCollection = (id) => {
	return apiClient.delete(`/media-collections/${id}`);
};
