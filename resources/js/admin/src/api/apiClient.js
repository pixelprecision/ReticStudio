// resources/js/admin/src/api/apiClient.js
import axios from 'axios';

// Create an axios instance
const apiClient = axios.create({
	                               baseURL: '/api',
	                               headers: {
		                               'Content-Type': 'application/json',
		                               'Accept': 'application/json'
	                               }
                               });

// Add a request interceptor to include the token and handle Laravel 12 requirements
apiClient.interceptors.request.use(
	(config) => {
		// Add auth token
		const token = localStorage.getItem('token');
		if (token) {
			config.headers['Authorization'] = `Bearer ${token}`;
		}

		// Handle PUT requests properly for Laravel 12
		if (config.method === 'put') {
			// Make sure PUT requests have the correct headers for Laravel
			config.headers['X-HTTP-Method-Override'] = 'PUT';
			config.headers['Content-Type'] = 'application/json';
			config.headers['Accept'] = 'application/json';

			// Add CSRF token if available
			const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
			if (csrfToken) {
				config.headers['X-CSRF-TOKEN'] = csrfToken;
			}

			// Convert FormData to JSON if needed
			if (config.data instanceof FormData) {
				const formDataObj = {};
				for (let [key, value] of config.data.entries()) {
					// Handle boolean conversions
					if (value === '1' || value === '0') {
						formDataObj[key] = value === '1';
					} else {
						formDataObj[key] = value;
					}
				}
				config.data = formDataObj;
				console.log(config);
			}
		}

		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Add a response interceptor for error handling
apiClient.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		const { response } = error;

		// Handle token expiration
		if (response && response.status === 401) {
			localStorage.removeItem('token');
			if (window.location.pathname !== '/admin/login') {
				window.location.href = '/admin/login';
			}
		}

		// Handle server errors
		if (response && response.status >= 500) {
			showToast('Server Error', 'Something went wrong on our end. Please try again later.', 'error');
		}

		return Promise.reject(error);
	}
);

// Simple toast notification function
export const showToast = (title, message, type = 'success') => {
	// Create toast element
	const toast = document.createElement('div');
	toast.className = `fixed top-4 right-4 z-50 flex items-center p-4 mb-4 rounded-lg shadow-lg max-w-xs ${
		type === 'success' ? 'bg-green-100 text-green-800' :
		type === 'error' ? 'bg-red-100 text-red-800' :
		type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
		'bg-blue-100 text-blue-800'
	}`;

	// Create toast content
	toast.innerHTML = `
    <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg ${
		type === 'success' ? 'bg-green-200 text-green-500' :
		type === 'error' ? 'bg-red-200 text-red-500' :
		type === 'warning' ? 'bg-yellow-200 text-yellow-500' :
		'bg-blue-200 text-blue-500'
	}">
      ${
		type === 'success' ?
		'<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>' :
		type === 'error' ?
		'<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>' :
		type === 'warning' ?
		'<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>' :
		'<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>'
	}
    </div>
    <div class="ml-3 text-sm font-medium">
      ${title ? `<div class="font-semibold">${title}</div>` : ''}
      ${message}
    </div>
    <button type="button" class="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 inline-flex h-8 w-8 text-gray-500 hover:text-gray-700" aria-label="Close">
      <span class="sr-only">Close</span>
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
    </button>
  `;

	// Add to document
	document.body.appendChild(toast);

	// Add close event listener
	toast.querySelector('button').addEventListener('click', () => {
		toast.remove();
	});

	// Auto remove after 5 seconds
	setTimeout(() => {
		toast.remove();
	}, 5000);
};

export const handleApiError = (error, setFieldErrors) => {
	if (error.response && error.response.data && error.response.data.errors) {
		setFieldErrors(error.response.data.errors);
		return error.response.data.errors;
	}

	if (error.response && error.response.data && error.response.data.message) {
		showToast('Error', error.response.data.message, 'error');
		return { _error: error.response.data.message };
	}

	showToast('Error', 'An unexpected error occurred. Please try again.', 'error');
	return { _error: 'An unexpected error occurred. Please try again.' };
};


export default apiClient;





















