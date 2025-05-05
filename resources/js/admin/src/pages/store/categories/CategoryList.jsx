import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../../../components/common/DataTable';
import PageHeader from '../../../components/common/PageHeader';
import { storeApi } from '../../../api/storeApi';
import { formatDate } from '../../../utils/formatUtils';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await storeApi.getCategories();
      // Handle different possible response structures
      let categoryData;
      if (response.data.data && Array.isArray(response.data.data)) {
        // Paginated response: { data: { data: [] } }
        categoryData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        // Direct array response: { data: [] }
        categoryData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data.data)) {
        // Deeply nested response: { data: { data: { data: [] } } }
        categoryData = response.data.data.data;
      } else {
        console.error('Unexpected response structure:', response);
        throw new Error('Unexpected response structure');
      }
      
      console.log("CATEGORIES", categoryData);
      setCategories(categoryData);
      setError(null);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDeleteClick = (category) => {
    setSelectedCategory(category);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await storeApi.deleteCategory(selectedCategory.id);
      fetchCategories();
      setConfirmOpen(false);
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Failed to delete category. It may be in use by products.');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (item) => (
        <Link to={`/admin/store/categories/edit/${item.id}`} className="text-blue-600 hover:text-blue-800">
          {item.name}
        </Link>
      ),
    },
    {
      key: 'slug',
      label: 'Slug',
      sortable: true,
    },
    {
      key: 'parent_id',
      label: 'Parent',
      sortable: true,
      render: (item) => {
        return item.parent_id ? `ID: ${item.parent_id}` : '-';
      }
    },
    {
      key: 'is_visible',
      label: 'Visible',
      sortable: true,
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          item.is_visible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {item.is_visible ? 'Yes' : 'No'}
        </span>
      )
    },
    {
      key: 'is_active',
      label: 'Active',
      sortable: true,
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {item.is_active ? 'Yes' : 'No'}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      type: 'date',
      render: (item) => formatDate(item.created_at)
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Product Categories"
        actionButton={{
          label: 'Add Category',
          link: '/admin/store/categories/create',
          icon: 'plus'
        }}
      />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <DataTable
            columns={columns}
            data={categories}
            loading={loading}
            editBaseUrl="/admin/store/categories/edit"
            onDelete={handleDeleteClick}
            searchable={true}
            onSearchChange={(value) => {
              // In a real implementation, you'd probably want to filter the categories on the server
              // For now, we'll just log the search term
              console.log('Search term:', value);
            }}
          />
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        message={`Are you sure you want to delete ${selectedCategory?.name}? This may affect products in this category.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </div>
  );
};

export default CategoryList;
