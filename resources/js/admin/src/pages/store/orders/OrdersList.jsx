import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../../../components/common/DataTable';
import PageHeader from '../../../components/common/PageHeader';
import { storeApi } from '../../../api/storeApi';
import { formatDate } from '../../../utils/formatUtils';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Pagination from '../../../components/common/Pagination';

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    date_from: '',
    date_to: '',
  });

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: pagination.perPage,
        ...filters,
      };

      const response = await storeApi.getOrders(params);
      const ordersData = response.data.data;
      setOrders(ordersData.data);
      setPagination({
        currentPage: ordersData.current_page,
        perPage: ordersData.per_page,
        total: ordersData.total,
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const handlePageChange = (page) => {
    fetchOrders(page);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const handleStatusChange = (status) => {
    setFilters({
      ...filters,
      status: status === filters.status ? '' : status,
    });
  };

  const columns = [
    {
      header: 'Order #',
      accessor: 'order_number',
      cell: (row) => (
        <Link to={`/admin/store/orders/${row.id}`} className="text-blue-600 hover:text-blue-800">
          {row.order_number}
        </Link>
      ),
    },
    {
      header: 'Date',
      accessor: 'created_at',
      cell: (row) => formatDate(row.created_at),
    },
    {
      header: 'Customer',
      accessor: 'customer',
      cell: (row) => (
        <Link to={`/admin/store/customers/edit/${row.customer_id}`} className="text-blue-600 hover:text-blue-800">
          {row.customer_name}
        </Link>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.status === 'completed' ? 'bg-green-100 text-green-800' : 
          row.status === 'processing' ? 'bg-blue-100 text-blue-800' : 
          row.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
          row.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
          row.status === 'cancelled' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ),
    },
    {
      header: 'Items',
      accessor: 'items_count',
      cell: (row) => row.items_count,
    },
    {
      header: 'Total',
      accessor: 'total',
      cell: (row) => `$${parseFloat(row.total).toFixed(2)}`,
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <Link
          to={`/admin/store/orders/${row.id}`}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          View
        </Link>
      ),
    },
  ];

  const statusFilters = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-800' },
    { value: 'shipped', label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Orders"
        actionButton={{
          label: "Add New",
          link: "/admin/store/orders/create",
          icon: "plus"
        }}
      />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              name="search"
              placeholder="Order #, customer name, or email"
              value={filters.search}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="date_from" className="block text-sm font-medium text-gray-700 mb-1">
              Date From
            </label>
            <input
              type="date"
              id="date_from"
              name="date_from"
              value={filters.date_from}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="date_to" className="block text-sm font-medium text-gray-700 mb-1">
              Date To
            </label>
            <input
              type="date"
              id="date_to"
              name="date_to"
              value={filters.date_to}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((status) => (
              <button
                key={status.value}
                onClick={() => handleStatusChange(status.value)}
                className={`px-3 py-1 rounded-full text-sm ${
                  filters.status === status.value
                    ? `${status.color} font-medium`
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <DataTable
            columns={columns}
            data={orders}
            emptyMessage="No orders found."
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
    </div>
  );
};

export default OrdersList;
