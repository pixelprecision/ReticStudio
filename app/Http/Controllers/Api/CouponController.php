<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\StoreSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CouponController extends Controller
{
    /**
     * Display a listing of coupons.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = Coupon::query();
        
        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }
        
        // Filter by validity
        if ($request->has('valid_only') && $request->boolean('valid_only')) {
            $query->valid();
        }
        
        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        
        // Search by code
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        
        // Sort coupons
        $sortField = $request->input('sort_field', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        
        // Validate sort field
        $allowedSortFields = ['code', 'created_at', 'expires_at', 'uses_count'];
        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'created_at';
        }
        
        $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        
        // Paginate results
        $perPage = $request->input('per_page', 15);
        $coupons = $query->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $coupons
        ]);
    }

    /**
     * Store a newly created coupon in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:50|unique:coupons',
            'type' => 'required|string|in:fixed,percent,free_shipping,buy_x_get_y',
            'value' => 'required_if:type,fixed,percent|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'is_percent' => 'required_if:type,percent|boolean',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:starts_at',
            'is_active' => 'nullable|boolean',
            'applies_to' => 'nullable|string|in:entire_order,specific_products,specific_categories',
            'excluded_products' => 'nullable|array',
            'excluded_categories' => 'nullable|array',
            'included_products' => 'nullable|array',
            'included_categories' => 'nullable|array',
            'customer_eligibility' => 'nullable|string|in:all,specific',
            'eligible_customers' => 'nullable|array',
            'description' => 'nullable|string'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            $coupon = new Coupon();
            $coupon->fill($request->all());
            
            // Uppercase the code
            $coupon->code = strtoupper($request->code);
            
            // Set default values if not provided
            $coupon->uses_count = 0;
            $coupon->is_active = $request->boolean('is_active', true);
            
            if ($request->type === 'percent') {
                $coupon->is_percent = true;
                
                // Ensure percent value is between 0 and 100
                if ($request->value > 100) {
                    $coupon->value = 100;
                }
            } else {
                $coupon->is_percent = false;
            }
            
            $coupon->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Coupon created successfully',
                'data' => $coupon
            ], 201);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while creating the coupon',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified coupon.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $coupon = Coupon::find($id);
        
        if (!$coupon) {
            return response()->json([
                'success' => false,
                'message' => 'Coupon not found'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $coupon
        ]);
    }

    /**
     * Display the specified coupon by code.
     *
     * @param  string  $code
     * @return \Illuminate\Http\JsonResponse
     */
    public function showByCode($code)
    {
        $coupon = Coupon::where('code', strtoupper($code))->first();
        
        if (!$coupon) {
            return response()->json([
                'success' => false,
                'message' => 'Coupon not found'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $coupon
        ]);
    }

    /**
     * Update the specified coupon in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $coupon = Coupon::find($id);
        
        if (!$coupon) {
            return response()->json([
                'success' => false,
                'message' => 'Coupon not found'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'code' => 'nullable|string|max:50|unique:coupons,code,' . $id,
            'type' => 'nullable|string|in:fixed,percent,free_shipping,buy_x_get_y',
            'value' => 'nullable|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'uses_count' => 'nullable|integer|min:0',
            'is_percent' => 'nullable|boolean',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:starts_at',
            'is_active' => 'nullable|boolean',
            'applies_to' => 'nullable|string|in:entire_order,specific_products,specific_categories',
            'excluded_products' => 'nullable|array',
            'excluded_categories' => 'nullable|array',
            'included_products' => 'nullable|array',
            'included_categories' => 'nullable|array',
            'customer_eligibility' => 'nullable|string|in:all,specific',
            'eligible_customers' => 'nullable|array',
            'description' => 'nullable|string'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            $coupon->fill($request->all());
            
            // Uppercase the code if provided
            if ($request->filled('code')) {
                $coupon->code = strtoupper($request->code);
            }
            
            // Handle percent type
            if ($request->filled('type') && $request->type === 'percent') {
                $coupon->is_percent = true;
                
                // Ensure percent value is between 0 and 100
                if ($request->filled('value') && $request->value > 100) {
                    $coupon->value = 100;
                }
            } elseif ($request->filled('type')) {
                $coupon->is_percent = false;
            }
            
            $coupon->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Coupon updated successfully',
                'data' => $coupon
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating the coupon',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified coupon from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $coupon = Coupon::find($id);
        
        if (!$coupon) {
            return response()->json([
                'success' => false,
                'message' => 'Coupon not found'
            ], 404);
        }
        
        try {
            $coupon->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Coupon deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while deleting the coupon',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Validate a coupon code.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function validate(Request $request)
    {
        // Check if coupons are enabled
        $couponsEnabled = StoreSetting::getValue('enable_coupons', true);
        if (!$couponsEnabled) {
            return response()->json([
                'success' => false,
                'message' => 'Coupons are disabled'
            ], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:50',
            'subtotal' => 'nullable|numeric|min:0'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $coupon = Coupon::where('code', strtoupper($request->code))->first();
        
        if (!$coupon) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid coupon code'
            ], 404);
        }
        
        $isValid = $coupon->isValid();
        
        // Check minimum order amount if provided
        $meetsMinimum = true;
        if ($isValid && $coupon->min_order_amount && $request->has('subtotal')) {
            $meetsMinimum = $request->subtotal >= $coupon->min_order_amount;
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'coupon' => $coupon,
                'is_valid' => $isValid,
                'meets_minimum' => $meetsMinimum,
                'discount_type' => $coupon->type,
                'discount_value' => $coupon->value,
                'is_percent' => $coupon->is_percent,
                'minimum_order_amount' => $coupon->min_order_amount,
                'expires_at' => $coupon->expires_at
            ]
        ]);
    }

    /**
     * Generate a random coupon code.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function generateCode(Request $request)
    {
        $length = $request->input('length', 8);
        $prefix = $request->input('prefix', '');
        
        // Ensure length is at least 4 characters
        $length = max(4, min($length, 20));
        
        // Generate a random code
        $code = $prefix . strtoupper(Str::random($length));
        
        // Ensure the code is unique
        while (Coupon::where('code', $code)->exists()) {
            $code = $prefix . strtoupper(Str::random($length));
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'code' => $code
            ]
        ]);
    }
    
    /**
     * Restore a soft-deleted coupon.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function restore($id)
    {
        $coupon = Coupon::withTrashed()->find($id);
        
        if (!$coupon) {
            return response()->json([
                'success' => false,
                'message' => 'Coupon not found'
            ], 404);
        }
        
        if (!$coupon->trashed()) {
            return response()->json([
                'success' => false,
                'message' => 'Coupon is not deleted'
            ], 422);
        }
        
        try {
            $coupon->restore();
            
            return response()->json([
                'success' => true,
                'message' => 'Coupon restored successfully',
                'data' => $coupon
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while restoring the coupon',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}