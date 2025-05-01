// resources/js/admin/src/components/common/ModalButton.jsx
import React from 'react';
import { useApp } from '../../store/AppContext';

const ModalButton = ({
	                     component,
	                     props = {},
	                     size = 'md',
	                     children,
	                     className = '',
	                     ...rest
                     }) => {
	const { openModal } = useApp();

	const handleClick = () => {
		openModal(component, props, size);
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			className={className || 'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}
			{...rest}
		>
			{children}
		</button>
	);
};

export default ModalButton;
