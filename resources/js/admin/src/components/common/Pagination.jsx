// resources/js/admin/src/components/common/Pagination.jsx
import React from 'react';

const Pagination = ({
	                    currentPage,
	                    totalPages,
	                    onPageChange,
	                    className = '',
	                    showPageNumbers = true,
                    }) => {
	if (totalPages <= 1) return null;

	// Calculate page range to display
	const getPageRange = () => {
		const range = [];
		const maxPagesToShow = 5;

		if (totalPages <= maxPagesToShow) {
			// Show all pages if total is less than the max
			for (let i = 1; i <= totalPages; i++) {
				range.push(i);
			}
		} else {
			// Always include first and last pages
			range.push(1);

			// Calculate middle range
			let startPage = Math.max(2, currentPage - 1);
			let endPage = Math.min(totalPages - 1, currentPage + 1);

			// Adjust if we're at the start or end
			if (currentPage <= 2) {
				endPage = Math.min(totalPages - 1, 4);
			} else if (currentPage >= totalPages - 1) {
				startPage = Math.max(2, totalPages - 3);
			}

			// Add ellipsis if needed
			if (startPage > 2) {
				range.push('...');
			}

			// Add middle pages
			for (let i = startPage; i <= endPage; i++) {
				range.push(i);
			}

			// Add ellipsis if needed
			if (endPage < totalPages - 1) {
				range.push('...');
			}

			// Add last page
			range.push(totalPages);
		}

		return range;
	};

	return (
		<nav className={`flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 ${className}`}>
			<div className="flex flex-1 justify-between sm:hidden">
				<button
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage === 1}
					className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
						currentPage === 1
						? 'bg-gray-100 text-gray-400 cursor-not-allowed'
						: 'bg-white text-gray-700 hover:bg-gray-50'
					}`}
				>
					Previous
				</button>
				<button
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
					className={`relative ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
						currentPage === totalPages
						? 'bg-gray-100 text-gray-400 cursor-not-allowed'
						: 'bg-white text-gray-700 hover:bg-gray-50'
					}`}
				>
					Next
				</button>
			</div>
			<div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
				<div>
					<p className="text-sm text-gray-700">
						Showing <span className="font-medium">{Math.min((currentPage - 1) * 10 + 1, totalPages * 10)}</span> to{' '}
						<span className="font-medium">{Math.min(currentPage * 10, totalPages * 10)}</span> of{' '}
						<span className="font-medium">{totalPages * 10}</span> results
					</p>
				</div>
				<div>
					<nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
						<button
							onClick={() => onPageChange(currentPage - 1)}
							disabled={currentPage === 1}
							className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
								currentPage === 1
								? 'text-gray-300 cursor-not-allowed'
								: 'text-gray-500 hover:bg-gray-50'
							}`}
						>
							<span className="sr-only">Previous</span>
							<svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
								<path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/>
							</svg>
						</button>

						{showPageNumbers && getPageRange().map((page, index) => (
							<React.Fragment key={index}>
								{page === '...' ? (
									<span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    ...
                  </span>
								) : (
									 <button
										 onClick={() => onPageChange(page)}
										 className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
											 currentPage === page
											 ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
											 : 'bg-white text-gray-500 hover:bg-gray-50'
										 }`}
									 >
										 {page}
									 </button>
								 )}
							</React.Fragment>
						))}

						<button
							onClick={() => onPageChange(currentPage + 1)}
							disabled={currentPage === totalPages}
							className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
								currentPage === totalPages
								? 'text-gray-300 cursor-not-allowed'
								: 'text-gray-500 hover:bg-gray-50'
							}`}
						>
							<span className="sr-only">Next</span>
							<svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
								<path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
							</svg>
						</button>
					</nav>
				</div>
			</div>
		</nav>
	);
};

export default Pagination;
