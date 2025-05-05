import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../../components/common/PageHeader';
import { storeApi } from '../../../api/storeApi';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Tabs from '../../../components/common/Tabs';
import { formatDate } from '../../../utils/formatUtils';
import DataTable from '../../../components/common/DataTable';
import { Link } from 'react-router-dom';

const CustomerEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'create';
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [errors, setErrors] = useState({});
  const [customer, setCustomer] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    status: 'active',
    password: '',
    password_confirmation: '',
    billing_address: {
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
    },
    shipping_address: {
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
    },
    notes: '',
  });
  const [orders, setOrders] = useState([]);
  const [sameAsShipping, setSameAsShipping] = useState(true);

  useEffect(() => {
    if (!isNew) {
      const fetchData = async () => {
        try {
          // Fetch customer
          const customerResponse = await storeApi.getCustomer(id);
          setCustomer(customerResponse.data);
          
          // Check if addresses are the same
          const billing = customerResponse.data.billing_address || {};
          const shipping = customerResponse.data.shipping_address || {};
          
          const addressesAreEqual = 
            billing.address_line1 === shipping.address_line1 &&
            billing.address_line2 === shipping.address_line2 &&
            billing.city === shipping.city &&
            billing.state === shipping.state &&
            billing.postal_code === shipping.postal_code &&
            billing.country === shipping.country;
            
          setSameAsShipping(addressesAreEqual);
          
          // Fetch customer's orders if on orders tab
          if (activeTab === 'orders') {
            const ordersResponse = await storeApi.getOrders({ customer_id: id });
            setOrders(ordersResponse.data.data);
          }
        } catch (error) {
          console.error('Error fetching customer data:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchData();
    }
  }, [id, isNew, activeTab]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested address fields
    if (name.startsWith('billing_') || name.startsWith('shipping_')) {
      const [type, field] = name.split('_');
      setCustomer({
        ...customer,
        [`${type}_address`]: {
          ...customer[`${type}_address`],
          [field]: value,
        },
      });
    } else {
      setCustomer({
        ...customer,
        [name]: value,
      });
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const copyShippingToBilling = () => {
    if (sameAsShipping) {
      setCustomer({
        ...customer,
        billing_address: { ...customer.shipping_address },
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!customer.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    
    if (!customer.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    
    if (!customer.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(customer.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (isNew || customer.password) {
      if (customer.password && customer.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      
      if (customer.password !== customer.password_confirmation) {
        newErrors.password_confirmation = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    
    // If same as shipping is checked, copy shipping to billing
    const customerData = { ...customer };
    if (sameAsShipping) {
      customerData.billing_address = { ...customerData.shipping_address };
    }
    
    try {
      if (isNew) {
        await storeApi.createCustomer(customerData);
      } else {
        await storeApi.updateCustomer(id, customerData);
      }
      
      navigate('/admin/store/customers');
    } catch (error) {
      console.error('Error saving customer:', error);
      
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: 'Failed to save customer. Please try again.' });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'addresses', label: 'Addresses' },
  ];
  
  if (!isNew) {
    tabs.push({ id: 'orders', label: 'Orders' });
  }

  const orderColumns = [
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
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.status === 'completed' ? 'bg-green-100 text-green-800' : 
          row.status === 'processing' ? 'bg-blue-100 text-blue-800' : 
          row.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
          'bg-red-100 text-red-800'
        }`}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ),
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

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title={isNew ? 'Create Customer' : `Edit Customer: ${customer.first_name} ${customer.last_name}`}
        backUrl="/admin/store/customers"
      />
      
      {errors.general && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errors.general}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg overflow-hidden">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        
        <div className="p-6">
          {activeTab === 'general' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={customer.first_name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.first_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.first_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={customer.last_name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.last_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.last_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={customer.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={customer.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password {isNew && '*'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={customer.password}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required={isNew}
                  />
                  {!isNew && (
                    <p className="mt-1 text-sm text-gray-500">
                      Leave blank to keep current password
                    </p>
                  )}
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password {isNew && '*'}
                  </label>
                  <input
                    type="password"
                    name="password_confirmation"
                    value={customer.password_confirmation}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.password_confirmation ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required={isNew}
                  />
                  {errors.password_confirmation && (
                    <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={customer.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="banned">Banned</option>
                  </select>
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Admin Only)
                  </label>
                  <textarea
                    name="notes"
                    value={customer.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </>
          )}
          
          {activeTab === 'addresses' && (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 1
                    </label>
                    <input
                      type="text"
                      name="shipping_address_line1"
                      value={customer.shipping_address?.address_line1 || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      name="shipping_address_line2"
                      value={customer.shipping_address?.address_line2 || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="shipping_city"
                      value={customer.shipping_address?.city || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State / Province
                    </label>
                    <input
                      type="text"
                      name="shipping_state"
                      value={customer.shipping_address?.state || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="shipping_postal_code"
                      value={customer.shipping_address?.postal_code || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      name="shipping_country"
                      value={customer.shipping_address?.country || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={sameAsShipping}
                    onChange={(e) => {
                      setSameAsShipping(e.target.checked);
                      if (e.target.checked) {
                        copyShippingToBilling();
                      }
                    }}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Billing address same as shipping
                  </span>
                </label>
              </div>
              
              {!sameAsShipping && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address Line 1
                      </label>
                      <input
                        type="text"
                        name="billing_address_line1"
                        value={customer.billing_address?.address_line1 || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        name="billing_address_line2"
                        value={customer.billing_address?.address_line2 || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        name="billing_city"
                        value={customer.billing_address?.city || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State / Province
                      </label>
                      <input
                        type="text"
                        name="billing_state"
                        value={customer.billing_address?.state || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="billing_postal_code"
                        value={customer.billing_address?.postal_code || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        name="billing_country"
                        value={customer.billing_address?.country || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          
          {activeTab === 'orders' && !isNew && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order History</h3>
              
              {orders.length === 0 ? (
                <p className="text-gray-500">This customer has no orders yet.</p>
              ) : (
                <DataTable
                  columns={orderColumns}
                  data={orders}
                  emptyMessage="No orders found for this customer."
                />
              )}
            </div>
          )}
        </div>
        
        <div className="px-6 py-3 bg-gray-50 text-right">
          <button
            type="button"
            onClick={() => navigate('/admin/store/customers')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {saving ? 'Saving...' : isNew ? 'Create Customer' : 'Update Customer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerEditor;