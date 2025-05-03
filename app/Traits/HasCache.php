<?php

namespace App\Traits;

use Illuminate\Support\Facades\Cache;

trait HasCache
{
    /**
     * Boot the trait
     */
    protected static function bootHasCache()
    {
        // Clear the model cache when a model is saved or deleted
        static::saved(function ($model) {
            $model->clearModelCache();
        });

        static::deleted(function ($model) {
            $model->clearModelCache();
        });
    }

    /**
     * Get the model cache key
     */
    public function getModelCacheKey()
    {
        return static::class . '.model.' . $this->getKey();
    }

    /**
     * Get all model instances cache key
     */
    public static function getAllCacheKey()
    {
        return static::class . '.all';
    }

    /**
     * Get paginated cache key with parameters
     */
    public static function getPaginatedCacheKey($params = [])
    {
        return static::class . '.paginated.' . md5(json_encode($params));
    }

    /**
     * Clear the model cache
     */
    public function clearModelCache()
    {
        // Clear this specific model instance
        Cache::forget($this->getModelCacheKey());
        
        // Clear the all models cache
        Cache::forget(static::getAllCacheKey());
        
        // Add custom cache clearing logic in models by overriding this method
        $this->clearCustomCache();
        
        // Track that we've cleared cache for this model
        $cacheKeys = Cache::get(static::class . '_cache_keys', []);
        foreach ($cacheKeys as $key) {
            Cache::forget($key);
        }
        Cache::forget(static::class . '_cache_keys');
    }
    
    /**
     * Clear custom cache - to be overridden by models
     */
    protected function clearCustomCache()
    {
        // Override this in model classes to clear specific caches
    }
    
    /**
     * Store cache key for later invalidation
     */
    protected static function storeCacheKey($key)
    {
        $cacheKeys = Cache::get(static::class . '_cache_keys', []);
        $cacheKeys[] = $key;
        Cache::put(static::class . '_cache_keys', array_unique($cacheKeys), 60 * 24); // Store for 24 hours
    }
}