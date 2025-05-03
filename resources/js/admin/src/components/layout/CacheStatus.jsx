// resources/js/admin/src/components/layout/CacheStatus.jsx
import React, { useState } from 'react';
import { useCache } from '../../store/CacheContext';

/**
 * Cache Status Component
 * Shows cache information and provides controls to clear cache
 */
const CacheStatus = () => {
  const { cacheStats, clearAllCache, persistCacheNow, cachingDisabled, toggleCaching } = useCache();
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => setExpanded(!expanded);

  // Emergency clear function that bypasses localStorage
  const emergencyClear = () => {
    try {
      // Try to clear cache from all possible storage mechanisms
      localStorage.clear();
      sessionStorage.clear();

      // Force reload the page
      alert('All browser storage cleared. The page will now reload.');
      window.location.reload(true); // true forces a reload from server, not cache
    } catch (e) {
      console.error('Error in emergency clear:', e);
      alert('Error clearing storage: ' + e.message);
    }
  };

  const handleSaveCache = () => {
    console.log("trying to save cache");
    persistCacheNow();
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-2 border border-gray-200">
        <button
          onClick={toggleExpanded}
          className="flex items-center justify-between w-full px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 gap-1"
        >
          <span className="flex items-center">
            <span className={`w-2 h-2 rounded-full mr-2 ${
              cachingDisabled ? 'bg-red-500' : (cacheStats.totalEntries > 0 ? 'bg-green-500' : 'bg-gray-300')
            }`}></span>
            Cache {cachingDisabled && "(Disabled)"}
          </span>
          <span className="text-xs text-gray-500">{cacheStats.totalEntries} items</span>
        </button>

        {expanded && (
          <div className="mt-2 border-t border-gray-200 pt-2">
            <div className="text-xs text-gray-600 px-2 mb-2">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={cachingDisabled ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                  {cachingDisabled ? 'Disabled' : 'Enabled'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Entries:</span>
                <span>{cacheStats.totalEntries}</span>
              </div>
              <div className="flex justify-between">
                <span>Persistent:</span>
                <span>{cacheStats.persistentEntries}</span>
              </div>
              <div className="flex justify-between">
                <span>Version:</span>
                <span>{cacheStats.cacheVersion}</span>
              </div>
            </div>

            <div className="flex flex-col space-y-1">
              {/* Toggle Cache Button */}
              <button
                onClick={toggleCaching}
                className={`text-xs px-3 py-1 ${
                  cachingDisabled 
                    ? 'bg-green-50 hover:bg-green-100 text-green-700' 
                    : 'bg-red-50 hover:bg-red-100 text-red-700'
                } rounded flex items-center justify-between`}
              >
                <span>{cachingDisabled ? 'Enable Caching' : 'Disable Caching'}</span>
                <span className={`ml-2 w-3 h-3 rounded-full ${cachingDisabled ? 'bg-red-500' : 'bg-green-500'}`}></span>
              </button>
              
              {/* Only show these buttons if caching is enabled */}
              {!cachingDisabled && (
                <>
                  <button
                    onClick={handleSaveCache}
                    className="text-xs px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded"
                  >
                    Save Cache
                  </button>
                  <button
                    onClick={clearAllCache}
                    className="text-xs px-3 py-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded"
                  >
                    Clear Cache
                  </button>
                </>
              )}
              
              {/* Emergency Clear is always available */}
              <button
                onClick={() => {
                  if (confirm('This will clear ALL browser storage and reload the page. Continue?')) {
                    emergencyClear();
                  }
                }}
                className="text-xs px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded"
              >
                Emergency Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CacheStatus;
