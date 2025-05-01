// resources/js/admin/src/api/formsApi.js
import apiClient from './apiClient';

export const getForms = (params = {}) => {
	return apiClient.get('/forms', { params });
};

export const getForm = (id) => {
	return apiClient.get(`/forms/${id}`);
};

export const createForm = (data) => {
	return apiClient.post('/forms', data);
};

export const updateForm = (id, data) => {
	return apiClient.put(`/forms/${id}`, data);
};

export const deleteForm = (id) => {
	return apiClient.delete(`/forms/${id}`);
};

export const getFormSubmissions = (formId, params = {}) => {
	return apiClient.get(`/forms/${formId}/submissions`, { params });
};

export const getFormSubmission = (formId, submissionId) => {
	return apiClient.get(`/forms/${formId}/submissions/${submissionId}`);
};

export const markAsSpam = (formId, submissionId) => {
	return apiClient.post(`/forms/${formId}/submissions/${submissionId}/mark-as-spam`);
};

export const markAsNotSpam = (formId, submissionId) => {
	return apiClient.post(`/forms/${formId}/submissions/${submissionId}/mark-as-not-spam`);
};

export const deleteFormSubmission = (formId, submissionId) => {
	return apiClient.delete(`/forms/${formId}/submissions/${submissionId}`);
};

export const exportFormSubmissions = (formId, format = 'csv') => {
	return apiClient.get(`/forms/${formId}/export`, {
		params: { format },
		responseType: 'blob'
	});
};
