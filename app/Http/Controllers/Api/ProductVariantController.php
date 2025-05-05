<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductVariantController extends Controller
{
    /**
     * Display variants for a specific product.
     *
     * @param  int  $productId
     * @return \Illuminate\Http\JsonResponse
     */
    public function index($productId)
    {
        $product = Product::find($productId);
        
        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }
        
        $variants = $product->variants()->orderBy('sort_order')->get();
        
        return response()->json([
            'success' => true,
            'data' => $variants
        ]);
    }

    /**
     * Store a newly created variant in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $productId
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request, $productId)
    {
        $product = Product::find($productId);
        
        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'sku' => 'nullable|string|max:100|unique:product_variants',
            'name' => 'nullable|string|max:255',
            'price' => 'nullable|numeric|min:0',
            'compare_at_price' => 'nullable|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'inventory_quantity' => 'nullable|integer|min:0',
            'inventory_policy' => 'nullable|string|in:deny,continue',
            'inventory_management' => 'nullable|string|in:shopify,none',
            'is_visible' => 'nullable|boolean',
            'barcode' => 'nullable|string|max:100',
            'weight' => 'nullable|numeric|min:0',
            'weight_unit' => 'nullable|string|max:10',
            'length' => 'nullable|numeric|min:0',
            'width' => 'nullable|numeric|min:0',
            'height' => 'nullable|numeric|min:0',
            'dimension_unit' => 'nullable|string|max:10',
            'options' => 'nullable|array'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            $variant = new ProductVariant();
            $variant->product_id = $productId;
            $variant->fill($request->all());
            
            // Set default price from product if not specified
            if (!$request->filled('price')) {
                $variant->price = $product->default_price;
            }
            
            $variant->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Variant created successfully',
                'data' => $variant
            ], 201);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while creating the variant',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified variant.
     *
     * @param  int  $productId
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($productId, $id)
    {
        $product = Product::find($productId);
        
        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }
        
        $variant = $product->variants()->with('images')->find($id);
        
        if (!$variant) {
            return response()->json([
                'success' => false,
                'message' => 'Variant not found'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $variant
        ]);
    }

    /**
     * Update the specified variant in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $productId
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $productId, $id)
    {
        $product = Product::find($productId);
        
        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }
        
        $variant = $product->variants()->find($id);
        
        if (!$variant) {
            return response()->json([
                'success' => false,
                'message' => 'Variant not found'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'sku' => 'nullable|string|max:100|unique:product_variants,sku,' . $id,
            'name' => 'nullable|string|max:255',
            'price' => 'nullable|numeric|min:0',
            'compare_at_price' => 'nullable|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'inventory_quantity' => 'nullable|integer|min:0',
            'inventory_policy' => 'nullable|string|in:deny,continue',
            'inventory_management' => 'nullable|string|in:shopify,none',
            'is_visible' => 'nullable|boolean',
            'barcode' => 'nullable|string|max:100',
            'weight' => 'nullable|numeric|min:0',
            'weight_unit' => 'nullable|string|max:10',
            'length' => 'nullable|numeric|min:0',
            'width' => 'nullable|numeric|min:0',
            'height' => 'nullable|numeric|min:0',
            'dimension_unit' => 'nullable|string|max:10',
            'options' => 'nullable|array'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            $variant->fill($request->all());
            $variant->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Variant updated successfully',
                'data' => $variant
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating the variant',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified variant from storage.
     *
     * @param  int  $productId
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($productId, $id)
    {
        $product = Product::find($productId);
        
        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }
        
        $variant = $product->variants()->find($id);
        
        if (!$variant) {
            return response()->json([
                'success' => false,
                'message' => 'Variant not found'
            ], 404);
        }
        
        try {
            $variant->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Variant deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while deleting the variant',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Update inventory for a variant.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $productId
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateInventory(Request $request, $productId, $id)
    {
        $product = Product::find($productId);
        
        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }
        
        $variant = $product->variants()->find($id);
        
        if (!$variant) {
            return response()->json([
                'success' => false,
                'message' => 'Variant not found'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'inventory_quantity' => 'required|integer|min:0',
            'inventory_policy' => 'nullable|string|in:deny,continue',
            'inventory_management' => 'nullable|string|in:shopify,none'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            $variant->inventory_quantity = $request->inventory_quantity;
            
            if ($request->filled('inventory_policy')) {
                $variant->inventory_policy = $request->inventory_policy;
            }
            
            if ($request->filled('inventory_management')) {
                $variant->inventory_management = $request->inventory_management;
            }
            
            $variant->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Inventory updated successfully',
                'data' => $variant
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating inventory',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}