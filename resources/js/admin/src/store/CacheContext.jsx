// resources/js/admin/src/store/CacheContext.jsx
import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import cacheClient, { clearCache, invalidateCache } from '../api/cacheClient';
import {toast} from "react-toastify";

// Import the CACHE_VERSION constant from cacheClient
// There's no direct export, so we define it here to match cacheClient.js
const CACHE_VERSION = '1.0.1';

// Create context
const CacheContext = createContext();

/**
 * Provider component that wraps app and provides cache-related functions
 */
export const CacheProvider = ({ children }) => {
  const [cacheStats, setCacheStats] = useState({
    totalEntries: 0,
    persistentEntries: 0,
    cacheVersion: '0'
  });

  // State to track if caching is disabled
  const [cachingDisabled, setCachingDisabled] = useState(() => {
    // Check if there's a saved preference in localStorage
    const saved = localStorage.getItem('retic_caching_disabled');
    return saved === 'true';
  });

  // Update cache stats every minute and on mount
  useEffect(() => {
    const updateStats = () => {
      setCacheStats(cacheClient.getCacheStats());
    };

    // Initial stats update
    updateStats();

    // Update stats periodically
    const intervalId = setInterval(updateStats, 60000);

    return () => clearInterval(intervalId);
  }, []);

  // Clear all cache
  const clearAllCache = useCallback(() => {
    console.log('CacheContext: Clearing all cache data');
    // Clear all cache data
    clearCache();

    // Update stats with empty values
    setCacheStats({
      totalEntries: 0,
      persistentEntries: 0,
      cacheVersion: CACHE_VERSION
    });

    toast.success('Cache cleared.');
    // Force a window reload to ensure everything is clean

  }, []);

  // Invalidate specific cache patterns
  const invalidateSpecificCache = useCallback((patterns) => {
    invalidateCache(patterns);
    setCacheStats(cacheClient.getCacheStats());
  }, []);

  // Invalidate menu cache
  const invalidateMenuCache = useCallback(() => {
    invalidateCache(['/menus', '/footer/data', '/header/data']);
    setCacheStats(cacheClient.getCacheStats());
  }, []);

  // Invalidate footer cache
  const invalidateFooterCache = useCallback(() => {
    invalidateCache(['/footer']);
    setCacheStats(cacheClient.getCacheStats());
  }, []);

  // Invalidate header cache
  const invalidateHeaderCache = useCallback(() => {
    invalidateCache(['/header']);
    setCacheStats(cacheClient.getCacheStats());
  }, []);

  // Force persist cache to localStorage
  const persistCacheNow = useCallback(() => {
    try {
      console.log('CacheContext: Persisting all cache data');

      cacheClient.persistCache();
      setCacheStats(cacheClient.getCacheStats());
      toast.success('Cache saved')
    } catch (e){
      toast.error(e.message);
    }

  }, []);

  // Toggle caching functionality
  const toggleCaching = useCallback(() => {
    const newValue = !cachingDisabled;
    setCachingDisabled(newValue);
    localStorage.setItem('retic_caching_disabled', newValue.toString());

    if (newValue) {
      // Clear existing cache when disabling caching
      clearCache();
      setCacheStats({
        totalEntries: 0,
        persistentEntries: 0,
        cacheVersion: CACHE_VERSION
      });
      toast.info('Caching disabled. All requests will bypass the cache.');
    } else {
      toast.success('Caching enabled.');
    }
  }, [cachingDisabled]);

  // Define context value
  const contextValue = {
    cacheStats,
    cachingDisabled,
    toggleCaching,
    clearAllCache,
    invalidateSpecificCache,
    invalidateMenuCache,
    invalidateFooterCache,
    invalidateHeaderCache,
    persistCacheNow
  };

  return (
    <CacheContext.Provider value={contextValue}>
      {children}
    </CacheContext.Provider>
  );
};

/**
 * Hook to access cache functions
 */
export const useCache = () => {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCache must be used within a CacheProvider');
  }
  return context;
};

export default CacheContext;
