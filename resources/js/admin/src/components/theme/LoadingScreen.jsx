// src/components/theme/LoadingScreen.jsx
import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-950 z-50">
      <div className="text-center">
        {/* Logo animation */}
        <div className="mb-8 relative">
          <div className="w-24 h-24 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mx-auto"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
            <div className="text-indigo-600 dark:text-indigo-400 font-bold text-xl">RLS</div>
          </div>
        </div>

        {/* Loading text with shimmer effect */}
        <div className="relative">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Loading
          </h3>

          {/* Shimmer effect bars */}
          <div className="space-y-2 mt-6">
            <div className="h-2 w-48 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full animate-shimmer"></div>
            </div>
            <div className="h-2 w-32 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full animate-shimmer" style={{animationDelay: '0.2s'}}></div>
            </div>
            <div className="h-2 w-40 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full animate-shimmer" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>

          {/* Loading message */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Preparing your beautiful experience...
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
