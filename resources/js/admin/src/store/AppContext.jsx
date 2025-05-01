// resources/js/admin/src/store/AppContext.jsx
import React, { createContext, useContext, useReducer } from 'react';
import ConfirmDialog from '../components/common/ConfirmDialog';

// Create Context
const AppContext = createContext();

// Initial state
const initialState = {
	sidebarOpen: false,
	modal: {
		isOpen: false,
		component: null,
		props: {},
		size: 'md', // sm, md, lg, xl, full
	},
	confirm: {
		isOpen: false,
		title: '',
		message: '',
		onConfirm: null,
		onCancel: null,
		confirmButtonText: 'Confirm',
		cancelButtonText: 'Cancel',
		type: 'confirm',
	},
};

// Action types
const TOGGLE_SIDEBAR = 'TOGGLE_SIDEBAR';
const OPEN_MODAL = 'OPEN_MODAL';
const CLOSE_MODAL = 'CLOSE_MODAL';
const OPEN_CONFIRM = 'OPEN_CONFIRM';
const CLOSE_CONFIRM = 'CLOSE_CONFIRM';

// Reducer
const appReducer = (state, action) => {
	switch (action.type) {
		case TOGGLE_SIDEBAR:
			return {
				...state,
				sidebarOpen: action.payload !== undefined ? action.payload : !state.sidebarOpen,
			};
		case OPEN_MODAL:
			return {
				...state,
				modal: {
					isOpen: true,
					component: action.payload.component,
					props: action.payload.props || {},
					size: action.payload.size || 'md',
				},
			};
		case CLOSE_MODAL:
			return {
				...state,
				modal: {
					...state.modal,
					isOpen: false,
				},
			};
		case OPEN_CONFIRM:
			return {
				...state,
				confirm: {
					isOpen: true,
					title: action.payload.title || 'Confirm',
					message: action.payload.message || 'Are you sure you want to perform this action?',
					onConfirm: action.payload.onConfirm,
					onCancel: action.payload.onCancel,
					confirmButtonText: action.payload.confirmButtonText || 'Confirm',
					cancelButtonText: action.payload.cancelButtonText || 'Cancel',
					type: action.payload.type || 'confirm',
				},
			};
		case CLOSE_CONFIRM:
			return {
				...state,
				confirm: {
					...state.confirm,
					isOpen: false,
				},
			};
		default:
			return state;
	}
};

// Provider Component
export const AppProvider = ({ children }) => {
	const [state, dispatch] = useReducer(appReducer, initialState);

	// Actions
	const toggleSidebar = (value) => {
		dispatch({ type: TOGGLE_SIDEBAR, payload: value });
	};

	const openModal = (component, props = {}, size = 'md') => {
		dispatch({
			         type: OPEN_MODAL,
			         payload: { component, props, size },
		         });
	};

	const closeModal = () => {
		dispatch({ type: CLOSE_MODAL });
	};

	const confirm = (options) => {
		return new Promise((resolve) => {
			const onConfirm = () => {
				dispatch({ type: CLOSE_CONFIRM });
				if (options.onConfirm) {
					options.onConfirm();
				}
				resolve(true);
			};

			const onCancel = () => {
				dispatch({ type: CLOSE_CONFIRM });
				if (options.onCancel) {
					options.onCancel();
				}
				resolve(false);
			};

			dispatch({
				         type: OPEN_CONFIRM,
				         payload: {
					         ...options,
					         onConfirm,
					         onCancel,
				         },
			         });
		});
	};

	// Value to be provided
	const contextValue = {
		state,
		toggleSidebar,
		openModal,
		closeModal,
		confirm,
	};

	return (
		<AppContext.Provider value={contextValue}>
			{children}
			<ModalContainer />
			<ConfirmDialog
				isOpen={state.confirm.isOpen}
				title={state.confirm.title}
				message={state.confirm.message}
				onConfirm={state.confirm.onConfirm}
				onCancel={state.confirm.onCancel}
				confirmButtonText={state.confirm.confirmButtonText}
				cancelButtonText={state.confirm.cancelButtonText}
				type={state.confirm.type}
			/>
		</AppContext.Provider>
	);
};

// Modal Container Component
const ModalContainer = () => {
	const { state, closeModal } = useContext(AppContext);
	const { isOpen, component: Component, props, size } = state.modal;

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
				<div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={closeModal}>
					<div className="absolute inset-0 bg-gray-500 opacity-75"></div>
				</div>

				<span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

				<div className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-full ${sizeClasses[size]}`}>
					<Component {...props} onClose={closeModal} />
				</div>
			</div>
		</div>
	);
};

// Custom hook
export const useApp = () => {
	const context = useContext(AppContext);
	if (!context) {
		throw new Error('useApp must be used within an AppProvider');
	}
	return context;
};










