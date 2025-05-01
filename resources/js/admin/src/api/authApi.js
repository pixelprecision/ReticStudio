// resources/js/admin/src/api/authApi.js
import apiClient from './apiClient';

export const login = (credentials) => {
	return apiClient.post('/auth/login', credentials);
};

export const logout = () => {
	return apiClient.post('/auth/logout');
};

export const getUserProfile = () => {
	return apiClient.get('/auth/user-profile');
};

export const forgotPassword = (email) => {
	return apiClient.post('/auth/forgot-password', { email });
};

export const resetPassword = (data) => {
	return apiClient.post('/auth/reset-password', data);
};
