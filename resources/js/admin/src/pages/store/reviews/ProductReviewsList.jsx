import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../../../components/common/DataTable';
import PageHeader from '../../../components/common/PageHeader';
import { storeApi } from '../../../api/storeApi';
import { formatDate } from '../../../utils/formatUtils';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Pagination from '../../../components/common/Pagination';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

const ProductReviewsList = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    rating: '',
    status: '',
    product_id: '',
  });
  const [confirmDelete, setConfirmDelete] = useState({
    isOpen: false,
    reviewId: null,
  });
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const fetchReviews = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: pagination.perPage,
        ...filters,
      };

      const response = await storeApi.getAllReviews(params);
      const reviewsData = response.data.data;
      setReviews(reviewsData.data);
      setPagination({
        currentPage: reviewsData.current_page,
        perPage: reviewsData.per_page,
        total: reviewsData.total,
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await storeApi.getProducts({ per_page: 100 });
      setProducts(response.data.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchProducts();
  }, [filters]);

  const handlePageChange = (page) => {
    fetchReviews(page);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const handleRatingChange = (rating) => {
    setFilters({
      ...filters,
      rating: rating === filters.rating ? '' : rating,
    });
  };

  const handleStatusChange = (status) => {
    setFilters({
      ...filters,
      status: status === filters.status ? '' : status,
    });
  };

  const handleDelete = (reviewId) => {
    setConfirmDelete({
      isOpen: true,
      reviewId,
    });
  };

  const confirmDeleteReview = async () => {
    try {
      await storeApi.deleteReview(confirmDelete.reviewId);
      fetchReviews(pagination.currentPage);
      setConfirmDelete({
        isOpen: false,
        reviewId: null,
      });
    } catch (err) {
      console.error('Error deleting review:', err);
      setError('Failed to delete review. Please try again later.');
      setConfirmDelete({
        isOpen: false,
        reviewId: null,
      });
    }
  };

  const handleApprove = async (reviewId) => {
    try {
      await storeApi.approveReview(reviewId);
      fetchReviews(pagination.currentPage);
    } catch (err) {
      console.error('Error approving review:', err);
      setError('Failed to approve review. Please try again later.');
    }
  };

  const handleDisapprove = async (reviewId) => {
    try {
      await storeApi.disapproveReview(reviewId);
      fetchReviews(pagination.currentPage);
    } catch (err) {
      console.error('Error disapproving review:', err);
      setError('Failed to disapprove review. Please try again later.');
    }
  };

  const columns = [
    {
      header: 'Product',
      accessor: 'product',
      cell: (row) => (
        <Link to={`/admin/store/products/${row.product_id}`} className="text-blue-600 hover:text-blue-800">
          {row.product?.name || `Product #${row.product_id}`}
        </Link>
      ),
    },
    {
      header: 'Customer',
      accessor: 'customer',
      cell: (row) => (
        row.customer_id ? 
        <Link to={`/admin/store/customers/${row.customer_id}`} className="text-blue-600 hover:text-blue-800">
          {row.customer_name || `Customer #${row.customer_id}`}
        </Link> : 
        <span>{row.name || 'Anonymous'}</span>
      ),
    },
    {
      header: 'Rating',
      accessor: 'rating',
      cell: (row) => (
        <div className="flex items-center">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg 
                key={star}
                className={`h-4 w-4 ${star <= row.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="ml-2">{row.rating}/5</span>
        </div>
      ),
    },
    {
      header: 'Title',
      accessor: 'title',
      cell: (row) => (
        <div>
          <p className="font-medium">{row.title}</p>
          <p className="text-sm text-gray-600 truncate max-w-xs">{row.content}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {row.is_approved ? 'Approved' : 'Pending'}
        </span>
      ),
    },
    {
      header: 'Date',
      accessor: 'created_at',
      cell: (row) => formatDate(row.created_at),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex space-x-2">
          <Link
            to={`/admin/store/reviews/edit/${row.id}`}
            className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Edit
          </Link>
          {!row.is_approved ? (
            <button
              onClick={() => handleApprove(row.id)}
              className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              Approve
            </button>
          ) : (
            <button
              onClick={() => handleDisapprove(row.id)}
              className="px-2 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
            >
              Disapprove
            </button>
          )}
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

  const ratingFilters = [1, 2, 3, 4, 5];
  const statusFilters = [
    { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
    { value: 'pending', label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-800' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Product Reviews"
        actionButton={{
          label: "Add New",
          link: "/admin/store/reviews/create",
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
              placeholder="Search by title, content, or customer"
              value={filters.search}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="product_id" className="block text-sm font-medium text-gray-700 mb-1">
              Product
            </label>
            <select
              id="product_id"
              name="product_id"
              value={filters.product_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Products</option>
              {loadingProducts ? (
                <option value="" disabled>Loading products...</option>
              ) : (
                products.map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating
            </label>
            <div className="flex flex-wrap gap-2">
              {ratingFilters.map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleRatingChange(rating.toString())}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filters.rating === rating.toString()
                      ? 'bg-yellow-100 text-yellow-800 font-medium'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {rating} Star{rating !== 1 ? 's' : ''}
                </button>
              ))}
            </div>
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
            data={reviews}
            emptyMessage="No reviews found."
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
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDeleteReview}
        onCancel={() => setConfirmDelete({ isOpen: false, reviewId: null })}
      />
    </div>
  );
};

export default ProductReviewsList;