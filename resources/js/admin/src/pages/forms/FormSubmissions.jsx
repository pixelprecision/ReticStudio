// src/pages/forms/FormSubmissions.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { FiDownload, FiTrash2, FiAlertTriangle, FiCheck } from 'react-icons/fi';

const FormSubmissions = () => {
	const { id } = useParams();
	const [form, setForm] = useState(null);
	const [submissions, setSubmissions] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Mock data fetch - replace with API call in production
		const mockForm = {
			id: parseInt(id),
			name: 'Contact Form',
			slug: 'contact-form',
			fields: [
				{ name: 'name', label: 'Your Name', type: 'text' },
				{ name: 'email', label: 'Email Address', type: 'email' },
				{ name: 'subject', label: 'Subject', type: 'text' },
				{ name: 'message', label: 'Message', type: 'textarea' },
			]
		};

		const mockSubmissions = [
			{
				id: 1,
				created_at: '2023-08-12T14:23:45',
				data: { name: 'John Doe', email: 'john@example.com', subject: 'General Inquiry', message: 'I have some questions about your services.' },
				ip_address: '192.168.1.1',
				is_spam: false
			},
			{
				id: 2,
				created_at: '2023-08-13T10:15:22',
				data: { name: 'Jane Smith', email: 'jane@example.com', subject: 'Support Request', message: 'I need help with my account.' },
				ip_address: '192.168.1.2',
				is_spam: false
			},
			{
				id: 3,
				created_at: '2023-08-14T08:45:11',
				data: { name: 'Mike Johnson', email: 'mike@example.com', subject: 'Partnership Opportunity', message: 'Let\'s discuss a potential collaboration.' },
				ip_address: '192.168.1.3',
				is_spam: false
			},
			{
				id: 4,
				created_at: '2023-08-15T16:30:57',
				data: { name: 'Buy Now!', email: 'spam@example.com', subject: 'Special Offer!!!', message: 'Click here for a special discount on our products!' },
				ip_address: '192.168.1.4',
				is_spam: true
			},
		];

		setForm(mockForm);
		setSubmissions(mockSubmissions);
		setLoading(false);

		// Actual API implementation would be:
		// const fetchData = async () => {
		//   setLoading(true);
		//   try {
		//     const formResponse = await fetch(`/api/forms/${id}`);
		//     const formData = await formResponse.json();
		//     setForm(formData);
		//
		//     const submissionsResponse = await fetch(`/api/forms/${id}/submissions`);
		//     const submissionsData = await submissionsResponse.json();
		//     setSubmissions(submissionsData);
		//   } catch (error) {
		//     console.error('Error fetching data:', error);
		//   } finally {
		//     setLoading(false);
		//   }
		// };
		// fetchData();
	}, [id]);

	const handleDelete = (submissionId) => {
		if (window.confirm('Are you sure you want to delete this submission?')) {
			// Mock deletion - replace with API call in production
			setSubmissions(submissions.filter(submission => submission.id !== submissionId));

			// Actual API implementation would be:
			// const deleteSubmission = async () => {
			//   try {
			//     await fetch(`/api/forms/${id}/submissions/${submissionId}`, { method: 'DELETE' });
			//     setSubmissions(submissions.filter(submission => submission.id !== submissionId));
			//   } catch (error) {
			//     console.error('Error deleting submission:', error);
			//   }
			// };
			// deleteSubmission();
		}
	};

	const handleMarkAsSpam = (submissionId) => {
		// Mock update - replace with API call in production
		setSubmissions(submissions.map(submission =>
			                               submission.id === submissionId ? { ...submission, is_spam: true } : submission
		));

		// Actual API implementation would be:
		// const markAsSpam = async () => {
		//   try {
		//     await fetch(`/api/forms/${id}/submissions/${submissionId}/mark-as-spam`, { method: 'POST' });
		//     setSubmissions(submissions.map(submission =>
		//       submission.id === submissionId ? { ...submission, is_spam: true } : submission
		//     ));
		//   } catch (error) {
		//     console.error('Error marking as spam:', error);
		//   }
		// };
		// markAsSpam();
	};

	const handleMarkAsNotSpam = (submissionId) => {
		// Mock update - replace with API call in production
		setSubmissions(submissions.map(submission =>
			                               submission.id === submissionId ? { ...submission, is_spam: false } : submission
		));

		// Actual API implementation would be:
		// const markAsNotSpam = async () => {
		//   try {
		//     await fetch(`/api/forms/${id}/submissions/${submissionId}/mark-as-not-spam`, { method: 'POST' });
		//     setSubmissions(submissions.map(submission =>
		//       submission.id === submissionId ? { ...submission, is_spam: false } : submission
		//     ));
		//   } catch (error) {
		//     console.error('Error marking as not spam:', error);
		//   }
		// };
		// markAsNotSpam();
	};

	const handleExport = (format = 'csv') => {
		// Mock export - in production this would trigger a file download
		alert(`Exporting submissions in ${format.toUpperCase()} format`);

		// Actual API implementation would be:
		// window.location.href = `/api/forms/${id}/export?format=${format}`;
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
