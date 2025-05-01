// resources/js/admin/src/api/pagesApi.js
import apiClient from './apiClient';

export const getPages = (params = {}) => {
	return apiClient.get('/pages', { params });
};

export const getPage = (id) => {
	return apiClient.get(`/pages/${id}`);
};

export const createPage = (data) => {
	return apiClient.post('/pages', data);
};

export const updatePage = (id, data) => {
	return apiClient.put(`/pages/${id}`, data);
};

export const deletePage = (id) => {
	return apiClient.delete(`/pages/${id}`);
};

export const getPageRevisions = (id) => {
	return apiClient.get(`/pages/${id}/revisions`);
};

export const restorePageRevision = (id, revisionId) => {
	return apiClient.post(`/pages/${id}/revisions/${revisionId}/restore`);
};

// Public API methods - these don't need auth
export const getPublicPage = (slug) => {
	return apiClient.get(`/pages/by-slug/${slug}`);
};

export const getPreviewPage = (slug) => {
	return apiClient.get(`/pages/preview/${slug}`);
};
