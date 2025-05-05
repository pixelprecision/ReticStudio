<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StoreSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class StoreSettingController extends Controller
{
    /**
     * Get store settings
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $settings = StoreSetting::first();
        
        if (!$settings) {
            $settings = StoreSetting::create([
                'enable_store' => false,
                'store_name' => config('app.name'),
            ]);
        }
        
        return response()->json([
            'success' => true,
            'data' => $settings
        ]);
    }
    
    /**
     * Update store settings
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'enable_store' => 'boolean',
            'store_name' => 'nullable|string|max:255',
            'store_email' => 'nullable|email|max:255',
            'store_phone' => 'nullable|string|max:20',
            'store_address' => 'nullable|string',
            'store_city' => 'nullable|string|max:100',
            'store_state' => 'nullable|string|max:100',
            'store_postal_code' => 'nullable|string|max:20',
            'store_country' => 'nullable|string|max:100',
            'store_currency' => 'nullable|string|max:10',
            'currency_symbol' => 'nullable|string|max:10',
            'currency_position' => 'nullable|string|in:left,right,left_space,right_space',
            'weight_unit' => 'nullable|string|max:10',
            'dimension_unit' => 'nullable|string|max:10',
            'enable_taxes' => 'boolean',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'enable_shipping' => 'boolean',
            'enable_customer_accounts' => 'boolean',
            'enable_guest_checkout' => 'boolean',
            'enable_reviews' => 'boolean',
            'allow_anonymous_reviews' => 'boolean',
            'require_review_approval' => 'boolean',
            'enable_coupons' => 'boolean',
            'terms_and_conditions' => 'nullable|string',
            'privacy_policy' => 'nullable|string',
            'shipping_policy' => 'nullable|string',
            'return_policy' => 'nullable|string',
            'store_logo' => 'nullable|string',
            'store_favicon' => 'nullable|string',
            'social_media_links' => 'nullable|array',
            'inventory_management' => 'nullable|string|in:track,dont_track',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'out_of_stock_visibility' => 'nullable|string|in:show,hide',
            'out_of_stock_behaviour' => 'nullable|string|in:allow_backorders,prevent_sales',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $settings = StoreSetting::first();
        
        if (!$settings) {
            $settings = new StoreSetting();
        }
        
        $settings->fill($request->all());
        $settings->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Store settings updated successfully',
            'data' => $settings
        ]);
    }
    
    /**
     * Check if store is enabled
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function isStoreEnabled()
    {
        $enabled = StoreSetting::isStoreEnabled();
        
        return response()->json([
            'success' => true,
            'enabled' => $enabled
        ]);
    }
    
    /**
     * Restore a soft-deleted store setting.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function restore($id)
    {
        $setting = StoreSetting::withTrashed()->find($id);
        
        if (!$setting) {
            return response()->json([
                'success' => false,
                'message' => 'Store setting not found'
            ], 404);
        }
        
        if (!$setting->trashed()) {
            return response()->json([
                'success' => false,
                'message' => 'Store setting is not deleted'
            ], 422);
        }
        
        try {
            $setting->restore();
            
            return response()->json([
                'success' => true,
                'message' => 'Store setting restored successfully',
                'data' => $setting
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while restoring the store setting',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}