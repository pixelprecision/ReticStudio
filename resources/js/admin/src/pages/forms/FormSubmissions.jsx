// src/pages/forms/FormSubmissions.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { FiDownload, FiTrash2, FiAlertTriangle, FiCheck } from 'react-icons/fi';
import { 
    getForm, 
    getFormSubmissions, 
    deleteFormSubmission,
    markAsSpam,
    markAsNotSpam,
    exportFormSubmissions
} from '../../api/formsApi';
import { showToast } from '../../api/apiClient';

const FormSubmissions = () => {
	const { id } = useParams();
	const [form, setForm] = useState(null);
	const [submissions, setSubmissions] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchData();
	}, [id]);

	const fetchData = async () => {
		setLoading(true);
		try {
			const formResponse = await getForm(id);
			const formData = formResponse.data;
			setForm(formData);

			const submissionsResponse = await getFormSubmissions(id);
			const submissionsData = submissionsResponse.data.data || submissionsResponse.data;
			setSubmissions(submissionsData);
		} catch (error) {
			console.error('Error fetching data:', error);
			showToast('Error', 'Failed to fetch form submissions', 'error');
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (submissionId) => {
		if (!window.confirm('Are you sure you want to delete this submission?')) {
			return;
		}
		
		try {
			await deleteFormSubmission(id, submissionId);
			showToast('Success', 'Submission deleted successfully', 'success');
			setSubmissions(submissions.filter(submission => submission.id !== submissionId));
		} catch (error) {
			console.error('Error deleting submission:', error);
			showToast('Error', 'Failed to delete submission', 'error');
		}
	};

	const handleMarkAsSpam = async (submissionId) => {
		try {
			await markAsSpam(id, submissionId);
			showToast('Success', 'Submission marked as spam', 'success');
			setSubmissions(submissions.map(submission =>
				submission.id === submissionId ? { ...submission, is_spam: true } : submission
			));
		} catch (error) {
			console.error('Error marking as spam:', error);
			showToast('Error', 'Failed to mark submission as spam', 'error');
		}
	};

	const handleMarkAsNotSpam = async (submissionId) => {
		try {
			await markAsNotSpam(id, submissionId);
			showToast('Success', 'Submission marked as not spam', 'success');
			setSubmissions(submissions.map(submission =>
				submission.id === submissionId ? { ...submission, is_spam: false } : submission
			));
		} catch (error) {
			console.error('Error marking as not spam:', error);
			showToast('Error', 'Failed to mark submission as not spam', 'error');
		}
	};

	const handleExport = async (format = 'csv') => {
		try {
			const response = await exportFormSubmissions(id, format);
			
			// Create a blob and download it
			const blob = new Blob([response.data], { 
				type: format === 'json' 
					? 'application/json' 
					: 'text/csv;charset=utf-8;' 
			});
			
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.setAttribute('download', `${form.slug}-submissions.${format}`);
			document.body.appendChild(link);
			link.click();
			link.parentNode.removeChild(link);
			
			showToast('Success', `Submissions exported as ${format.toUpperCase()}`, 'success');
		} catch (error) {
			console.error('Error exporting submissions:', error);
			showToast('Error', 'Failed to export submissions', 'error');
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	return (
		<div>
			<PageHeader
				title={`${form.name} Submissions`}
				description="View and manage form submissions"
				createButtonLabel={null}
			/>

			<div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
				<div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
					<div>
						<span className="text-gray-700">Total submissions: <span className="font-medium">{submissions.length}</span></span>
					</div>
					<div className="flex space-x-2">
						<button
							onClick={() => handleExport('csv')}
							className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							<FiDownload className="-ml-0.5 mr-1 h-4 w-4" /> Export CSV
						</button>
						<button
							onClick={() => handleExport('json')}
							className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							<FiDownload className="-ml-0.5 mr-1 h-4 w-4" /> Export JSON
						</button>
					</div>
				</div>

				{submissions.length === 0 ? (
					<div className="p-8 text-center">
						<p className="text-gray-500">No submissions yet</p>
					</div>
				) : (
					 <div className="overflow-x-auto">
						 <table className="min-w-full divide-y divide-gray-200">
							 <thead className="bg-gray-50">
							 <tr>
								 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
								 {form.fields.map((field) => (
									 <th key={field.name} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										 {field.label}
									 </th>
								 ))}
								 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
								 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
								 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
							 </tr>
							 </thead>
							 <tbody className="bg-white divide-y divide-gray-200">
							 {submissions.map((submission) => (
								 <tr key={submission.id} className={submission.is_spam ? 'bg-red-50' : ''}>
									 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										 {new Date(submission.created_at).toLocaleString()}
									 </td>
									 {form.fields.map((field) => (
										 <td key={field.name} className="px-6 py-4 text-sm text-gray-500">
											 {field.type === 'textarea' ? (
												 <div className="max-w-xs truncate">{submission.data[field.name]}</div>
											 ) : (
												  submission.data[field.name]
											  )}
										 </td>
									 ))}
									 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										 {submission.ip_address}
									 </td>
									 <td className="px-6 py-4 whitespace-nowrap">
										 {submission.is_spam ? (
											 <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Spam
                        </span>
										 ) : (
											  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Valid
                        </span>
										  )}
									 </td>
									 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
										 {submission.is_spam ? (
											 <button
												 onClick={() => handleMarkAsNotSpam(submission.id)}
												 className="text-green-600 hover:text-green-900 mr-3"
											 >
												 <FiCheck className="inline mr-1" /> Not Spam
											 </button>
										 ) : (
											  <button
												  onClick={() => handleMarkAsSpam(submission.id)}
												  className="text-yellow-600 hover:text-yellow-900 mr-3"
											  >
												  <FiAlertTriangle className="inline mr-1" /> Mark as Spam
											  </button>
										  )}
										 <button
											 onClick={() => handleDelete(submission.id)}
											 className="text-red-600 hover:text-red-900"
										 >
											 <FiTrash2 className="inline mr-1" /> Delete
										 </button>
									 </td>
								 </tr>
							 ))}
							 </tbody>
						 </table>
					 </div>
				 )}
			</div>
		</div>
	);
};

export default FormSubmissions;
