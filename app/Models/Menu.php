<?php
// app/Models/Menu.php

namespace App\Models;

use App\Traits\HasCache;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Menu extends Model
{
	use HasFactory, HasCache;
	
	// Cache duration in seconds
	const CACHE_TTL = 60 * 60; // 1 hour
	
	protected $fillable = [
		'name',
		'slug',
		'description',
		'items',
		'is_active',
		'created_by',
		'updated_by',
	];
	
	protected $casts = [
		'items' => 'array',
		'is_active' => 'boolean',
	];
	
	public function creator()
	{
		return $this->belongsTo(User::class, 'created_by');
	}
	
	public function editor()
	{
		return $this->belongsTo(User::class, 'updated_by');
	}
	
	/**
	 * Get menu by slug with caching
	 */
	public static function findBySlug($slug, $activeOnly = true)
	{
		$cacheKey = static::class . '.slug.' . $slug . ($activeOnly ? '.active' : '');
		static::storeCacheKey($cacheKey);
		
		return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($slug, $activeOnly) {
			$query = static::where('slug', $slug);
			
			if ($activeOnly) {
				$query->where('is_active', true);
			}
			
			return $query->first();
		});
	}
	
	/**
	 * Clear custom cache for this model
	 */
	protected function clearCustomCache()
	{
		// Clear slug-based caches
		if ($this->slug) {
			Cache::forget(static::class . '.slug.' . $this->slug . '.active');
			Cache::forget(static::class . '.slug.' . $this->slug);
		}
		
		// Clear caches with the public menu prefix from controller
		Cache::forget('menu.public.' . $this->slug);
	}
}