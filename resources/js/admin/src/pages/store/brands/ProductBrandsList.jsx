import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../../../components/common/DataTable';
import PageHeader from '../../../components/common/PageHeader';
import { storeApi } from '../../../api/storeApi';
import { formatDate } from '../../../utils/formatUtils';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

const ProductBrandsList = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [error, setError] = useState(null);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const response = await storeApi.getBrands();
      const brandData = response.data.data;
      setBrands(brandData.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching brands:', err);
      setError('Failed to load brands. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleDeleteClick = (brand) => {
    setSelectedBrand(brand);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await storeApi.deleteBrand(selectedBrand.id);
      fetchBrands();
      setConfirmOpen(false);
    } catch (err) {
      console.error('Error deleting brand:', err);
      setError('Failed to delete brand. It may be in use by products.');
    }
  };

  const columns = [
    {
      label: 'Name',
      key: 'name',
      sortable: true,
      render: (brand) => (
        <Link to={`/admin/store/brands/edit/${brand.id}`} className="text-blue-600 hover:text-blue-800">
          {brand.name}
        </Link>
      ),
    },
    {
      label: 'Slug',
      key: 'slug',
      sortable: true,
    },
    {
      label: 'Products',
      key: 'products_count',
      sortable: true,
      render: (brand) => brand.products_count || 0,
    },
    {
      label: 'Created',
      key: 'created_at',
      sortable: true,
      render: (brand) => formatDate(brand.created_at),
    },
    {
      label: 'Actions',
      key: 'actions',
      sortable: false,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Product Brands"
        actionButton={{
          label: 'Add Brand',
          link: '/admin/store/brands/create',
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
          {brands.length > 0 ? (
              <DataTable
                  columns={columns}
                  data={brands}
                  emptyMessage="No brands found. Create your first brand to get started."
                  viewBaseUrl="/admin/store/brands"
                  editBaseUrl="/admin/store/brands/edit"
                  onDelete={handleDeleteClick}
              />
          ):(
               <span className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center`}>No brands found. Create your first brand to get started.</span>
           )}

        </div>
      )}

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Brand"
        message={`Are you sure you want to delete ${selectedBrand?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default ProductBrandsList;
