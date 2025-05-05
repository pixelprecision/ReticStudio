import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageHeader from '../../../components/common/PageHeader';
import { storeApi } from '../../../api/storeApi';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { formatDate } from '../../../utils/formatUtils';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await storeApi.getOrder(id);
        setOrder(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [id]);

  const handleUpdateStatus = (status) => {
    setSelectedStatus(status);
    setStatusDialogOpen(true);
  };

  const confirmStatusUpdate = async () => {
    setUpdatingStatus(true);
    try {
      await storeApi.updateOrderStatus(id, selectedStatus);
      
      // Refresh order data
      const response = await storeApi.getOrder(id);
      setOrder(response.data);
      setError(null);
      setStatusDialogOpen(false);
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Order Details"
          backUrl="/admin/store/orders"
        />
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      </div>
    );
  }

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-800' },
    { value: 'shipped', label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  ];

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.color : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title={`Order #${order.order_number}`}
        backUrl="/admin/store/orders"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Order Date</p>
                  <p className="mt-1">{formatDate(order.created_at)}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Method</p>
                  <p className="mt-1">{order.payment_method || 'Not specified'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Customer</p>
                  <p className="mt-1">
                    <Link to={`/admin/store/customers/edit/${order.customer_id}`} className="text-blue-600 hover:text-blue-800">
                      {order.customer_name}
                    </Link>
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="mt-1">{order.customer_email}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Items */}
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Order Items</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.product_image && (
                            <div className="flex-shrink-0 h-10 w-10 mr-4">
                              <img 
                                src={item.product_image} 
                                alt={item.product_name}
                                className="h-10 w-10 object-cover rounded" 
                              />
                            </div>
                          )}
                          <div>
                            <Link 
                              to={`/admin/store/products/edit/${item.product_id}`} 
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {item.product_name}
                            </Link>
                            {item.options && Object.keys(item.options).length > 0 && (
                              <div className="text-sm text-gray-500 mt-1">
                                {Object.entries(item.options).map(([key, value]) => (
                                  <div key={key}>
                                    {key}: {value}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${parseFloat(item.price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${parseFloat(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex justify-end">
                <div className="w-1/3">
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-gray-500">Subtotal:</span>
                    <span className="text-sm text-gray-900">${parseFloat(order.subtotal).toFixed(2)}</span>
                  </div>
                  
                  {order.discount > 0 && (
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-500">Discount:</span>
                      <span className="text-sm text-gray-900">-${parseFloat(order.discount).toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-gray-500">Shipping:</span>
                    <span className="text-sm text-gray-900">${parseFloat(order.shipping).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-gray-500">Tax:</span>
                    <span className="text-sm text-gray-900">${parseFloat(order.tax).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-t border-gray-200">
                    <span className="text-base font-medium text-gray-900">Total:</span>
                    <span className="text-base font-medium text-gray-900">${parseFloat(order.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Customer and Shipping Info */}
        <div className="lg:col-span-1">
          {/* Order Actions */}
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Order Actions</h2>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Update Status
                </label>
                <div className="flex flex-col space-y-2">
                  {statusOptions.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => handleUpdateStatus(status.value)}
                      disabled={order.status === status.value}
                      className={`px-4 py-2 rounded text-sm font-medium ${
                        order.status === status.value
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : `${status.color.replace('text-', 'hover:text-').replace('bg-', 'hover:bg-')} hover:opacity-90`
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => window.print()}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-2"
                >
                  Print Order
                </button>
              </div>
            </div>
          </div>
          
          {/* Customer Info */}
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Customer Information</h2>
            </div>
            
            <div className="p-6">
              <p className="font-medium">{order.customer_name}</p>
              <p className="text-sm text-gray-500">{order.customer_email}</p>
              {order.customer_phone && (
                <p className="text-sm text-gray-500">{order.customer_phone}</p>
              )}
              
              <div className="mt-4">
                <Link 
                  to={`/admin/store/customers/edit/${order.customer_id}`} 
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View Customer
                </Link>
              </div>
            </div>
          </div>
          
          {/* Shipping Address */}
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Shipping Address</h2>
            </div>
            
            <div className="p-6">
              {order.shipping_address ? (
                <>
                  <p>{order.shipping_address.address_line1}</p>
                  {order.shipping_address.address_line2 && (
                    <p>{order.shipping_address.address_line2}</p>
                  )}
                  <p>
                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                  </p>
                  <p>{order.shipping_address.country}</p>
                </>
              ) : (
                <p className="text-gray-500">No shipping address provided</p>
              )}
              
              {order.tracking_number && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700">Tracking Number</p>
                  <p className="text-sm">{order.tracking_number}</p>
                </div>
              )}
              
              {order.shipping_method && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700">Shipping Method</p>
                  <p className="text-sm">{order.shipping_method}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Billing Address */}
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Billing Address</h2>
            </div>
            
            <div className="p-6">
              {order.billing_address ? (
                <>
                  <p>{order.billing_address.address_line1}</p>
                  {order.billing_address.address_line2 && (
                    <p>{order.billing_address.address_line2}</p>
                  )}
                  <p>
                    {order.billing_address.city}, {order.billing_address.state} {order.billing_address.postal_code}
                  </p>
                  <p>{order.billing_address.country}</p>
                </>
              ) : (
                <p className="text-gray-500">No billing address provided</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <ConfirmDialog
        isOpen={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        onConfirm={confirmStatusUpdate}
        title="Update Order Status"
        message={`Are you sure you want to update this order's status to ${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}?`}
        confirmText={updatingStatus ? "Updating..." : "Update"}
        cancelText="Cancel"
        confirmDisabled={updatingStatus}
      />
    </div>
  );
};

export default OrderDetail;