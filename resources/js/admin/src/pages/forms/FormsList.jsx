// resources/js/admin/src/pages/forms/FormsList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getForms, deleteForm } from '../../api/formsApi';
import { showToast } from '../../api/apiClient';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import { FiEdit, FiTrash2, FiFileText } from 'react-icons/fi';

const FormsList = () => {
	const [forms, setForms] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const navigate = useNavigate();

	const columns = [
		{ key: 'name', label: 'Name', type: 'text' },
		{ key: 'slug', label: 'Slug', type: 'text' },
		{
			key: 'is_active',
			label: 'Status',
			type: 'status',
			options: {
				statuses: {
					true: { label: 'Active', color: 'green' },
					false: { label: 'Inactive', color: 'gray' }
				}
			}
		},
		{ key: 'store_submissions', label: 'Store Submissions', type: 'boolean' },
		{ key: 'created_at', label: 'Created', type: 'date' },
	];

	useEffect(() => {
		fetchForms();
	}, []);

	const fetchForms = async () => {
		setLoading(true);
		try {
			const response = await getForms();
			setForms(response.data.data || response.data);
		} catch (error) {
			console.error('Error fetching forms:', error);
			showToast('Error', 'Failed to fetch forms', 'error');
		} finally {
			setLoading(false);
		}
	};

	const handleEdit = (form) => {
		navigate(`/admin/forms/edit/${form.id}`);
	};

	const handleViewSubmissions = (form) => {
		navigate(`/admin/forms/submissions/${form.id}`);
	};

	const handleDelete = async (form) => {
		if (!confirm(`Are you sure you want to delete the form "${form.name}"?`)) {
			return;
		}

		try {
			await deleteForm(form.id);
			showToast('Success', 'Form deleted successfully', 'success');
			fetchForms(); // Refresh the list
		} catch (error) {
			console.error('Error deleting form:', error);
			showToast('Error', 'Failed to delete form', 'error');
		}
	};

	const filteredForms = forms.filter(form =>
		                                   form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
		                                   form.slug.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div>
			<PageHeader
				title="Forms"
				description="Manage your forms and submissions"
				createButtonLabel="Create Form"
				createButtonLink="/admin/forms/create"
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
							placeholder="Search forms..."
							type="search"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
				</div>

				<DataTable
					data={filteredForms}
					columns={columns}
					loading={loading}
					onEdit={handleEdit}
					onView={handleViewSubmissions}
					onDelete={handleDelete}
					editBaseUrl="/admin/forms/edit"
					actionButtons={[
						{
							icon: FiFileText,
							label: 'View Submissions',
							onClick: handleViewSubmissions,
							color: 'blue',
						}
					]}
				/>
			</div>
		</div>
	);
};

export default FormsList;
