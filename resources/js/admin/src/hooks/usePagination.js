// resources/js/admin/src/hooks/usePagination.js
import { useState, useEffect } from 'react';

export const usePagination = (items, itemsPerPage = 10, initialPage = 1) => {
	const [currentPage, setCurrentPage] = useState(initialPage);
	const [paginatedItems, setPaginatedItems] = useState([]);
	const [totalPages, setTotalPages] = useState(1);

	useEffect(() => {
		if (!items || items.length === 0) {
			setPaginatedItems([]);
			setTotalPages(1);
			return;
		}

		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		setPaginatedItems(items.slice(startIndex, endIndex));
		setTotalPages(Math.ceil(items.length / itemsPerPage));
	}, [items, currentPage, itemsPerPage]);

	const nextPage = () => {
		setCurrentPage(prev => Math.min(prev + 1, totalPages));
	};

	const prevPage = () => {
		setCurrentPage(prev => Math.max(prev - 1, 1));
	};

	const goToPage = (page) => {
		const pageNumber = Math.max(1, Math.min(page, totalPages));
		setCurrentPage(pageNumber);
	};

	return {
		currentPage,
		totalPages,
		paginatedItems,
		nextPage,
		prevPage,
		goToPage,
	};
};
