// resources/js/admin/src/components/pageRenderer/components/AuthButtonsComponent.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiLogIn, FiUserPlus } from 'react-icons/fi';
import { useAuth } from '../../../store/AuthContext';

const AuthButtonsComponent = ({ settings }) => {
  const { isAuthenticated, user, logout } = useAuth();
  
  // Default settings
  const showLogin = settings?.show_login !== false;
  const showRegister = settings?.show_register !== false;
  const loginText = settings?.login_text || 'Login';
  const registerText = settings?.register_text || 'Register';

  // User is logged in
  if (isAuthenticated) {
    return (
      <div className="relative group">
        <button className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900">
          <FiUser className="mr-1 h-4 w-4" />
          <span>{user?.name || 'Account'}</span>
        </button>
        
        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-150 ease-in-out">
          <Link 
            to="/dashboard" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Dashboard
          </Link>
          <Link 
            to="/profile" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Profile
          </Link>
          <button
            onClick={logout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  // User is not logged in
  return (
    <div className="flex items-center space-x-2">
      {showLogin && (
        <Link 
          to="/login" 
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <FiLogIn className="mr-1 h-4 w-4" />
          {loginText}
        </Link>
      )}
      
      {showRegister && (
        <Link 
          to="/register" 
          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <FiUserPlus className="mr-1 h-4 w-4" />
          {registerText}
        </Link>
      )}
    </div>
  );
};

export default AuthButtonsComponent;