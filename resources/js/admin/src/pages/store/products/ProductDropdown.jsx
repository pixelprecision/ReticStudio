import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// Standalone ProductDropdown component
const ProductDropdown = ({ product, onDelete }) => {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef(null);

	// Close this dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		};

		// Only add the listener when the dropdown is open
		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen]);

	const toggleDropdown = (e) => {
		e.stopPropagation();
		setIsOpen(!isOpen);
	};

	const closeDropdown = () => {
		setIsOpen(false);
	};

	return (
		<div className="dropdown relative" ref={dropdownRef}>
			<button
				className="px-2 py-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
				onClick={toggleDropdown}
			>
				<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
					<path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
				</svg>
			</button>

			{isOpen && (
				<div className="dropdown-menu absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
					<div className="py-1">
						<Link
							to={`/admin/store/products/view/${product.id}`}
							className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
							onClick={closeDropdown}
						>
							<svg className="mr-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
								<path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
								<path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
							</svg>
							View
						</Link>
						<Link
							to={`/admin/store/products/edit/${product.id}`}
							className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
							onClick={closeDropdown}
						>
							<svg className="mr-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
								<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
							</svg>
							Edit
						</Link>
						<button
							onClick={() => {
								closeDropdown();
								onDelete(product);
							}}
							className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 hover:text-red-700"
						>
							<svg className="mr-3 h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
								<path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
							</svg>
							Delete
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default ProductDropdown;
