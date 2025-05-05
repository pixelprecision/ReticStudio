import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { storeApi } from '../../../api/storeApi';
import PageHeader from '../../../components/common/PageHeader';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const CouponEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Products and categories for restrictions
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  
  // Coupon state
  const [coupon, setCoupon] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    description: '',
    is_active: true,
    usage_limit: '',
    usage_limit_per_customer: '',
    min_order_value: '',
    max_discount_amount: '',
    expires_at: '',
    starts_at: '',
    customer_eligibility: 'all',
    customers: [],
    product_restrictions: 'none',
    products: [],
    category_restrictions: 'none',
    categories: [],
    exclude_sale_items: false,
    allow_free_shipping: false
  });
  
  // Fetch coupon data if editing
  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true);
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          storeApi.getProducts({ per_page: 100 }),
          storeApi.getCategories({ per_page: 100 })
        ]);
        
        setProducts(productsResponse.data.data);
        setCategories(categoriesResponse.data.data);
      } catch (err) {
        console.error('Error fetching options:', err);
      } finally {
        setLoadingOptions(false);
      }
    };
    
    fetchOptions();
    
    if (isEditing) {
      const fetchCoupon = async () => {
        try {
          const response = await storeApi.getCoupon(id);
          setCoupon(response.data.data);
        } catch (err) {
          console.error('Error fetching coupon:', err);
          setError('Failed to load coupon data.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchCoupon();
    }
  }, [id, isEditing]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCoupon(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle select changes for multi-select
  const handleSelectChange = (e, field) => {
    const options = e.target.options;
    const values = [];
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        values.push(parseInt(options[i].value));
      }
    }
    
    setCoupon(prev => ({
      ...prev,
      [field]: values
    }));
  };
  
  // Generate a random coupon code
  const generateCouponCode = async () => {
    try {
      const response = await storeApi.generateCouponCode();
      setCoupon(prev => ({
        ...prev,
        code: response.data.code
      }));
    } catch (err) {
      console.error('Error generating coupon code:', err);
      // Fallback to a client-side code generation
      const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      setCoupon(prev => ({
        ...prev,
        code: randomCode
      }));
    }
  };
  
  // Save coupon
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage('');
    
    try {
      if (isEditing) {
        await storeApi.updateCoupon(id, coupon);
        setSuccessMessage('Coupon updated successfully');
      } else {
        await storeApi.createCoupon(coupon);
        setSuccessMessage('Coupon created successfully');
      }
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/admin/store/coupons');
      }, 1500);
    } catch (err) {
      console.error('Error saving coupon:', err);
      setError(err.response?.data?.message || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title={isEditing ? 'Edit Coupon' : 'Create Coupon'}
        backUrl="/admin/store/coupons" 
      />
      
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium">Coupon Code</label>
                <div className="flex">
                  <input 
                    type="text" 
                    name="code" 
                    value={coupon.code} 
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-l-md p-2"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={generateCouponCode}
                    className="bg-gray-200 text-gray-700 px-4 rounded-r-md"
                  >
                    Generate
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Description</label>
                <input 
                  type="text" 
                  name="description" 
                  value={coupon.description} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="For internal reference"
                />
              </div>
            </div>
          </div>
          
          {/* Discount Information */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Discount Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-2 font-medium">Discount Type</label>
                <select 
                  name="discount_type" 
                  value={coupon.discount_type} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  required
                >
                  <option value="percentage">Percentage Discount</option>
                  <option value="fixed_amount">Fixed Amount Discount</option>
                  <option value="free_shipping">Free Shipping</option>
                </select>
              </div>
              
              <div>
                <label className="block mb-2 font-medium">
                  {coupon.discount_type === 'percentage' ? 'Discount Percentage (%)' : 
                   coupon.discount_type === 'fixed_amount' ? 'Discount Amount ($)' : 
                   'Discount Value'}
                </label>
                <input 
                  type="number" 
                  name="discount_value" 
                  value={coupon.discount_value} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  step={coupon.discount_type === 'percentage' ? '0.01' : '0.01'}
                  min="0"
                  max={coupon.discount_type === 'percentage' ? '100' : undefined}
                  required={coupon.discount_type !== 'free_shipping'}
                  disabled={coupon.discount_type === 'free_shipping'}
                  placeholder={coupon.discount_type === 'percentage' ? '10' : '5.00'}
                />
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Allow Free Shipping</label>
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input 
                      type="checkbox" 
                      name="allow_free_shipping" 
                      checked={coupon.allow_free_shipping} 
                      onChange={handleChange}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                    <span className="ml-2">
                      Grant free shipping (in addition to discount)
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Usage Limits */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Usage Limits</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-2 font-medium">Usage Limit</label>
                <input 
                  type="number" 
                  name="usage_limit" 
                  value={coupon.usage_limit} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  min="0"
                  placeholder="Leave blank for unlimited"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Maximum number of times this coupon can be used
                </p>
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Usage Limit Per User</label>
                <input 
                  type="number" 
                  name="usage_limit_per_customer" 
                  value={coupon.usage_limit_per_customer} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  min="0"
                  placeholder="Leave blank for unlimited"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Maximum number of times a customer can use this coupon
                </p>
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Active</label>
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input 
                      type="checkbox" 
                      name="is_active" 
                      checked={coupon.is_active} 
                      onChange={handleChange}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                    <span className="ml-2">
                      Coupon is active and can be used
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Minimum Requirements */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Minimum Requirements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium">Minimum Order Value ($)</label>
                <input 
                  type="number" 
                  name="min_order_value" 
                  value={coupon.min_order_value} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  min="0"
                  step="0.01"
                  placeholder="Leave blank for no minimum"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Minimum purchase amount required to use this coupon
                </p>
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Maximum Discount Amount ($)</label>
                <input 
                  type="number" 
                  name="max_discount_amount" 
                  value={coupon.max_discount_amount} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  min="0"
                  step="0.01"
                  placeholder="Leave blank for no maximum"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Maximum discount amount (for percentage discounts)
                </p>
              </div>
            </div>
          </div>
          
          {/* Date Range */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Date Range</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium">Start Date</label>
                <input 
                  type="datetime-local" 
                  name="starts_at" 
                  value={coupon.starts_at} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Leave blank to start immediately
                </p>
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Expiration Date</label>
                <input 
                  type="datetime-local" 
                  name="expires_at" 
                  value={coupon.expires_at} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Leave blank for no expiration
                </p>
              </div>
            </div>
          </div>
          
          {/* Product Restrictions */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Product Restrictions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium">Product Restrictions</label>
                <select 
                  name="product_restrictions" 
                  value={coupon.product_restrictions} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="none">No product restrictions</option>
                  <option value="include">Include only specific products</option>
                  <option value="exclude">Exclude specific products</option>
                </select>
              </div>
              
              {coupon.product_restrictions !== 'none' && (
                <div>
                  <label className="block mb-2 font-medium">
                    {coupon.product_restrictions === 'include' ? 'Included Products' : 'Excluded Products'}
                  </label>
                  <select 
                    multiple
                    className="w-full border border-gray-300 rounded-md p-2 h-32"
                    onChange={(e) => handleSelectChange(e, 'products')}
                    value={coupon.products.map(id => id.toString())}
                  >
                    {loadingOptions ? (
                      <option disabled>Loading products...</option>
                    ) : (
                      products.map(product => (
                        <option key={product.id} value={product.id}>{product.name}</option>
                      ))
                    )}
                  </select>
                  <p className="text-sm text-gray-600 mt-1">
                    Hold Ctrl/Cmd to select multiple items
                  </p>
                </div>
              )}
              
              <div>
                <label className="block mb-2 font-medium">Category Restrictions</label>
                <select 
                  name="category_restrictions" 
                  value={coupon.category_restrictions} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="none">No category restrictions</option>
                  <option value="include">Include only specific categories</option>
                  <option value="exclude">Exclude specific categories</option>
                </select>
              </div>
              
              {coupon.category_restrictions !== 'none' && (
                <div>
                  <label className="block mb-2 font-medium">
                    {coupon.category_restrictions === 'include' ? 'Included Categories' : 'Excluded Categories'}
                  </label>
                  <select 
                    multiple
                    className="w-full border border-gray-300 rounded-md p-2 h-32"
                    onChange={(e) => handleSelectChange(e, 'categories')}
                    value={coupon.categories.map(id => id.toString())}
                  >
                    {loadingOptions ? (
                      <option disabled>Loading categories...</option>
                    ) : (
                      categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))
                    )}
                  </select>
                  <p className="text-sm text-gray-600 mt-1">
                    Hold Ctrl/Cmd to select multiple items
                  </p>
                </div>
              )}
              
              <div className="col-span-2">
                <label className="inline-flex items-center">
                  <input 
                    type="checkbox" 
                    name="exclude_sale_items" 
                    checked={coupon.exclude_sale_items} 
                    onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2">
                    Exclude sale items from this coupon
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-4">
          <button 
            type="button" 
            onClick={() => navigate('/admin/store/coupons')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Coupon'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CouponEditor;