<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductSpecification;
use App\Models\ProductCategory;
use App\Models\ProductBrand;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Display a listing of the products.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = Product::with(['brand', 'categories', 'images' => function($query) {
	        $query->where('is_featured', true)->orWhere('sort_order', 0);
        }]);
		
        
        // Filter by brand
        if ($request->has('brand_id') && !empty($request->brand_id)) {
            $query->where('brand_id', $request->brand_id);
        }
        
        // Filter by category
        if ($request->has('category_id') && !empty($request->category_id)) {
            $query->whereHas('categories', function($q) use ($request) {
                $q->where('product_categories.id', $request->category_id);
            });
        }
        
        // Filter by visibility
        if ($request->has('is_visible') && !empty($request->is_visible)) {
            $query->where('is_visible', $request->boolean('is_visible'));
        } else {
            // By default, only show visible products in the API
            $query->where('is_visible', true);
        }
        
        // Filter by featured
        if ($request->has('is_featured') && !empty($request->is_featured)) {
            $query->where('is_featured', $request->boolean('is_featured'));
        }
        
        // Filter by stock status
        if ($request->has('stock_status') && !empty($request->stock_status)) {
            $query->where('stock_status', $request->stock_status);
        }
        
        // Filter by price range
        if ($request->has('min_price') && !empty($request->min_price)) {
            $query->where('default_price', '>=', $request->min_price);
        }
        
        if ($request->has('max_price') && !empty($request->max_price)) {
            $query->where('default_price', '<=', $request->max_price);
        }
        
        // Search by keywords
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('search_keywords', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }
        
        // Sort products
        $sortField = $request->input('sort_field', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        
        // Validate sort field
        $allowedSortFields = ['name', 'default_price', 'created_at', 'sort_order'];
        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'created_at';
        }
        
        $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
		
        // Paginate results
        $perPage = $request->input('per_page', 15);
        $products = $query->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }

    /**
     * Store a newly created product in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:products',
            'description' => 'nullable|string',
            'brand_id' => 'nullable|exists:product_brands,id',
            'product_type' => 'nullable|in:physical,digital',
            'sku' => 'nullable|string|max:100|unique:products',
            'barcode' => 'nullable|string|max:100',
            'default_price' => 'required|numeric|min:0',
            'cost' => 'nullable|numeric|min:0',
            'msrp' => 'nullable|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'weight' => 'nullable|numeric|min:0',
            'width' => 'nullable|numeric|min:0',
            'height' => 'nullable|numeric|min:0',
            'depth' => 'nullable|numeric|min:0',
            'free_shipping' => 'nullable|boolean',
            'fixed_shipping_price' => 'nullable|numeric|min:0',
            'origin_location' => 'nullable|string|max:255',
            'dimension_rules' => 'nullable|json',
            'availability' => 'nullable|in:available,preorder,unavailable',
            'stock_status' => 'nullable|in:in_stock,out_of_stock,coming_soon',
            'bin_picking_number' => 'nullable|string|max:100',
            'warranty_information' => 'nullable|string',
            'template_page' => 'nullable|string|max:100',
            'search_keywords' => 'nullable|string',
            'is_visible' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
            'gift_wrapping' => 'nullable|in:all,none,specific',
            'sort_order' => 'nullable|integer',
            'condition' => 'nullable|in:new,used,refurbished',
            'min_purchase_qty' => 'nullable|integer|min:1',
            'max_purchase_qty' => 'nullable|integer|min:1',
            'seo_object_type' => 'nullable|in:product,album,book,drink,food,game,movie,song,tv_show,video',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string',
            'seo_image' => 'nullable|string|max:255',
            'track_inventory' => 'nullable|boolean',
            'inventory_level' => 'nullable|integer|min:0',
            'inventory_warning_level' => 'nullable|integer|min:0',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:product_categories,id',
            'specifications' => 'nullable|array',
            'specifications.*.name' => 'required|string|max:255',
            'specifications.*.value' => 'required|string',
            'specifications.*.group' => 'nullable|string|max:100',
            'primary_category_id' => 'nullable|exists:product_categories,id'
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
            
            while (Product::where('slug', $slug)->exists()) {
                $slug = $originalSlug . '-' . $count;
                $count++;
            }
        } else {
            $slug = $request->slug;
        }

        DB::beginTransaction();
        
        try {
            $product = new Product();
            $product->fill($request->except('categories', 'specifications', 'primary_category_id'));
            $product->slug = $slug;
            $product->save();
            
            // Sync categories
            if ($request->has('categories')) {
                $categorySync = [];
                foreach ($request->categories as $categoryId) {
                    $isPrimary = ($request->primary_category_id == $categoryId);
                    $categorySync[$categoryId] = ['is_primary' => $isPrimary, 'sort_order' => 0];
                }
                $product->categories()->sync($categorySync);
            }
            
            // Add specifications
            if ($request->has('specifications')) {
                foreach ($request->specifications as $index => $specification) {
                    $product->specifications()->create([
                        'name' => $specification['name'],
                        'value' => $specification['value'],
                        'group' => $specification['group'] ?? null,
                        'sort_order' => $index
                    ]);
                }
            }
            
            DB::commit();
            
            // Reload the product with relationships
            $product = Product::with(['brand', 'categories', 'specifications'])->find($product->id);
            
            return response()->json([
                'success' => true,
                'message' => 'Product created successfully',
                'data' => $product
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while creating the product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified product.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $product = Product::with([
            'brand',
            'categories',
            'images.media', // Eagerly load the media relationship for images
            'specifications',
            'variants',
            'videos'
        ])->find($id);
        
        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $product
        ]);
    }

    /**
     * Display the specified product by slug.
     *
     * @param  string  $slug
     * @return \Illuminate\Http\JsonResponse
     */
    public function showBySlug($slug)
    {
        $product = Product::with([
            'brand',
            'categories',
            'images.media', // Eagerly load the media relationship for images
            'specifications',
            'variants',
            'videos'
        ])->where('slug', $slug)->first();
        
        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $product
        ]);
    }

    /**
     * Update the specified product in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $product = Product::find($id);
        
        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'slug' => 'nullable|string|max:255|unique:products,slug,' . $id,
            'description' => 'nullable|string',
            'brand_id' => 'nullable|exists:product_brands,id',
            'product_type' => 'nullable|in:physical,digital',
            'sku' => 'nullable|string|max:100|unique:products,sku,' . $id,
            'barcode' => 'nullable|string|max:100',
            'default_price' => 'nullable|numeric|min:0',
            'cost' => 'nullable|numeric|min:0',
            'msrp' => 'nullable|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'weight' => 'nullable|numeric|min:0',
            'width' => 'nullable|numeric|min:0',
            'height' => 'nullable|numeric|min:0',
            'depth' => 'nullable|numeric|min:0',
            'free_shipping' => 'nullable|boolean',
            'fixed_shipping_price' => 'nullable|numeric|min:0',
            'origin_location' => 'nullable|string|max:255',
            'dimension_rules' => 'nullable|json',
            'availability' => 'nullable|in:available,preorder,unavailable',
            'stock_status' => 'nullable|in:in_stock,out_of_stock,coming_soon',
            'bin_picking_number' => 'nullable|string|max:100',
            'warranty_information' => 'nullable|string',
            'template_page' => 'nullable|string|max:100',
            'search_keywords' => 'nullable|string',
            'is_visible' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
            'gift_wrapping' => 'nullable|in:all,none,specific',
            'sort_order' => 'nullable|integer',
            'condition' => 'nullable|in:new,used,refurbished',
            'min_purchase_qty' => 'nullable|integer|min:1',
            'max_purchase_qty' => 'nullable|integer|min:1',
            'seo_object_type' => 'nullable|in:product,album,book,drink,food,game,movie,song,tv_show,video',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string',
            'seo_image' => 'nullable|string|max:255',
            'track_inventory' => 'nullable|boolean',
            'inventory_level' => 'nullable|integer|min:0',
            'inventory_warning_level' => 'nullable|integer|min:0',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:product_categories,id',
            'specifications' => 'nullable|array',
            'specifications.*.id' => 'nullable|exists:product_specifications,id',
            'specifications.*.name' => 'required|string|max:255',
            'specifications.*.value' => 'required|string',
            'specifications.*.group' => 'nullable|string|max:100',
            'primary_category_id' => 'nullable|exists:product_categories,id',
            'images' => 'nullable|array',
            'images.*.id' => 'nullable|exists:product_images,id',
            'images.*.image_id' => 'nullable|exists:media,id',
            'images.*.is_featured' => 'nullable|boolean',
            'images.*.sort_order' => 'nullable|integer|min:0',
            'images.*.alt_text' => 'nullable|string|max:255',
            'images.*.url' => 'nullable|string',
            'images.*.thumbnail_url' => 'nullable|string'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        DB::beginTransaction();
        
        try {
            $product->fill($request->except('categories', 'specifications', 'images', 'primary_category_id'));
            $product->save();
            
            // Sync categories
            if ($request->has('categories')) {
                $categorySync = [];
                foreach ($request->categories as $categoryId) {
                    $isPrimary = ($request->primary_category_id == $categoryId);
                    $categorySync[$categoryId] = ['is_primary' => $isPrimary, 'sort_order' => 0];
                }
                $product->categories()->sync($categorySync);
            }
            
            // Update specifications
            if ($request->has('specifications')) {
                // Get existing specification IDs
                $existingSpecIds = $product->specifications->pluck('id')->toArray();
                $updatedSpecIds = [];
                
                foreach ($request->specifications as $index => $specification) {
                    if (isset($specification['id']) && in_array($specification['id'], $existingSpecIds)) {
                        // Update existing specification
                        $spec = ProductSpecification::find($specification['id']);
                        $spec->update([
                            'name' => $specification['name'],
                            'value' => $specification['value'],
                            'group' => $specification['group'] ?? null,
                            'sort_order' => $index
                        ]);
                        $updatedSpecIds[] = $spec->id;
                    } else {
                        // Create new specification
                        $spec = $product->specifications()->create([
                            'name' => $specification['name'],
                            'value' => $specification['value'],
                            'group' => $specification['group'] ?? null,
                            'sort_order' => $index
                        ]);
                        $updatedSpecIds[] = $spec->id;
                    }
                }
                
                // Delete specifications that weren't updated
                $product->specifications()->whereNotIn('id', $updatedSpecIds)->delete();
            }
            
            // Update product images
            if ($request->has('images')) {
                // Get existing image IDs
                $existingImageIds = $product->images->pluck('id')->toArray();
                $updatedImageIds = [];
                
                foreach ($request->images as $index => $imageData) {
                    if (isset($imageData['id']) && in_array($imageData['id'], $existingImageIds)) {
                        // Update existing image
                        $image = ProductImage::find($imageData['id']);
                        
                        // Handle featured status - if we're setting an image as featured, unset others
                        if (isset($imageData['is_featured']) && $imageData['is_featured']) {
                            // Reset featured status on all other images
                            ProductImage::where('product_id', $product->id)
                                ->where('id', '!=', $image->id)
                                ->update(['is_featured' => false]);
                        }
                        
                        // Update the image with fields from the request
                        $image->update([
                            'image_id' => $imageData['image_id'] ?? $image->image_id,
                            'is_featured' => $imageData['is_featured'] ?? $image->is_featured,
                            'sort_order' => $imageData['sort_order'] ?? $index,
                            'alt_text' => $imageData['alt_text'] ?? $image->alt_text,
                            'url' => $imageData['url'] ?? $image->url,
                            'thumbnail_url' => $imageData['thumbnail_url'] ?? $image->thumbnail_url
                        ]);
                        
                        $updatedImageIds[] = $image->id;
                    } else {
                        // Create new image if it doesn't exist
                        if (isset($imageData['image_id'])) {
                            // If creating a new image as featured, reset others
                            if (isset($imageData['is_featured']) && $imageData['is_featured']) {
                                ProductImage::where('product_id', $product->id)
                                    ->update(['is_featured' => false]);
                            }
                            
                            $media = \Spatie\MediaLibrary\MediaCollections\Models\Media::find($imageData['image_id']);
                            
                            if ($media) {
                                $image = new ProductImage([
                                    'image_id' => $imageData['image_id'],
                                    'is_featured' => $imageData['is_featured'] ?? false,
                                    'sort_order' => $imageData['sort_order'] ?? $index,
                                    'alt_text' => $imageData['alt_text'] ?? null,
                                    'url' => $imageData['url'] ?? null,
                                    'thumbnail_url' => $imageData['thumbnail_url'] ?? null
                                ]);
                                
                                $product->images()->save($image);
                                $updatedImageIds[] = $image->id;
                            }
                        }
                    }
                }
                
                // Optionally, remove images that weren't included in the update
                // Uncomment if you want to delete images that weren't included in the request
                // $product->images()->whereNotIn('id', $updatedImageIds)->delete();
            }
            
            DB::commit();
            
            // Reload the product with relationships
            $product = Product::with(['brand', 'categories', 'specifications', 'images', 'variants'])->find($product->id);
            
            return response()->json([
                'success' => true,
                'message' => 'Product updated successfully',
                'data' => $product
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating the product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified product from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $product = Product::find($id);
        
        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }
        
        try {
            $product->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Product deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while deleting the product',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Upload an image for a specific product.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function uploadImage(Request $request, $id)
    {
        $product = Product::find($id);
        
        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|max:5120', // 5MB max
            'alt_text' => 'nullable|string|max:255',
            'is_primary' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            // If this is set as primary image, reset other primary images
            if ($request->boolean('is_primary', false)) {
                $product->images()->update(['is_primary' => false]);
            }
            
            // Add the image to the media library
            $media = $product->addMedia($request->file('image'))
                ->withCustomProperties(['alt_text' => $request->alt_text ?? ''])
                ->toMediaCollection('product_images');
            
            // Create the product image record
            $image = new ProductImage([
                'image_id' => $media->id,
                'alt_text' => $request->alt_text,
                'is_primary' => $request->boolean('is_primary', false),
                'sort_order' => $request->input('sort_order', 0)
            ]);
            
            $product->images()->save($image);
            
            // Add image URL to response data
            $imageData = $image->toArray();
            $imageData['url'] = $media->getUrl();
            
            return response()->json([
                'success' => true,
                'message' => 'Product image uploaded successfully',
                'data' => $imageData
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
     * Get all product images for a specific product.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getImages($id)
    {
        $product = Product::find($id);
        
        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }
        
        $images = $product->images()->with('media')->orderBy('sort_order')->get();
        
        // Transform the data to include URLs
        $imagesData = $images->map(function($image) {
            $data = $image->toArray();
            // Add image URL
            $data['url'] = $image->image_url;
            return $data;
        });
        
        return response()->json([
            'success' => true,
            'data' => $imagesData
        ]);
    }
    
    /**
     * Delete a specific product image.
     *
     * @param  int  $id
     * @param  int  $imageId
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteImage($id, $imageId)
    {
        $product = Product::find($id);
        
        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }
        
        $image = $product->images()->find($imageId);
        
        if (!$image) {
            return response()->json([
                'success' => false,
                'message' => 'Image not found'
            ], 404);
        }
        
        try {
            // Delete the media file if it exists
            if ($image->image_id && $image->media) {
                $image->media->delete();
            }
            // For backward compatibility, check for path as well
            else if ($image->path && \Storage::disk('public')->exists($image->path)) {
                \Storage::disk('public')->delete($image->path);
            }
            
            $image->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Image deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while deleting the image',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Search products by keyword.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function search(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'query' => 'required|string|min:2',
            'limit' => 'nullable|integer|min:1|max:50',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $query = $request->input('query');
        $limit = $request->input('limit', 10);
        
        $products = Product::with(['brand', 'categories', 'images' => function($q) {
                $q->where('is_primary', true)->orWhere('sort_order', 0);
            }])
            ->where('is_visible', true)
            ->where(function($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('description', 'like', "%{$query}%")
                  ->orWhere('search_keywords', 'like', "%{$query}%")
                  ->orWhere('sku', 'like', "%{$query}%");
            })
            ->orderBy('name')
            ->limit($limit)
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }
    
    /**
     * Get related products for a specific product.
     *
     * @param  int  $id
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getRelatedProducts($id, Request $request)
    {
        $product = Product::find($id);
        
        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }
        
        $limit = $request->input('limit', 5);
        
        // Get related products from the same categories
        $categoryIds = $product->categories->pluck('id')->toArray();
        
        $relatedProducts = Product::with(['brand', 'categories', 'images' => function($q) {
                $q->where('is_primary', true)->orWhere('sort_order', 0);
            }])
            ->where('id', '!=', $product->id)
            ->where('is_visible', true)
            ->whereHas('categories', function($q) use ($categoryIds) {
                $q->whereIn('product_categories.id', $categoryIds);
            })
            ->limit($limit)
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $relatedProducts
        ]);
    }
    
    /**
     * Restore a soft-deleted product image.
     *
     * @param  int  $productId
     * @param  int  $imageId
     * @return \Illuminate\Http\JsonResponse
     */
    public function restoreImage($productId, $imageId)
    {
        $product = Product::find($productId);
        
        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }
        
        $image = ProductImage::withTrashed()
            ->where('id', $imageId)
            ->where('product_id', $productId)
            ->first();
        
        if (!$image) {
            return response()->json([
                'success' => false,
                'message' => 'Product image not found'
            ], 404);
        }
        
        if (!$image->trashed()) {
            return response()->json([
                'success' => false,
                'message' => 'Product image is not deleted'
            ], 422);
        }
        
        try {
            $image->restore();
            
            return response()->json([
                'success' => true,
                'message' => 'Product image restored successfully',
                'data' => $image
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while restoring the product image',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Restore a soft-deleted product video.
     *
     * @param  int  $productId
     * @param  int  $videoId
     * @return \Illuminate\Http\JsonResponse
     */
    public function restoreVideo($productId, $videoId)
    {
        $product = Product::find($productId);
        
        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }
        
        $video = ProductVideo::withTrashed()
            ->where('id', $videoId)
            ->where('product_id', $productId)
            ->first();
        
        if (!$video) {
            return response()->json([
                'success' => false,
                'message' => 'Product video not found'
            ], 404);
        }
        
        if (!$video->trashed()) {
            return response()->json([
                'success' => false,
                'message' => 'Product video is not deleted'
            ], 422);
        }
        
        try {
            $video->restore();
            
            return response()->json([
                'success' => true,
                'message' => 'Product video restored successfully',
                'data' => $video
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while restoring the product video',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Restore a soft-deleted product specification.
     *
     * @param  int  $productId
     * @param  int  $specId
     * @return \Illuminate\Http\JsonResponse
     */
    public function restoreSpecification($productId, $specId)
    {
        $product = Product::find($productId);
        
        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }
        
        $specification = ProductSpecification::withTrashed()
            ->where('id', $specId)
            ->where('product_id', $productId)
            ->first();
        
        if (!$specification) {
            return response()->json([
                'success' => false,
                'message' => 'Product specification not found'
            ], 404);
        }
        
        if (!$specification->trashed()) {
            return response()->json([
                'success' => false,
                'message' => 'Product specification is not deleted'
            ], 422);
        }
        
        try {
            $specification->restore();
            
            return response()->json([
                'success' => true,
                'message' => 'Product specification restored successfully',
                'data' => $specification
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while restoring the product specification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Associate an existing media item with a product.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function attachMedia(Request $request, $id)
    {
        $product = Product::find($id);
        
        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'media_id' => 'required|exists:media,id',
            'alt_text' => 'nullable|string|max:255',
            'is_featured' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            $mediaId = $request->input('media_id');
            $media = \Spatie\MediaLibrary\MediaCollections\Models\Media::find($mediaId);
            
            if (!$media) {
                return response()->json([
                    'success' => false,
                    'message' => 'Media not found'
                ], 404);
            }
            
            // If this is set as primary image, reset other primary images
            if ($request->boolean('is_primary', false)) {
                $product->images()->update(['is_primary' => false]);
            }
            
            // Create the product image record
            $image = new ProductImage([
                'image_id' => $mediaId,
				'url' => $request->input('url'),
				'thumbnail_url' => $request->input('thumbnail_url'),
                'alt_text' => $request->input('alt_text'),
                'is_featured' => $request->boolean('is_primary', false),
                'sort_order' => $request->input('sort_order', 0)
            ]);
            
            $product->images()->save($image);
            
            // Add image URL to response data
            $imageData = $image->toArray();
            $imageData['url'] = $media->getUrl();
            
            return response()->json([
                'success' => true,
                'message' => 'Media attached to product successfully',
                'data' => $imageData
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while attaching media to the product',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
