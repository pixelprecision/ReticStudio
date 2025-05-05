<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductBrand;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ProductBrandController extends Controller
{
    /**
     * Display a listing of the brands.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = ProductBrand::query();
        
        // Filter by featured
        if ($request->has('is_featured')) {
            $query->where('is_featured', $request->boolean('is_featured'));
        }
        
        // Search by name
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }
        
        // Sort brands
        $sortField = $request->input('sort_field', 'name');
        $sortDirection = $request->input('sort_direction', 'asc');
        
        // Validate sort field
        $allowedSortFields = ['name', 'created_at', 'sort_order'];
        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'name';
        }
        
        $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        
        // Paginate results
        $perPage = $request->input('per_page', 15);
        $brands = $query->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $brands
        ]);
    }

    /**
     * Store a newly created brand in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:product_brands',
            'description' => 'nullable|string',
            'logo_path' => 'nullable|string',
            'website' => 'nullable|url|max:255',
            'is_featured' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string|max:255'
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
            
            while (ProductBrand::where('slug', $slug)->exists()) {
                $slug = $originalSlug . '-' . $count;
                $count++;
            }
        } else {
            $slug = $request->slug;
        }
        
        try {
            $brand = new ProductBrand();
            $brand->fill($request->all());
            $brand->slug = $slug;
            $brand->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Brand created successfully',
                'data' => $brand
            ], 201);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while creating the brand',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified brand.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $brand = ProductBrand::find($id);
        
        if (!$brand) {
            return response()->json([
                'success' => false,
                'message' => 'Brand not found'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $brand
        ]);
    }

    /**
     * Display the specified brand by slug.
     *
     * @param  string  $slug
     * @return \Illuminate\Http\JsonResponse
     */
    public function showBySlug($slug)
    {
        $brand = ProductBrand::where('slug', $slug)->first();
        
        if (!$brand) {
            return response()->json([
                'success' => false,
                'message' => 'Brand not found'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $brand
        ]);
    }

    /**
     * Update the specified brand in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $brand = ProductBrand::find($id);
        
        if (!$brand) {
            return response()->json([
                'success' => false,
                'message' => 'Brand not found'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'slug' => 'nullable|string|max:255|unique:product_brands,slug,' . $id,
            'description' => 'nullable|string',
            'logo_path' => 'nullable|string',
            'website' => 'nullable|url|max:255',
            'is_featured' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string|max:255'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            $brand->fill($request->all());
            $brand->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Brand updated successfully',
                'data' => $brand
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating the brand',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified brand from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $brand = ProductBrand::find($id);
        
        if (!$brand) {
            return response()->json([
                'success' => false,
                'message' => 'Brand not found'
            ], 404);
        }
        
        // Check if the brand has associated products
        $productsCount = $brand->products()->count();
        
        if ($productsCount > 0) {
            return response()->json([
                'success' => false,
                'message' => "Cannot delete brand as it has {$productsCount} associated products"
            ], 422);
        }
        
        try {
            $brand->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Brand deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while deleting the brand',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get all brands as a simple list (for dropdowns).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getBrandsList()
    {
        $brands = ProductBrand::orderBy('name')
            ->select('id', 'name')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $brands
        ]);
    }
    
    /**
     * Upload a logo for a brand.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function uploadLogo(Request $request, $id)
    {
        $brand = ProductBrand::find($id);
        
        if (!$brand) {
            return response()->json([
                'success' => false,
                'message' => 'Brand not found'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'logo' => 'required|image|max:2048', // 2MB max
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            // Delete old logo if exists
            if ($brand->logo_path && \Storage::disk('public')->exists($brand->logo_path)) {
                \Storage::disk('public')->delete($brand->logo_path);
            }
            
            $path = $request->file('logo')->store('brands', 'public');
            
            $brand->logo_path = $path;
            $brand->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Logo uploaded successfully',
                'data' => [
                    'logo_path' => $path,
                    'logo_url' => \Storage::disk('public')->url($path)
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while uploading the logo',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Restore a soft-deleted brand.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function restore($id)
    {
        $brand = ProductBrand::withTrashed()->find($id);
        
        if (!$brand) {
            return response()->json([
                'success' => false,
                'message' => 'Brand not found'
            ], 404);
        }
        
        if (!$brand->trashed()) {
            return response()->json([
                'success' => false,
                'message' => 'Brand is not deleted'
            ], 422);
        }
        
        try {
            $brand->restore();
            
            return response()->json([
                'success' => true,
                'message' => 'Brand restored successfully',
                'data' => $brand
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while restoring the brand',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}