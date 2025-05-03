// resources/js/admin/src/api/cacheClient.js
import apiClient from './apiClient';

// Constants for localStorage
const CACHE_STORAGE_KEY = 'retic_studio_api_cache_v2';
const CACHE_TIMESTAMP_KEY = 'retic_studio_api_cache_timestamp_v2';
const CACHE_VERSION = '1.0.1';

// Initialize cache from localStorage if available
const initializeCache = () => {
  console.log('Initializing cache from localStorage...');

  try {
    // Print detailed localStorage debug info
    const allLocalStorageKeys = Object.keys(localStorage);
    console.log('All localStorage keys:', allLocalStorageKeys);

    // Check if our cache keys exist
    const hasCacheKey = localStorage.getItem(CACHE_STORAGE_KEY) !== null;
    const hasTimestampKey = localStorage.getItem(CACHE_TIMESTAMP_KEY) !== null;
    console.log(`Cache keys exist: data=${hasCacheKey}, timestamp=${hasTimestampKey}`);

    const storedData = localStorage.getItem(CACHE_STORAGE_KEY);
    const storedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

    if (storedData && storedTimestamp) {
      console.log('Found cached data in localStorage');
      console.log('Cached timestamp:', new Date(parseInt(storedTimestamp)).toISOString());

      let parsedData;
      try {
        parsedData = JSON.parse(storedData);
        console.log('Cache size:', Object.keys(parsedData.data || {}).length);
        console.log('Cache version:', parsedData.version);
      } catch (parseError) {
        console.error('Failed to parse cache data:', parseError);
        return {
          data: new Map(),
          timeouts: new Map(),
          persistentEntries: new Set()
        };
      }

      // Check if the cache version matches current version
      if (parsedData.version !== CACHE_VERSION) {
        console.log('Cache version mismatch, clearing persistent cache');
        // Explicitly clear localStorage here
        localStorage.removeItem(CACHE_STORAGE_KEY);
        localStorage.removeItem(CACHE_TIMESTAMP_KEY);
        return {
          data: new Map(),
          timeouts: new Map(),
          persistentEntries: new Set()
        };
      }

      // Check if data is still valid (not older than 24 hours)
      const cacheAge = Date.now() - parseInt(storedTimestamp, 10);
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      if (cacheAge > maxAge) {
        console.log('Cache is too old, clearing persistent cache');
        // Explicitly clear localStorage here
        localStorage.removeItem(CACHE_STORAGE_KEY);
        localStorage.removeItem(CACHE_TIMESTAMP_KEY);
        return {
          data: new Map(),
          timeouts: new Map(),
          persistentEntries: new Set()
        };
      }

      // Convert the plain object back to a Map
      const dataMap = new Map();
      Object.entries(parsedData.data || {}).forEach(([key, value]) => {
        dataMap.set(key, value);
      });

      const persistentSet = new Set(parsedData.persistentEntries || []);

      console.log(`Restored ${dataMap.size} cached API responses from localStorage`);

      // Check first few cache entries
      if (dataMap.size > 0) {
        console.log('Example cache entries:');
        let count = 0;
        for (const [key, value] of dataMap.entries()) {
          if (count++ < 3) {  // Just show first 3 entries
            console.log(`- ${key} (${typeof value})`);
          } else {
            break;
          }
        }
      }

      return {
        data: dataMap,
        timeouts: new Map(),
        persistentEntries: persistentSet
      };
    } else {
      console.log('No cache data found in localStorage');
    }
  } catch (error) {
    console.error('Error restoring cache from localStorage:', error);
  }

  // Default empty cache
  console.log('Returning empty cache');
  return {
    data: new Map(),
    timeouts: new Map(),
    persistentEntries: new Set()
  };
};

// Cache store for API responses
const cache = initializeCache();

// Default cache TTL in seconds (5 minutes)
const DEFAULT_CACHE_TTL = 5 * 60;

// Cache keys that should have longer TTL (30 minutes)
const LONG_CACHE_ROUTES = [
  '/menus',
  '/footer/data',
  '/header/data',
  '/footer/layouts',
  '/header/layouts',
  '/footer/settings',
  '/header/settings',
  '/components',
  '/themes/active',
];
const LONG_CACHE_TTL = 30 * 60; // 30 minutes

// Cache keys that should have shorter TTL (30 seconds)
const SHORT_CACHE_ROUTES = [
  '/media',
  '/media-collections',
];
const SHORT_CACHE_TTL = 30; // 30 seconds

// Cache keys that should persist between sessions (6 hours)
const PERSISTENT_CACHE_ROUTES = [
  '/menus',
  '/footer/data',
  '/header/data',
  '/footer/settings',
  '/header/settings',
  '/components',
  '/themes/active',
  '/themes/layout',
];
const PERSISTENT_CACHE_TTL = 6 * 60 * 60; // 6 hours

/**
 * Determine the appropriate cache TTL for a URL
 *
 * @param {string} url The URL to check
 * @returns {number} The cache TTL in seconds
 */
const getCacheTTL = (url) => {
  // Check for long cache routes
  if (LONG_CACHE_ROUTES.some(route => url.includes(route))) {
    return LONG_CACHE_TTL;
  }

  // Check for short cache routes
  if (SHORT_CACHE_ROUTES.some(route => url.includes(route))) {
    return SHORT_CACHE_TTL;
  }

  // Default TTL
  return DEFAULT_CACHE_TTL;
};

/**
 * Check if a URL should be persisted to localStorage
 *
 * @param {string} url The URL to check
 * @returns {boolean} Whether the URL should be persisted
 */
const shouldPersistCache = (url) => {
  return PERSISTENT_CACHE_ROUTES.some(route => url.includes(route));
};

/**
 * Generate a cache key from the request
 */
const generateCacheKey = (url, params = {}) => {
  // Convert params to string if they exist
  const paramsStr = Object.keys(params).length
    ? JSON.stringify(params)
    : '';

  return `${url}${paramsStr}`;
};

/**
 * Save cache to localStorage
 */
const persistCacheToStorage = () => {
  try {
    // Check if caching is globally disabled
    const isCachingDisabled = localStorage.getItem('retic_caching_disabled') === 'true';
    
    // If caching is disabled, don't persist anything
    if (isCachingDisabled) {
      console.log('Caching disabled, skipping cache persistence to localStorage');
      return;
    }
    
    // Only store persistent entries
    const persistentData = {};

    cache.persistentEntries.forEach(key => {
      if (cache.data.has(key)) {
        persistentData[key] = cache.data.get(key);
      }
    });

    // Only save if we have data
    if (Object.keys(persistentData).length > 0) {
      const dataToStore = {
        version: CACHE_VERSION,
        data: persistentData,
        persistentEntries: Array.from(cache.persistentEntries)
      };

      localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(dataToStore));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());

      console.log(`Persisted ${Object.keys(persistentData).length} API responses to localStorage`);
    }
  } catch (error) {
    console.error('Error persisting cache to localStorage:', error);
  }
};

/**
 * Add entry to persistent cache
 */
const addToPersistentCache = (key) => {
  // Check if caching is globally disabled
  const isCachingDisabled = localStorage.getItem('retic_caching_disabled') === 'true';
  
  // If caching is disabled, don't add to persistent cache
  if (isCachingDisabled) {
    console.log('Caching disabled, skipping persistent cache addition for:', key);
    return;
  }
  
  cache.persistentEntries.add(key);
  // Debounce the save operation
  if (cache.persistSaveTimeout) {
    clearTimeout(cache.persistSaveTimeout);
  }
  cache.persistSaveTimeout = setTimeout(persistCacheToStorage, 1000);
};

/**
 * Clear cache entry
 */
const clearCacheEntry = (key) => {
  cache.data.delete(key);
  cache.persistentEntries.delete(key);

  if (cache.timeouts.has(key)) {
    clearTimeout(cache.timeouts.get(key));
    cache.timeouts.delete(key);
  }
};

/**
 * Clear all cache entries
 */
export const clearCache = () => {
  console.log('Clearing all cache data...');

  // Clear all timeout handlers
  cache.timeouts.forEach(timeout => clearTimeout(timeout));

  // Clear all cache data
  cache.data.clear();
  cache.timeouts.clear();
  cache.persistentEntries.clear();

  // Clear localStorage cache
  try {
    console.log('Removing localStorage cache keys:');
    console.log(`- ${CACHE_STORAGE_KEY}`);
    console.log(`- ${CACHE_TIMESTAMP_KEY}`);

    localStorage.removeItem(CACHE_STORAGE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);

    // Verify keys were removed
    const dataRemoved = localStorage.getItem(CACHE_STORAGE_KEY) === null;
    const timestampRemoved = localStorage.getItem(CACHE_TIMESTAMP_KEY) === null;

    console.log(`Cache keys removed: data=${dataRemoved}, timestamp=${timestampRemoved}`);

    if (!dataRemoved || !timestampRemoved) {
      console.warn('⚠️ Some localStorage items could not be removed!');

      // Try alternative method
      console.log('Attempting alternative localStorage removal method...');
      delete localStorage[CACHE_STORAGE_KEY];
      delete localStorage[CACHE_TIMESTAMP_KEY];

      // Check again
      const dataRemovedAlt = localStorage.getItem(CACHE_STORAGE_KEY) === null;
      const timestampRemovedAlt = localStorage.getItem(CACHE_TIMESTAMP_KEY) === null;

      console.log(`Cache keys removed (alternative method): data=${dataRemovedAlt}, timestamp=${timestampRemovedAlt}`);
    }

  } catch (e) {
    console.error('Error clearing localStorage cache:', e);
  }

  console.log('API cache cleared (including localStorage)');

  // Return new empty cache configuration
  return {
    data: new Map(),
    timeouts: new Map(),
    persistentEntries: new Set()
  };
};

/**
 * Invalidate cache for specific route patterns
 */
export const invalidateCache = (patterns = []) => {
  if (!patterns.length) return;

  // Get all cache keys
  const keys = Array.from(cache.data.keys());

  // Filter keys that match any pattern
  const keysToInvalidate = keys.filter(key =>
    patterns.some(pattern => key.includes(pattern))
  );

  // Clear matching keys
  keysToInvalidate.forEach(key => clearCacheEntry(key));

  // Save changes to localStorage if any persistent entries were invalidated
  if (keysToInvalidate.some(key => cache.persistentEntries.has(key))) {
    persistCacheToStorage();
  }

  console.log(`Invalidated ${keysToInvalidate.length} cache entries for patterns:`, patterns);
};

/**
 * Get cached HTTP get request
 */
export const cachedGet = async (url, params = {}, options = {}) => {
  const { skipCache = false, ttl } = options;
  const cacheKey = generateCacheKey(url, params);

  // Check if caching is globally disabled
  const isCachingDisabled = localStorage.getItem('retic_caching_disabled') === 'true';

  // If caching is disabled, always skip the cache
  const shouldSkipCache = skipCache || isCachingDisabled;

  if (isCachingDisabled) {
    console.log(`Caching disabled, bypassing cache for: ${cacheKey}`);
  }

  // Use cache if available and not skipping cache
  if (!shouldSkipCache && cache.data.has(cacheKey)) {
    console.log(`Cache hit for: ${cacheKey}`);
    return cache.data.get(cacheKey);
  }

  console.log(`Cache miss for: ${cacheKey}`);

  try {
    // Make the actual request
    const response = await apiClient.get(url, { params });

    // Only store in cache if caching is not disabled
    if (!isCachingDisabled) {
      // Store in cache
      cache.data.set(cacheKey, response);

      // Set cache expiration
      const cacheTTL = ttl || getCacheTTL(url);

      // Clear any existing timeout
      if (cache.timeouts.has(cacheKey)) {
        clearTimeout(cache.timeouts.get(cacheKey));
      }

      // Set new timeout
      const timeoutId = setTimeout(() => {
        clearCacheEntry(cacheKey);
      }, cacheTTL * 1000);

      cache.timeouts.set(cacheKey, timeoutId);

      // Check if this URL should be persisted between sessions
      if (shouldPersistCache(url)) {
        addToPersistentCache(cacheKey);
      }
    } else {
      console.log(`Caching disabled, not storing response for: ${cacheKey}`);
    }

    return response;

  } catch (error) {
    console.error(`Cache request error for ${cacheKey}:`, error);
    throw error;
  }
};

// Create API client with caching
const cacheClient = {
  // Standard methods directly from apiClient
  post: apiClient.post.bind(apiClient),
  put: apiClient.put.bind(apiClient),
  delete: apiClient.delete.bind(apiClient),
  patch: apiClient.patch.bind(apiClient),

  // Cached get method
  get: cachedGet,

  // Cache management methods
  clearCache,
  invalidateCache,

  // Force cache persistence to localStorage
  persistCache: persistCacheToStorage,

  // Get cache stats
  getCacheStats: () => ({
    totalEntries: cache.data.size,
    persistentEntries: cache.persistentEntries.size,
    cacheVersion: CACHE_VERSION,
    cachingDisabled: localStorage.getItem('retic_caching_disabled') === 'true'
  })
};

// Set up window beforeunload event to save cache to localStorage
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    // Check if caching is globally disabled
    const isCachingDisabled = localStorage.getItem('retic_caching_disabled') === 'true';
    
    // Only save cache on unload if caching is enabled
    if (!isCachingDisabled) {
      // Final save of cache to localStorage on page unload
      persistCacheToStorage();
    }
  });
}

export default cacheClient;
