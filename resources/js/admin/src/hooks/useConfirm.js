// resources/js/admin/src/hooks/useConfirm.js
import { useCallback, useState } from 'react';

// Hook for confirming actions with modals
export const useConfirm = () => {
	const [state, setState] = useState({
		                                   isOpen: false,
		                                   title: '',
		                                   message: '',
		                                   onConfirm: null,
		                                   onCancel: null,
		                                   confirmButtonText: 'Confirm',
		                                   cancelButtonText: 'Cancel',
		                                   type: 'confirm', // 'confirm', 'delete', 'warning'
	                                   });

	const confirm = useCallback((options) => {
		return new Promise((resolve) => {
			setState({
				         isOpen: true,
				         onConfirm: () => {
					         setState(prev => ({ ...prev, isOpen: false }));
					         resolve(true);
				         },
				         onCancel: () => {
					         setState(prev => ({ ...prev, isOpen: false }));
					         resolve(false);
				         },
				         title: 'Confirm Action',
				         message: 'Are you sure you want to perform this action?',
				         confirmButtonText: 'Confirm',
				         cancelButtonText: 'Cancel',
				         type: 'confirm',
				         ...options,
			         });
		});
	}, []);

	const confirmDelete = useCallback((options) => {
		return confirm({
			               title: 'Delete Confirmation',
			               message: 'Are you sure you want to delete this item? This action cannot be undone.',
			               confirmButtonText: 'Delete',
			               type: 'delete',
			               ...options,
		               });
	}, [confirm]);

	return {
		confirm,
		confirmDelete,
		...state,
	};
};
