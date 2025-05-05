<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ProductCategoryController extends Controller
{
    /**
     * Display a listing of the categories.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = ProductCategory::query();
        
        // Filter by parent
        if ($request->has('parent_id')) {
            if ($request->parent_id === 'null') {
                $query->whereNull('parent_id');
            } else {
                $query->where('parent_id', $request->parent_id);
            }
        }
        
        // Filter by visibility
        if ($request->has('is_visible')) {
            $query->where('is_visible', $request->boolean('is_visible'));
        }
        
        // Filter by featured
        if ($request->has('is_featured')) {
            $query->where('is_featured', $request->boolean('is_featured'));
        }
        
        // Search by name
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }
        
        // Sort categories
        $sortField = $request->input('sort_field', 'sort_order');
        $sortDirection = $request->input('sort_direction', 'asc');
        
        // Validate sort field
        $allowedSortFields = ['name', 'created_at', 'sort_order'];
        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'sort_order';
        }
        
        $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        
        // Paginate results
        $perPage = $request->input('per_page', 15);
        $categories = $query->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    /**
     * Get a hierarchical tree of categories.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getTree(Request $request)
    {
        $onlyVisible = $request->input('only_visible', true);
        
        $rootCategories = ProductCategory::whereNull('parent_id')
            ->when($onlyVisible, function($query) {
                return $query->where('is_visible', true);
            })
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();
        
        $tree = [];
        
        foreach ($rootCategories as $category) {
            $tree[] = $this->buildCategoryTree($category, $onlyVisible);
        }
        
        return response()->json([
            'success' => true,
            'data' => $tree
        ]);
    }
    
    /**
     * Build a hierarchical category tree.
     *
     * @param  \App\Models\ProductCategory  $category
     * @param  bool  $onlyVisible
     * @return array
     */
    private function buildCategoryTree(ProductCategory $category, $onlyVisible = true)
    {
        $children = ProductCategory::where('parent_id', $category->id)
            ->when($onlyVisible, function($query) {
                return $query->where('is_visible', true);
            })
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();
        
        $node = [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'image' => $category->image_path,
            'is_visible' => $category->is_visible,
            'is_featured' => $category->is_featured,
            'sort_order' => $category->sort_order,
            'children' => []
        ];
        
        foreach ($children as $child) {
            $node['children'][] = $this->buildCategoryTree($child, $onlyVisible);
        }
        
        return $node;
    }

    /**
     * Store a newly created category in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:product_categories',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:product_categories,id',
            'image_path' => 'nullable|string',
            'template_layout' => 'nullable|string|max:100',
            'sort_order' => 'nullable|integer',
            'default_product_sort' => 'nullable|string|max:100',
            'is_visible' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_keywords' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Auto-generate slug if not provided
        if (!$request->filled('slug')) {
            $slug = Str::slug($request->name);
            $originalSlug = $slug;
            $count = 1;
            
            while (ProductCategory::where('slug', $slug)->exists()) {
                $slug = $originalSlug . '-' . $count;
                $count++;
            }
        } else {
            $slug = $request->slug;
        }
        
        try {
            $category = new ProductCategory();
            $category->fill($request->all());
            $category->slug = $slug;
            $category->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Category created successfully',
                'data' => $category
            ], 201);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while creating the category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified category.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $category = ProductCategory::with('parent')->find($id);
        
        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $category
        ]);
    }

    /**
     * Display the specified category by slug.
     *
     * @param  string  $slug
     * @return \Illuminate\Http\JsonResponse
     */
    public function showBySlug($slug)
    {
        $category = ProductCategory::with('parent')->where('slug', $slug)->first();
        
        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $category
        ]);
    }

    /**
     * Update the specified category in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $category = ProductCategory::find($id);
        
        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'slug' => 'nullable|string|max:255|unique:product_categories,slug,' . $id,
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:product_categories,id',
            'image_path' => 'nullable|string',
            'template_layout' => 'nullable|string|max:100',
            'sort_order' => 'nullable|integer',
            'default_product_sort' => 'nullable|string|max:100',
            'is_visible' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_keywords' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Prevent setting itself as parent
        if ($request->filled('parent_id') && $request->parent_id == $id) {
            return response()->json([
                'success' => false,
                'message' => 'Category cannot be its own parent'
            ], 422);
        }
        
        // Prevent circular references
        if ($request->filled('parent_id')) {
            $parentId = $request->parent_id;
            $temp = ProductCategory::find($parentId);
            
            while ($temp && $temp->parent_id) {
                if ($temp->parent_id == $id) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Circular reference detected. Cannot set a descendant as parent.'
                    ], 422);
                }
                $temp = $temp->parent;
            }
        }
        
        try {
            $category->fill($request->all());
            $category->save();
            
            // Reload category with parent
            $category = ProductCategory::with('parent')->find($id);
            
            return response()->json([
                'success' => true,
                'message' => 'Category updated successfully',
                'data' => $category
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating the category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified category from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $category = ProductCategory::find($id);
        
        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found'
            ], 404);
        }
        
        // Check if the category has child categories
        $childrenCount = ProductCategory::where('parent_id', $id)->count();
        
        if ($childrenCount > 0) {
            return response()->json([
                'success' => false,
                'message' => "Cannot delete category as it has {$childrenCount} child categories"
            ], 422);
        }
        
        // Check if there are products in this category
        $productsCount = $category->products()->count();
        
        if ($productsCount > 0) {
            return response()->json([
                'success' => false,
                'message' => "Cannot delete category as it contains {$productsCount} products"
            ], 422);
        }
        
        try {
            $category->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Category deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while deleting the category',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get all categories as a simple list (for dropdowns).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCategoriesList()
    {
        $categories = ProductCategory::orderBy('name')
            ->select('id', 'name', 'parent_id')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }
    
    /**
     * Upload an image for a category.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function uploadImage(Request $request, $id)
    {
        $category = ProductCategory::find($id);
        
        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|max:2048', // 2MB max
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            // Delete old image if exists
            if ($category->image_path && \Storage::disk('public')->exists($category->image_path)) {
                \Storage::disk('public')->delete($category->image_path);
            }
            
            $path = $request->file('image')->store('categories', 'public');
            
            $category->image_path = $path;
            $category->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Image uploaded successfully',
                'data' => [
                    'image_path' => $path,
                    'image_url' => \Storage::disk('public')->url($path)
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while uploading the image',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Restore a soft-deleted category.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function restore($id)
    {
        $category = ProductCategory::withTrashed()->find($id);
        
        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found'
            ], 404);
        }
        
        if (!$category->trashed()) {
            return response()->json([
                'success' => false,
                'message' => 'Category is not deleted'
            ], 422);
        }
        
        try {
            $category->restore();
            
            return response()->json([
                'success' => true,
                'message' => 'Category restored successfully',
                'data' => $category
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while restoring the category',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get subcategories for a specific category.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSubcategories($id)
    {
        $category = ProductCategory::find($id);
        
        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found'
            ], 404);
        }
        
        $subcategories = ProductCategory::where('parent_id', $id)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $subcategories
        ]);
    }
    
    /**
     * Get subcategories for a specific category by slug.
     *
     * @param  string  $slug
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSubcategoriesBySlug($slug)
    {
        $category = ProductCategory::where('slug', $slug)->first();
        
        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found'
            ], 404);
        }
        
        $subcategories = ProductCategory::where('parent_id', $category->id)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $subcategories
        ]);
    }
}