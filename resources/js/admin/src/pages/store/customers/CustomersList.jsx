import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../../../components/common/DataTable';
import PageHeader from '../../../components/common/PageHeader';
import { storeApi } from '../../../api/storeApi';
import { formatDate } from '../../../utils/formatUtils';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import Pagination from '../../../components/common/Pagination';

const CustomersList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
  });

  const fetchCustomers = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: pagination.perPage,
        ...filters,
      };

      const response = await storeApi.getCustomers(params);
      const customersData = response.data.data;
      setCustomers(customersData.data);
      setPagination({
        currentPage: customersData.current_page,
        perPage: customersData.per_page,
        total: customersData.total,
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [filters]);

  const handlePageChange = (page) => {
    fetchCustomers(page);
  };

  const handleSearchChange = (e) => {
    setFilters({
      ...filters,
      search: e.target.value,
    });
  };

  const handleStatusChange = (e) => {
    setFilters({
      ...filters,
      status: e.target.value,
    });
  };

  const handleDeleteClick = (customer) => {
    setSelectedCustomer(customer);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await storeApi.deleteCustomer(selectedCustomer.id);
      fetchCustomers(pagination.currentPage);
      setConfirmOpen(false);
    } catch (err) {
      console.error('Error deleting customer:', err);
      setError('Failed to delete customer. They may have associated orders.');
    }
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      cell: (row) => (
        <Link to={`/admin/store/customers/edit/${row.id}`} className="text-blue-600 hover:text-blue-800">
          {row.first_name} {row.last_name}
        </Link>
      ),
    },
    {
      header: 'Email',
      accessor: 'email',
    },
    {
      header: 'Phone',
      accessor: 'phone',
      cell: (row) => row.phone || '-',
    },
    {
      header: 'Orders',
      accessor: 'orders_count',
      cell: (row) => row.orders_count || 0,
    },
    {
      header: 'Registered',
      accessor: 'created_at',
      cell: (row) => formatDate(row.created_at),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.status === 'active' ? 'bg-green-100 text-green-800' : 
          row.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 
          'bg-red-100 text-red-800'
        }`}>
          {row.status === 'active' ? 'Active' :
           row.status === 'inactive' ? 'Inactive' : 'Banned'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex space-x-2">
          <Link
            to={`/admin/store/customers/edit/${row.id}`}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit
          </Link>
          <button
            onClick={() => handleDeleteClick(row)}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Customers"
        actionButton={{
          label: 'Add Customer',
          link: '/admin/store/customers/create',
          icon: 'plus'
        }}
      />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by name or email"
              value={filters.search}
              onChange={handleSearchChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={filters.status}
              onChange={handleStatusChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <DataTable
            columns={columns}
            data={customers}
            emptyMessage="No customers found. Create your first customer to get started."
          />
          {pagination.total > pagination.perPage && (
            <div className="mt-6">
              <Pagination
                currentPage={pagination.currentPage}
                totalItems={pagination.total}
                itemsPerPage={pagination.perPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Customer"
        message={`Are you sure you want to delete ${selectedCustomer?.first_name} ${selectedCustomer?.last_name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default CustomersList;
