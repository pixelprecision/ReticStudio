// resources/js/admin/src/utils/formUtils.js
export const validateEmail = (email) => {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validateRequired = (value) => {
	if (Array.isArray(value)) {
		return value.length > 0;
	}

	if (typeof value === 'object' && value !== null) {
		return Object.keys(value).length > 0;
	}

	return value !== undefined && value !== null && value !== '';
};

export const validateMinLength = (value, minLength) => {
	if (!value) return false;
	return String(value).length >= minLength;
};

export const validateMaxLength = (value, maxLength) => {
	if (!value) return true;
	return String(value).length <= maxLength;
};

export const validateUrl = (value) => {
	try {
		new URL(value);
		return true;
	} catch (error) {
		return false;
	}
};
