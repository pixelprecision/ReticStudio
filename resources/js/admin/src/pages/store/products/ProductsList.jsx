import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { storeApi } from '../../../api/storeApi';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/common/DataTable';
import Pagination from '../../../components/common/Pagination';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ProductDropdown from "./ProductDropdown.jsx";

const ProductsList = () => {
  const tableRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    perPage: 10,
    totalRecords: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    category_id: '',
    brand_id: '',
    is_visible: '',
    stock_status: ''
  });
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    productId: null,
    productName: ''
  });
  const [sortParams, setSortParams] = useState({
    field: 'created_at',
    direction: 'desc'
  });

  // Fetch products with filters and pagination
  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: pagination.perPage,
        ...filters,
        sort_field: sortParams.field,
        sort_direction: sortParams.direction
      };

      const response = await storeApi.getProducts(params);

      const responseData = response.data.data;
      const productsData = responseData.data;

      // Debug product images
      console.log("PRODUCTS:", responseData);
      productsData.forEach(product => {
        if (product.images && product.images.length > 0) {
          console.log(`Product ${product.id} (${product.name}) images:`, product.images);
          product.images.forEach((img, index) => {
            console.log(`  Image ${index + 1}:`, {
              id: img.id,
              url: img.url,
              thumbnail_url: img.thumbnail_url,
              image_url: img.image_url,
              media: img.media
            });
          });
        } else {
          console.log(`Product ${product.id} (${product.name}) has no images`);
        }
      });

      setProducts(productsData);

      setPagination({
        currentPage: responseData.current_page,
        totalPages: responseData.last_page,
        perPage: responseData.per_page,
        totalRecords: responseData.total
      });
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load categories and brands
  const loadFilterOptions = async () => {
    try {
      const [categoriesResponse, brandsResponse] = await Promise.all([
        storeApi.getCategories(),
        storeApi.getBrands()
      ]);

      const categoryData = categoriesResponse.data.data;
      const brandsData = brandsResponse.data.data;

      console.log("CATEGORIES:", categoryData);
      setCategories(categoryData.data);
      setBrands(brandsData.data);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  // Initial load
  useEffect(() => {
    loadFilterOptions();
    fetchProducts();
  }, []);

  // Reload when filters or sort parameters change
  useEffect(() => {
    fetchProducts(1);
  }, [filters, sortParams]);



  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      category_id: '',
      brand_id: '',
      is_visible: '',
      stock_status: ''
    });
  };

  // Handle sort change
  const handleSort = (field) => {
    setSortParams(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Open delete confirmation dialog
  const confirmDelete = (product) => {
    setDeleteDialog({
      isOpen: true,
      productId: product.id,
      productName: product.name
    });
  };

  // Delete product
  const deleteProduct = async () => {
    try {
      await storeApi.deleteProduct(deleteDialog.productId);
      setDeleteDialog({
        isOpen: false,
        productId: null,
        productName: ''
      });
      fetchProducts(pagination.currentPage);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  // Format price with currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Table columns
  const columns = [
    {
      label: 'Image',
      key: 'image',
      sortable: false,
      render: (product) => {
        // Find the primary image (featured or first one)
        const primaryImage = product.images?.find(img => img.is_featured) || product.images?.[0];

        // If no image is found, show placeholder
        if (!primaryImage) {
          return (
            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-500">
              No image
            </div>
          );
        }

        // Use thumbnail_url directly if it exists, or fall back to url
        const imageUrl = primaryImage.thumbnail_url || primaryImage.url;

        return (
          <div className="w-16 h-16 relative">
            <img
              src={imageUrl}
              alt={primaryImage.alt_text || product.name}
              className="w-16 h-16 object-cover rounded"
              onError={(e) => {
                console.error('Image failed to load:', imageUrl);
                e.target.onerror = null; // Prevent infinite loop
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmaWxsPSIjOTk5Ij5FcnJvcjwvdGV4dD48L3N2Zz4=';
              }}
            />
          </div>
        );
      }
    },
    {
      label: 'Name',
      key: 'name',
      sortable: true,
    },
    {
      label: 'SKU',
      key: 'sku',
      sortable: true,
    },
    {
      label: 'Price',
      key: 'default_price',
      sortable: true,
      render: (product) => formatPrice(product.default_price)
    },
    {
      label: 'Brand',
      key: 'brand',
      sortable: false,
      render: (product) => product.brand?.name || '-'
    },
    {
      label: 'Status',
      key: 'stock_status',
      sortable: true,
      render: (product) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          product.stock_status === 'in_stock' ? 'bg-green-100 text-green-800' :
          product.stock_status === 'out_of_stock' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {product.stock_status === 'in_stock' ? 'In Stock' :
           product.stock_status === 'out_of_stock' ? 'Out of Stock' :
           'Coming Soon'}
        </span>
      )
    },
    {
      label: 'Visible',
      key: 'is_visible',
      sortable: true,
      render: (product) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          product.is_visible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {product.is_visible ? 'Yes' : 'No'}
        </span>
      )
    },
    {
      label: 'Actions',
      key: 'actions',
      sortable: false
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Products"
        actionButton={{
          label: 'Add Product',
          link: '/admin/store/products/create',
          icon: 'plus'
        }}
      />

      {/* Filters */}
      <div className="bg-white p-6 rounded-md shadow-sm mb-6">
        <h3 className="text-lg font-medium mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Search</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Name, SKU or description"
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Category</label>
            <select
              name="category_id"
              value={filters.category_id}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Brand</label>
            <select
              name="brand_id"
              value={filters.brand_id}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              <option value="">All Brands</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Visibility</label>
            <select
              name="is_visible"
              value={filters.is_visible}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              <option value="">All</option>
              <option value="1">Visible</option>
              <option value="0">Hidden</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Stock Status</label>
            <select
              name="stock_status"
              value={filters.stock_status}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              <option value="">All</option>
              <option value="in_stock">In Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="coming_soon">Coming Soon</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={resetFilters}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div ref={tableRef}>
            <DataTable
              columns={columns}
              data={products}
              sortParams={sortParams}
              onSort={handleSort}
              emptyMessage="No products found."
              actionRenderer={(product) => (
                  <div className="flex space-x-2">
                    <ProductDropdown product={product} onDelete={confirmDelete} />
                  </div>
              )}
            />
          </div>

          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalRecords={pagination.totalRecords}
            perPage={pagination.perPage}
            onPageChange={fetchProducts}
          />
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteDialog.productName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={deleteProduct}
        onCancel={() => setDeleteDialog({ isOpen: false, productId: null, productName: '' })}
      />
    </div>
  );
};

export default ProductsList;
