// resources/js/admin/src/components/common/Modal.jsx
import React from 'react';
import { FiX } from 'react-icons/fi';

const Modal = ({
	               isOpen,
	               onClose,
	               title,
	               children,
	               footer,
	               size = 'md', // sm, md, lg, xl, full
               }) => {
	if (!isOpen) return null;

	const sizeClasses = {
		sm: 'max-w-md',
		md: 'max-w-lg',
		lg: 'max-w-2xl',
		xl: 'max-w-4xl',
		full: 'max-w-full mx-4',
	};

	return (
		<div className="fixed z-50 inset-0 overflow-y-auto">
			<div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
				<div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
					<div className="absolute inset-0 bg-gray-500 opacity-75"></div>
				</div>

				<span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

				<div className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-full ${sizeClasses[size]}`}>
					<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
						<div className="flex justify-between items-center pb-3 border-b border-gray-200 mb-4">
							<h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
							<button
								onClick={onClose}
								type="button"
								className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							>
								<span className="sr-only">Close</span>
								<FiX className="h-6 w-6" aria-hidden="true" />
							</button>
						</div>
						<div>{children}</div>
					</div>

					{footer && (
						<div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
							{footer}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Modal;
