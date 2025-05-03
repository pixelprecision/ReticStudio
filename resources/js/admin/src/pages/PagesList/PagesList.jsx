// resources/js/admin/src/pages/PagesList/PagesList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPages, deletePage } from '../../api/pagesApi';
import { showToast } from '../../api/apiClient';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import { FiEdit, FiTrash2, FiEye, FiZap } from 'react-icons/fi';

const PagesList = () => {
	const [pages, setPages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const navigate = useNavigate();

	const columns = [
		{ key: 'title', label: 'Title', type: 'text' },
		{ key: 'slug', label: 'Slug', type: 'text' },
		{
			key: 'is_published',
			label: 'Status',
			type: 'status',
			options: {
				statuses: {
					true: { label: 'Published', color: 'green' },
					false: { label: 'Draft', color: 'yellow' }
				}
			}
		},
		{ key: 'created_at', label: 'Created', type: 'date' },
		{ key: 'updated_at', label: 'Updated', type: 'date' },
	];

	useEffect(() => {
		fetchPages();
	}, []);

	const fetchPages = async () => {
		setLoading(true);
		try {
			const response = await getPages();
			console.log(response);
			setPages(response.data.data || response.data);
		} catch (error) {
			console.error('Error fetching pages:', error);
			showToast('Error', 'Failed to fetch pages', 'error');
		} finally {
			setLoading(false);
		}
	};

	const handleEdit = (page) => {
		navigate(`/admin/pages/edit/${page.id}`);
	};
	
	const handleLiveEdit = (page) => {
		navigate(`/admin/pages/edit-live/${page.id}`);
	};

	const handleView = (page) => {
		window.open(`/${page.slug}`, '_blank');
	};

	const handleDelete = async (page) => {
		if (!confirm(`Are you sure you want to delete the page "${page.title}"?`)) {
			return;
		}

		try {
			await deletePage(page.id);
			showToast('Success', 'Page deleted successfully', 'success');
			fetchPages(); // Refresh the list
		} catch (error) {
			console.error('Error deleting page:', error);
			showToast('Error', 'Failed to delete page', 'error');
		}
	};

	// Custom action renderer for the DataTable
	const actionRenderer = (page) => (
		<div className="flex items-center space-x-2">
			<button
				onClick={() => handleView(page)}
				className="text-gray-600 hover:text-blue-600"
				title="View Page"
			>
				<FiEye size={18} />
			</button>
			<button
				onClick={() => handleEdit(page)}
				className="text-gray-600 hover:text-green-600"
				title="Edit Page"
			>
				<FiEdit size={18} />
			</button>
			<button
				onClick={() => handleLiveEdit(page)}
				className="text-gray-600 hover:text-purple-600"
				title="Live Edit Page"
			>
				<FiZap size={18} />
			</button>
			<button
				onClick={() => handleDelete(page)}
				className="text-gray-600 hover:text-red-600"
				title="Delete Page"
			>
				<FiTrash2 size={18} />
			</button>
		</div>
	);

	const filteredPages = pages.filter(page =>
		page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
		page.slug.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div>
			<PageHeader
				title="Pages"
				description="Manage your website pages"
				createButtonLabel="Create Page"
				createButtonLink="/admin/pages/create"
				extraButtons={[
					{
						label: "Create with Live Editor",
						icon: <FiZap className="mr-2" />,
						link: "/admin/pages/create-live",
						className: "ml-2 bg-purple-600 hover:bg-purple-700"
					}
				]}
			/>

			<div className="card">
				<div className="mb-4">
					<label htmlFor="search" className="sr-only">Search</label>
					<div className="relative">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
								<path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
							</svg>
						</div>
						<input
							id="search"
							name="search"
							className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
							placeholder="Search pages..."
							type="search"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
				</div>

				<DataTable
					data={filteredPages}
					columns={columns}
					loading={loading}
					actionRenderer={actionRenderer}
					editBaseUrl="/admin/pages/edit"
				/>
			</div>
		</div>
	);
};

export default PagesList;