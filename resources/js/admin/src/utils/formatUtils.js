// resources/js/admin/src/utils/formatUtils.js

// Simple helper functions for working with forms
export const serialize = (form) => {
	const formData = new FormData(form);
	const data = {};

	for (let [key, value] of formData.entries()) {
		data[key] = value;
	}

	return data;
};

// resources/js/admin/src/utils/formatUtils.js
export const formatDate = (dateString) => {
	if (!dateString) return '';

	const date = new Date(dateString);
	return date.toLocaleDateString();
};

export const formatDateTime = (dateString) => {
	if (!dateString) return '';

	const date = new Date(dateString);
	return date.toLocaleString();
};

export const formatFileSize = (bytes) => {
	if (bytes === 0) return '0 Bytes';

	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const truncateText = (text, maxLength = 100) => {
	if (!text || text.length <= maxLength) return text;
	return text.slice(0, maxLength) + '...';
};

export const slugify = (text) => {
	return text
		.toString()
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-')      // Replace spaces with -
		.replace(/&/g, '-and-')    // Replace & with 'and'
		.replace(/[^\w\-]+/g, '')  // Remove all non-word characters
		.replace(/\-\-+/g, '-');   // Replace multiple - with single -
};

