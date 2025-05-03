<?php
// app/Http/Controllers/Api/MenuController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class MenuController extends Controller
{
	// Cache keys and durations
	private const CACHE_KEY_ALL_MENUS = 'menus.all';
	private const CACHE_KEY_MENU_PREFIX = 'menu.';
	private const CACHE_KEY_PUBLIC_MENU_PREFIX = 'menu.public.';
	private const CACHE_TTL = -1; //60 * 60; // 1 hour in seconds
	
	public function __construct()
	{
	
	}
	
	/**
	 * Get a paginated list of menus with optional filtering
	 */
	public function index(Request $request)
	{
		// Create a unique cache key based on request parameters
		$cacheKey = self::CACHE_KEY_ALL_MENUS . '.' . md5(json_encode($request->all()));
		
		$query = Menu::query()
		             ->with(['creator:id,name', 'editor:id,name']);
		
		if ($request->has('search')) {
			$search = $request->input('search');
			$query->where('name', 'like', "%{$search}%")
			      ->orWhere('slug', 'like', "%{$search}%");
		}
		
		if ($request->has('is_active')) {
			$query->where('is_active', $request->boolean('is_active'));
		}
		
		$menus = $query->orderBy('created_at', 'desc')
		               ->paginate($request->input('per_page', 15));
		
		return response()->json($menus);
	}
	
	/**
	 * Create a new menu
	 */
	public function store(Request $request)
	{
		$validator = Validator::make($request->all(), [
			'name' => 'required|string|max:255',
			'slug' => 'nullable|string|max:255|unique:menus,slug',
			'description' => 'nullable|string',
			'items' => 'required|array',
			'is_active' => 'boolean',
		]);
		
		if ($validator->fails()) {
			return response()->json(['errors' => $validator->errors()], 422);
		}
		
		$data = $validator->validated();
		
		if (empty($data['slug'])) {
			$data['slug'] = Str::slug($data['name']);
		}
		
		$data['created_by'] = auth()->id();
		$data['updated_by'] = auth()->id();
		
		$menu = Menu::create($data);
		
		// Clear the menus cache when a new menu is created
		$this->clearMenusCache();
		
		return response()->json($menu->load(['creator:id,name']), 201);
	}
	
	/**
	 * Get a specific menu by ID
	 */
	public function show($id)
	{
		$cacheKey = self::CACHE_KEY_MENU_PREFIX . $id;
		
		$menu = Menu::with(['creator:id,name', 'editor:id,name'])
		            ->findOrFail($id);
		
		return response()->json($menu);
	}
	
	/**
	 * Update an existing menu
	 */
	public function update(Request $request, $id)
	{
		$menu = Menu::findOrFail($id);
		
		$validator = Validator::make($request->all(), [
			'name' => 'required|string|max:255',
			'slug' => 'nullable|string|max:255|unique:menus,slug,' . $id,
			'description' => 'nullable|string',
			'items' => 'required|array',
			'is_active' => 'boolean',
		]);
		
		if ($validator->fails()) {
			return response()->json(['errors' => $validator->errors()], 422);
		}
		
		$data = $validator->validated();
		
		if (empty($data['slug'])) {
			$data['slug'] = Str::slug($data['name']);
		}
		
		$data['updated_by'] = auth()->id();
		
		// Store the old slug to clear its cache if it changed
		$oldSlug = $menu->slug;
		
		$menu->update($data);
		
		// Clear the specific menu cache and the all menus cache
		$this->clearMenuCache($id, $oldSlug, $menu->slug);
		
		return response()->json($menu->fresh()->load(['creator:id,name', 'editor:id,name']));
	}
	
	/**
	 * Delete a menu
	 */
	public function destroy($id)
	{
		$menu = Menu::findOrFail($id);
		$slug = $menu->slug;
		
		$menu->delete();
		
		// Clear all related cache entries
		$this->clearMenuCache($id, $slug);
		
		return response()->json(['message' => 'Menu deleted successfully']);
	}
	
	/**
	 * Get a public menu by slug
	 * This is the most performance-critical endpoint as it's used on the frontend
	 */
	public function getPublicMenu($slug)
	{
		// Using the model's caching method instead of controller-level caching
		$menu = Menu::findBySlug($slug, true);
		
		if (!$menu) {
			return response()->json(['error' => 'Menu not found'], 404);
		}
		
		// Return only the necessary data for public use
		return response()->json([
			'id' => $menu->id,
			'name' => $menu->name,
			'items' => $menu->items,
		]);
	}
	
	/**
	 * Clear all menu-related cache
	 */
	private function clearMenusCache()
	{
		Cache::forget(self::CACHE_KEY_ALL_MENUS);
		
		// Clear paginated variants by pattern (not all may exist but this is a safe approach)
		$keys = Cache::get('menu_cache_keys', []);
		foreach ($keys as $key) {
			Cache::forget($key);
		}
		Cache::forget('menu_cache_keys');
	}
	
	/**
	 * Clear cache for a specific menu
	 */
	private function clearMenuCache($id, $oldSlug = null, $newSlug = null)
	{
		// Clear menu by ID
		Cache::forget(self::CACHE_KEY_MENU_PREFIX . $id);
		
		// Clear public menu by old slug
		if ($oldSlug) {
			Cache::forget(self::CACHE_KEY_PUBLIC_MENU_PREFIX . $oldSlug);
		}
		
		// Clear public menu by new slug if it changed
		if ($newSlug && $oldSlug !== $newSlug) {
			Cache::forget(self::CACHE_KEY_PUBLIC_MENU_PREFIX . $newSlug);
		}
		
		// Clear all menus list cache
		$this->clearMenusCache();
	}
}
