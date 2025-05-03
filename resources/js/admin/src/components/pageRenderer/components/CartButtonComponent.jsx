// resources/js/admin/src/components/pageRenderer/components/CartButtonComponent.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';

const CartButtonComponent = ({ settings }) => {
  // Mock cart data - in a real app, this would come from a context or state management
  const [cart, setCart] = useState({
    items: [],
    itemCount: 0,
    total: 0
  });
  
  // Default settings
  const showCount = settings?.show_count !== false;
  const showTotal = settings?.show_total || false;
  
  return (
    <div className="relative group">
      <Link to="/cart" className="flex items-center text-gray-700 hover:text-gray-900">
        <span className="relative">
          <FiShoppingCart className="h-6 w-6" />
          
          {showCount && cart.itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {cart.itemCount}
            </span>
          )}
        </span>
        
        {showTotal && (
          <span className="ml-2 text-sm font-medium">
            ${cart.total.toFixed(2)}
          </span>
        )}
      </Link>
      
      {/* Mini Cart Dropdown - Only shows if there are items */}
      {cart.items.length > 0 && (
        <div className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-150 ease-in-out">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-900">Shopping Cart ({cart.itemCount})</h3>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {cart.items.map(item => (
              <div key={item.id} className="px-4 py-3 border-b border-gray-100 flex items-center">
                <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                </div>
                <div className="ml-3 flex-grow">
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.quantity} × ${item.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="px-4 py-3 border-t border-gray-100">
            <div className="flex justify-between text-sm font-medium text-gray-900">
              <p>Subtotal</p>
              <p>${cart.total.toFixed(2)}</p>
            </div>
            
            <div className="mt-3">
              <Link 
                to="/checkout" 
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Checkout
              </Link>
              <Link 
                to="/cart" 
                className="w-full flex justify-center py-2 px-4 mt-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                View Cart
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartButtonComponent;