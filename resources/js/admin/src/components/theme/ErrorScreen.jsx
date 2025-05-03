// src/components/theme/ErrorScreen.jsx
import React from 'react';

const ErrorScreen = ({ message = "Something went wrong" }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950">
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="w-20 h-20 mx-auto mb-6 text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Oops! We encountered an error
        </h2>
        
        <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-md mb-6">
          <p className="text-red-700 dark:text-red-300 text-sm font-mono">
            {message}
          </p>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Please try refreshing the page or contact support if the problem persists.
        </p>
        
        <div className="flex justify-center space-x-4">
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md transition-colors"
          >
            Refresh Page
          </button>
          
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorScreen;