import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../../../components/common/DataTable';
import PageHeader from '../../../components/common/PageHeader';
import { storeApi } from '../../../api/storeApi';
import { formatDate } from '../../../utils/formatUtils';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Pagination from '../../../components/common/Pagination';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

const CouponsList = () => {
  const [coupons, setCoupons] = useState([]);
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
  });
  const [confirmDelete, setConfirmDelete] = useState({
    isOpen: false,
    couponId: null,
  });

  const fetchCoupons = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: pagination.perPage,
        ...filters,
      };

      const response = await storeApi.getCoupons(params);
      const couponsData = response.data.data;
      setCoupons(couponsData.data);
      setPagination({
        currentPage: couponsData.current_page,
        perPage: couponsData.per_page,
        total: couponsData.total,
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching coupons:', err);
      setError('Failed to load coupons. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [filters]);

  const handlePageChange = (page) => {
    fetchCoupons(page);
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

  const handleDelete = (couponId) => {
    setConfirmDelete({
      isOpen: true,
      couponId,
    });
  };

  const confirmDeleteCoupon = async () => {
    try {
      await storeApi.deleteCoupon(confirmDelete.couponId);
      fetchCoupons(pagination.currentPage);
      setConfirmDelete({
        isOpen: false,
        couponId: null,
      });
    } catch (err) {
      console.error('Error deleting coupon:', err);
      setError('Failed to delete coupon. Please try again later.');
      setConfirmDelete({
        isOpen: false,
        couponId: null,
      });
    }
  };

  const columns = [
    {
      header: 'Code',
      accessor: 'code',
      cell: (row) => (
        <Link to={`/admin/store/coupons/${row.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
          {row.code}
        </Link>
      ),
    },
    {
      header: 'Type',
      accessor: 'type',
      cell: (row) => (
        <span className="capitalize">
          {row.discount_type === 'percentage' ? 'Percentage' : 
           row.discount_type === 'fixed_amount' ? 'Fixed Amount' :
           row.discount_type === 'free_shipping' ? 'Free Shipping' : 
           row.discount_type}
        </span>
      ),
    },
    {
      header: 'Amount',
      accessor: 'amount',
      cell: (row) => {
        if (row.discount_type === 'percentage') {
          return `${row.discount_value}%`;
        } else if (row.discount_type === 'fixed_amount') {
          return `$${parseFloat(row.discount_value).toFixed(2)}`;
        } else if (row.discount_type === 'free_shipping') {
          return 'Free Shipping';
        }
        return row.discount_value;
      },
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Usage / Limit',
      accessor: 'usage',
      cell: (row) => `${row.usage_count || 0} / ${row.usage_limit ? row.usage_limit : '∞'}`,
    },
    {
      header: 'Expires',
      accessor: 'expires_at',
      cell: (row) => row.expires_at ? formatDate(row.expires_at) : 'Never',
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex space-x-2">
          <Link
            to={`/admin/store/coupons/edit/${row.id}`}
            className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Edit
          </Link>
          <button
            onClick={() => handleDelete(row.id)}
            className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const statusFilters = [
    { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
    { value: 'inactive', label: 'Inactive', color: 'bg-red-100 text-red-800' },
    { value: 'expired', label: 'Expired', color: 'bg-yellow-100 text-yellow-800' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Coupons"
        actionButton={{
          label: "Add New",
          link: "/admin/store/coupons/create",
          icon: "plus"
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
              name="search"
              placeholder="Search by code or description"
              value={filters.search}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <DataTable
            columns={columns}
            data={coupons}
            emptyMessage="No coupons found."
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
        isOpen={confirmDelete.isOpen}
        title="Delete Coupon"
        message="Are you sure you want to delete this coupon? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDeleteCoupon}
        onCancel={() => setConfirmDelete({ isOpen: false, couponId: null })}
      />
    </div>
  );
};

export default CouponsList;