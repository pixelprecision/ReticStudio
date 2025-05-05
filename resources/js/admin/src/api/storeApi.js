import apiClient from './apiClient';

// Helper function to ensure backward compatibility with both /store/products and /products paths
const createEndpointWithFallback = (endpoint) => {
  // First try without the /store prefix
  return async (...args) => {
    try {
      return await endpoint(...args);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // If we get a 404, try again with /store prefix
        const originalUrl = error.config.url;
        if (!originalUrl.startsWith('/store/')) {
          error.config.url = `/store${originalUrl}`;
          return apiClient(error.config);
        }
      }
      throw error;
    }
  };
};

export const storeApi = {
  // Products
  getProducts: createEndpointWithFallback((params) => apiClient.get('/products', { params })),
  getProduct: createEndpointWithFallback((id) => apiClient.get(`/products/${id}`)),
  getProductBySlug: createEndpointWithFallback((slug) => apiClient.get(`/products/slug/${slug}`)),
  getRelatedProducts: createEndpointWithFallback((id) => apiClient.get(`/products/${id}/related`)),
  getProductImages: createEndpointWithFallback((id) => apiClient.get(`/products/${id}/images`)),
  searchProducts: createEndpointWithFallback((query) => apiClient.get('/products/search', { params: { query } })),
  createProduct: createEndpointWithFallback((data) => apiClient.post('/products', data)),
  updateProduct: createEndpointWithFallback((id, data) => apiClient.put(`/products/${id}`, data)),
  deleteProduct: createEndpointWithFallback((id) => apiClient.delete(`/products/${id}`)),
  
  // Product Images
  // Keep both method names for backward compatibility
  addProductImage: createEndpointWithFallback((productId, data) => {
    const formData = new FormData();
    if (data.file) formData.append('image', data.file);
    if (data.alt) formData.append('alt', data.alt);
    if (data.sort_order) formData.append('sort_order', data.sort_order);
    return apiClient.post(`/products/${productId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }),
  // Alias for addProductImage with the new name
  uploadProductImage: createEndpointWithFallback((productId, data) => {
    const formData = new FormData();
    if (data.file) formData.append('image', data.file);
    if (data.alt) formData.append('alt', data.alt);
    if (data.sort_order) formData.append('sort_order', data.sort_order);
    return apiClient.post(`/products/${productId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }),
  deleteProductImage: createEndpointWithFallback((productId, imageId) => 
    apiClient.delete(`/products/${productId}/images/${imageId}`)),
  reorderProductImages: createEndpointWithFallback((productId, imageIds) => 
    apiClient.post(`/products/${productId}/images/reorder`, { image_ids: imageIds })),
  createProductImageRelation: createEndpointWithFallback((productId, data) => 
    apiClient.post(`/products/${productId}/attach-media`, data)),
  
  // Product Variants
  getProductVariants: createEndpointWithFallback((productId) => apiClient.get(`/products/${productId}/variants`)),
  getProductVariant: createEndpointWithFallback((productId, variantId) => apiClient.get(`/products/${productId}/variants/${variantId}`)),
  createProductVariant: createEndpointWithFallback((productId, data) => apiClient.post(`/products/${productId}/variants`, data)),
  updateProductVariant: createEndpointWithFallback((productId, variantId, data) => apiClient.put(`/products/${productId}/variants/${variantId}`, data)),
  deleteProductVariant: createEndpointWithFallback((productId, variantId) => apiClient.delete(`/products/${productId}/variants/${variantId}`)),
  updateVariantInventory: createEndpointWithFallback((productId, variantId, data) => apiClient.put(`/products/${productId}/variants/${variantId}/inventory`, data)),
  
  // Categories
  getCategories: createEndpointWithFallback((params) => apiClient.get('/product-categories', { params })),
  getCategoriesTree: createEndpointWithFallback(() => apiClient.get('/product-categories/tree')),
  getCategoriesList: createEndpointWithFallback(() => apiClient.get('/product-categories/list')),
  getCategory: createEndpointWithFallback((id) => apiClient.get(`/product-categories/${id}`)),
  getCategoryBySlug: createEndpointWithFallback((slug) => apiClient.get(`/product-categories/slug/${slug}`)),
  createCategory: createEndpointWithFallback((data) => apiClient.post('/product-categories', data)),
  updateCategory: createEndpointWithFallback((id, data) => apiClient.put(`/product-categories/${id}`, data)),
  deleteCategory: createEndpointWithFallback((id) => apiClient.delete(`/product-categories/${id}`)),
  uploadCategoryImage: createEndpointWithFallback((id, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return apiClient.post(`/product-categories/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }),
  
  // Brands
  getBrands: createEndpointWithFallback((params) => apiClient.get('/product-brands', { params })),
  getBrandsList: createEndpointWithFallback(() => apiClient.get('/product-brands/list')),
  getBrand: createEndpointWithFallback((id) => apiClient.get(`/product-brands/${id}`)),
  getBrandBySlug: createEndpointWithFallback((slug) => apiClient.get(`/product-brands/slug/${slug}`)),
  createBrand: createEndpointWithFallback((data) => apiClient.post('/product-brands', data)),
  updateBrand: createEndpointWithFallback((id, data) => apiClient.put(`/product-brands/${id}`, data)),
  deleteBrand: createEndpointWithFallback((id) => apiClient.delete(`/product-brands/${id}`)),
  uploadBrandLogo: createEndpointWithFallback((id, logoFile) => {
    const formData = new FormData();
    formData.append('logo', logoFile);
    return apiClient.post(`/product-brands/${id}/logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }),
  
  // Product Reviews
  getProductReviews: createEndpointWithFallback((productId) => apiClient.get(`/products/${productId}/reviews`)),
  getAllReviews: createEndpointWithFallback((params) => apiClient.get('/reviews', { params })),
  getReview: createEndpointWithFallback((id) => apiClient.get(`/reviews/${id}`)),
  createReview: createEndpointWithFallback((productId, data) => apiClient.post(`/products/${productId}/reviews`, data)),
  updateReview: createEndpointWithFallback((id, data) => apiClient.put(`/reviews/${id}`, data)),
  deleteReview: createEndpointWithFallback((id) => apiClient.delete(`/reviews/${id}`)),
  approveReview: createEndpointWithFallback((id) => apiClient.post(`/reviews/${id}/approve`)),
  disapproveReview: createEndpointWithFallback((id) => apiClient.post(`/reviews/${id}/disapprove`)),
  
  // Customers
  getCustomers: createEndpointWithFallback((params) => apiClient.get('/customers', { params })),
  getCustomer: createEndpointWithFallback((id) => apiClient.get(`/customers/${id}`)),
  getCustomerOrders: createEndpointWithFallback((id) => apiClient.get(`/customers/${id}/orders`)),
  createCustomer: createEndpointWithFallback((data) => apiClient.post('/customers', data)),
  updateCustomer: createEndpointWithFallback((id, data) => apiClient.put(`/customers/${id}`, data)),
  deleteCustomer: createEndpointWithFallback((id) => apiClient.delete(`/customers/${id}`)),
  addCustomerAddress: createEndpointWithFallback((customerId, data) => apiClient.post(`/customers/${customerId}/addresses`, data)),
  updateCustomerAddress: createEndpointWithFallback((customerId, addressId, data) => apiClient.put(`/customers/${customerId}/addresses/${addressId}`, data)),
  deleteCustomerAddress: createEndpointWithFallback((customerId, addressId) => apiClient.delete(`/customers/${customerId}/addresses/${addressId}`)),
  importCustomers: createEndpointWithFallback((data) => apiClient.post('/customers/import', data)),
  exportCustomers: createEndpointWithFallback(() => apiClient.get('/customers/export')),
  
  // Orders
  getOrders: createEndpointWithFallback((params) => apiClient.get('/orders', { params })),
  getOrder: createEndpointWithFallback((id) => apiClient.get(`/orders/${id}`)),
  getOrderByNumber: createEndpointWithFallback((orderNumber) => apiClient.get(`/orders/number/${orderNumber}`)),
  createOrder: createEndpointWithFallback((data) => apiClient.post('/orders', data)),
  updateOrder: createEndpointWithFallback((id, data) => apiClient.put(`/orders/${id}`, data)),
  deleteOrder: createEndpointWithFallback((id) => apiClient.delete(`/orders/${id}`)),
  updateOrderStatus: createEndpointWithFallback((id, status) => apiClient.put(`/orders/${id}/status`, { status })),
  updateOrderPaymentStatus: createEndpointWithFallback((id, paymentStatus) => apiClient.put(`/orders/${id}/payment-status`, { status: paymentStatus })),
  updateOrderShipping: createEndpointWithFallback((id, data) => apiClient.put(`/orders/${id}/shipping`, data)),
  addOrderNote: createEndpointWithFallback((id, note) => apiClient.post(`/orders/${id}/notes`, { note })),
  exportOrders: createEndpointWithFallback((params) => apiClient.get('/orders/export', { params })),
  
  // Store Settings
  getStoreSettings: createEndpointWithFallback(() => apiClient.get('/store/settings')),
  updateStoreSettings: createEndpointWithFallback((data) => apiClient.put('/store/settings', data)),
  getStoreStatus: createEndpointWithFallback(() => apiClient.get('/store/status')),
  
  // Cart
  getCart: createEndpointWithFallback(() => apiClient.get('/cart')),
  addCartItem: createEndpointWithFallback((data) => apiClient.post('/cart/items', data)),
  updateCartItemQuantity: createEndpointWithFallback((itemId, quantity) => apiClient.put(`/cart/items/${itemId}`, { quantity })),
  removeCartItem: createEndpointWithFallback((itemId) => apiClient.delete(`/cart/items/${itemId}`)),
  clearCart: createEndpointWithFallback(() => apiClient.post('/cart/clear')),
  applyCoupon: createEndpointWithFallback((code) => apiClient.post('/cart/coupon', { code })),
  removeCoupon: createEndpointWithFallback(() => apiClient.delete('/cart/coupon')),
  updateCartNotes: createEndpointWithFallback((notes) => apiClient.put('/cart/notes', { notes })),
  
  // Coupons
  getCoupons: createEndpointWithFallback((params) => apiClient.get('/coupons', { params })),
  getCoupon: createEndpointWithFallback((id) => apiClient.get(`/coupons/${id}`)),
  getCouponByCode: createEndpointWithFallback((code) => apiClient.get(`/coupons/code/${code}`)),
  createCoupon: createEndpointWithFallback((data) => apiClient.post('/coupons', data)),
  updateCoupon: createEndpointWithFallback((id, data) => apiClient.put(`/coupons/${id}`, data)),
  deleteCoupon: createEndpointWithFallback((id) => apiClient.delete(`/coupons/${id}`)),
  validateCoupon: createEndpointWithFallback((code) => apiClient.post('/coupons/validate', { code })),
  generateCouponCode: createEndpointWithFallback(() => apiClient.get('/coupons/generate-code')),
  
  // Restoration methods for soft-deleted items
  restoreOrderItem: createEndpointWithFallback((orderId, itemId) => 
    apiClient.post(`/orders/${orderId}/items/${itemId}/restore`)),
  
  restoreTransaction: createEndpointWithFallback((orderId, transactionId) => 
    apiClient.post(`/orders/${orderId}/transactions/${transactionId}/restore`)),
  
  restoreCart: createEndpointWithFallback((id) => 
    apiClient.post(`/carts/${id}/restore`)),
  
  restoreCartItem: createEndpointWithFallback((id) => 
    apiClient.post(`/cart-items/${id}/restore`)),
  
  restoreProductSpecification: createEndpointWithFallback((productId, specId) => 
    apiClient.post(`/products/${productId}/specifications/${specId}/restore`)),
  
  restoreProductVideo: createEndpointWithFallback((productId, videoId) => 
    apiClient.post(`/products/${productId}/videos/${videoId}/restore`)),
  
  restoreReviewImage: createEndpointWithFallback((reviewId, imageId) => 
    apiClient.post(`/reviews/${reviewId}/images/${imageId}/restore`)),
  
  restoreStoreSetting: createEndpointWithFallback((id) => 
    apiClient.post(`/store-settings/${id}/restore`)),
    
  // Additional restoration methods
  restoreProductBrand: createEndpointWithFallback((id) => 
    apiClient.post(`/product-brands/${id}/restore`)),
  
  restoreProductCategory: createEndpointWithFallback((id) => 
    apiClient.post(`/product-categories/${id}/restore`)),
  
  restoreProductImage: createEndpointWithFallback((productId, imageId) => 
    apiClient.post(`/products/${productId}/images/${imageId}/restore`)),
  
  restoreCustomer: createEndpointWithFallback((id) => 
    apiClient.post(`/customers/${id}/restore`)),
  
  restoreCustomerAddress: createEndpointWithFallback((customerId, addressId) => 
    apiClient.post(`/customers/${customerId}/addresses/${addressId}/restore`)),
  
  restoreProductReview: createEndpointWithFallback((id) => 
    apiClient.post(`/reviews/${id}/restore`)),
  
  restoreCoupon: createEndpointWithFallback((id) => 
    apiClient.post(`/coupons/${id}/restore`)),
};

export default storeApi;