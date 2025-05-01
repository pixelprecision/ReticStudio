// resources/js/admin/src/components/common/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ size = 'md', fullScreen = false, message = 'Loading...' }) => {
	const sizeClasses = {
		sm: 'h-4 w-4',
		md: 'h-8 w-8',
		lg: 'h-12 w-12',
		xl: 'h-16 w-16',
	};

	const spinner = (
		<div className="flex flex-col items-center justify-center">
			<div className={`animate-spin rounded-full border-t-2 border-b-2 border-blue-500 ${sizeClasses[size]}`}></div>
			{message && <p className="mt-2 text-gray-600">{message}</p>}
		</div>
	);

	if (fullScreen) {
		return (
			<div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
				{spinner}
			</div>
		);
	}

	return spinner;
};

export default LoadingSpinner;
