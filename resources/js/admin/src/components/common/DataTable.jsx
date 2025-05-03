// resources/js/admin/src/components/common/DataTable.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { FiMoreVertical, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';

const Badge = ({ color = 'blue', children }) => {
	const colors = {
		blue: 'bg-blue-100 text-blue-800',
		green: 'bg-green-100 text-green-800',
		red: 'bg-red-100 text-red-800',
		yellow: 'bg-yellow-100 text-yellow-800',
		purple: 'bg-purple-100 text-purple-800',
		gray: 'bg-gray-100 text-gray-800',
	};

	return (
		<span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[color]}`}>
      {children}
    </span>
	);
};

const DataTable = ({
	                   data = [],
	                   columns = [],
	                   onView,
	                   onEdit,
	                   onDelete,
	                   loading = false,
	                   searchable = false,
	                   searchTerm = '',
	                   onSearchChange,
	                   selectable = false,
	                   selected = [],
	                   onSelectChange,
	                   viewBaseUrl,
	                   editBaseUrl,
                     actionRenderer,
                   }) => {
	// Handle row selection
	const toggleRow = (id) => {
		if (onSelectChange) {
			const newSelected = selected.includes(id)
			                    ? selected.filter(item => item !== id)
			                    : [...selected, id];
			onSelectChange(newSelected);
		}
	};

	const toggleAll = () => {
		if (onSelectChange) {
			onSelectChange(selected.length === data.length ? [] : data.map(item => item.id));
		}
	};

	// Render cell content based on column type
	const renderCell = (item, column) => {
		const value = item[column.key];

		switch (column.type) {
			case 'boolean':
				return value ? (
					<span className="text-green-600">Yes</span>
				) : (
					       <span className="text-red-600">No</span>
				       );
			case 'date':
				return value ? new Date(value).toLocaleDateString() : '';
			case 'datetime':
				return value ? new Date(value).toLocaleString() : '';
			case 'badge':
				return value ? (
					<Badge color={column.options?.color || 'blue'}>{value}</Badge>
				) : null;
			case 'status':
				const status = column.options?.statuses?.[value] || { label: value, color: 'gray' };
				return <Badge color={status.color}>{status.label}</Badge>;
			case 'image':
				return value ? (
					<img
						src={value}
						alt={item.name || 'Image'}
						className="h-8 w-8 rounded-full object-cover"
					/>
				) : (
					       <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
						       <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
							       <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4V5h12v10z" clipRule="evenodd" />
						       </svg>
					       </div>
				       );
			case 'relation':
				return value?.name || '';
			default:
				return value || '';
		}
	};

	return (
		<div className="flex flex-col">
			{searchable && (
				<div className="mb-4">
					<div className="relative rounded-md shadow-sm">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
								<path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
							</svg>
						</div>
						<input
							type="text"
							className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
							placeholder="Search"
							value={searchTerm}
							onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
						/>
					</div>
				</div>
			)}

			<div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
				<div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
					<div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
							<tr>
								{selectable && (
									<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										<input
											type="checkbox"
											className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
											checked={selected.length === data.length && data.length > 0}
											onChange={toggleAll}
										/>
									</th>
								)}
								{columns.map((column) => (
									<th
										key={column.key}
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										{column.label}
									</th>
								))}
								<th scope="col" className="relative px-6 py-3">
									<span className="sr-only">Actions</span>
								</th>
							</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
							{loading ? (
								<tr>
									<td
										colSpan={columns.length + (selectable ? 2 : 1)}
										className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
									>
										<div className="flex justify-center items-center">
											<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
											<span className="ml-2">Loading...</span>
										</div>
									</td>
								</tr>
							) : data.length === 0 ? (
								<tr>
									<td
										colSpan={columns.length + (selectable ? 2 : 1)}
										className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
									>
										No data available
									</td>
								</tr>
							) : (
								    data.map((item) => (
									    <tr key={item.id}>
										    {selectable && (
											    <td className="px-6 py-4 whitespace-nowrap">
												    <input
													    type="checkbox"
													    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
													    checked={selected.includes(item.id)}
													    onChange={() => toggleRow(item.id)}
												    />
											    </td>
										    )}
										    {columns.map((column) => (
											    <td
												    key={`${item.id}-${column.key}`}
												    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
											    >
												    {renderCell(item, column)}
											    </td>
										    ))}
										    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {actionRenderer ? (
                            actionRenderer(item)
                          ) : (
											      <div className="relative inline-block text-left">
												      {/* Using a regular dropdown instead of @headlessui/react Menu for positioning control */}
												      <div className="dropdown">
													      <button 
                                  className="dropdown-toggle px-2 py-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                  onClick={(e) => {
														          const dropdown = e.currentTarget.parentNode;
														          dropdown.classList.toggle('active');
														          e.stopPropagation();
													          }}
													      >
														      <FiMoreVertical className="h-5 w-5" aria-hidden="true" />
													      </button>
													      <div className="dropdown-menu hidden absolute left-0 top-full mt-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
														      <div className="py-1">
															      {viewBaseUrl && (
																      <Link
																	      to={`${viewBaseUrl}/${item.id}`}
																	      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
																	      onClick={() => {
																		      document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));
																	      }}
																      >
																	      <FiEye className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
																	      View
																      </Link>
															      )}
															      {onView && !viewBaseUrl && (
																      <button
																	      onClick={() => {
																		      document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));
																		      onView(item);
																	      }}
																	      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
																      >
																	      <FiEye className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
																	      View
																      </button>
															      )}
															      {editBaseUrl && (
																      <Link
																	      to={`${editBaseUrl}/${item.id}`}
																	      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
																	      onClick={() => {
																		      document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));
																	      }}
																      >
																	      <FiEdit className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
																	      Edit
																      </Link>
															      )}
															      {editBaseUrl && editBaseUrl === '/admin/pages/edit' && (
																      <Link
																	      to={`/admin/pages/edit-live/${item.id}`}
																	      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
																	      onClick={() => {
																		      document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));
																	      }}
																      >
																	      <svg className="mr-3 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
																		      <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
																	      </svg>
																	      Live Edit
																      </Link>
															      )}
															      {onEdit && !editBaseUrl && (
																      <button
																	      onClick={() => {
																		      document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));
																		      onEdit(item);
																	      }}
																	      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
																      >
																	      <FiEdit className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
																	      Edit
																      </button>
															      )}
															      {onDelete && (
																      <button
																	      onClick={() => {
																		      document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));
																		      onDelete(item);
																	      }}
																	      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 hover:text-red-700"
																      >
																	      <FiTrash2 className="mr-3 h-5 w-5 text-red-500" aria-hidden="true" />
																	      Delete
																      </button>
															      )}
														      </div>
													      </div>
												      </div>
											      </div>
                          )}
										    </td>
									    </tr>
								    ))
							    )}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			{/* Close any open dropdowns when clicking outside */}
			<div className="hidden" dangerouslySetInnerHTML={{ __html: `
        <script>
          document.addEventListener('click', function(e) {
            const dropdowns = document.querySelectorAll('.dropdown');
            dropdowns.forEach(dropdown => {
              if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
              }
            });
          });
        </script>
        <style>
          .dropdown.active .dropdown-menu {
            display: block;
          }
        </style>
      `}} />
		</div>
	);
};

export default DataTable;