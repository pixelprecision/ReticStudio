<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StoreSetting;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CartController extends Controller
{
    /**
     * Get the current user's cart.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCart(Request $request)
    {
        // Check if store is enabled
        if (!StoreSetting::isStoreEnabled()) {
            return response()->json([
                'success' => false,
                'message' => 'Store is currently disabled'
            ], 403);
        }
        
        $userId = Auth::id();
        $sessionId = $request->cookie('cart_session_id', Str::uuid()->toString());
        
        // Find the cart
        $cart = Cart::where(function($query) use ($userId, $sessionId) {
            if ($userId) {
                $query->where('user_id', $userId);
            } else {
                $query->where('session_id', $sessionId);
            }
        })->first();
        
        // Create a new cart if not found
        if (!$cart) {
            $cart = new Cart();
            $cart->user_id = $userId;
            $cart->session_id = $sessionId;
            $cart->save();
        }
        
        // Load cart items
        $cart->load(['cartItems', 'cartItems.product', 'cartItems.productVariant']);
        
        // Calculate totals
        $subtotal = $cart->getSubtotal();
        $totalItems = $cart->getTotalItems();
        
        // Calculate discount if coupon exists
        $discount = 0;
        if ($cart->coupon_code) {
            $coupon = Coupon::where('code', $cart->coupon_code)->first();
            if ($coupon && $coupon->isValid()) {
                $discount = $coupon->calculateDiscount($subtotal, $cart->cartItems->toArray(), $userId);
            } else {
                // Invalid coupon, remove it
                $cart->coupon_code = null;
                $cart->save();
            }
        }
        
        // Set cookie if needed
        $response = response()->json([
            'success' => true,
            'data' => [
                'cart' => $cart,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total' => $subtotal - $discount,
                'total_items' => $totalItems
            ]
        ]);
        
        if (!$userId) {
            $response->cookie('cart_session_id', $sessionId, 60 * 24 * 30); // 30 days
        }
        
        return $response;
    }

    /**
     * Add an item to the cart.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addItem(Request $request)
    {
        // Check if store is enabled
        if (!StoreSetting::isStoreEnabled()) {
            return response()->json([
                'success' => false,
                'message' => 'Store is currently disabled'
            ], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'product_variant_id' => 'nullable|exists:product_variants,id',
            'quantity' => 'required|integer|min:1',
            'options' => 'nullable|array'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $userId = Auth::id();
        $sessionId = $request->cookie('cart_session_id', Str::uuid()->toString());
        
        // Find the cart or create a new one
        $cart = Cart::firstOrCreate([
            'user_id' => $userId,
            'session_id' => $userId ? null : $sessionId
        ]);
        
        // Get the product
        $product = Product::find($request->product_id);
        
        // Check if product is available for purchase
        if (!$product->is_visible || $product->availability !== 'available') {
            return response()->json([
                'success' => false,
                'message' => 'Product is not available for purchase'
            ], 422);
        }
        
        // Get the variant if specified
        $variant = null;
        if ($request->has('product_variant_id')) {
            $variant = ProductVariant::find($request->product_variant_id);
            
            // Check if variant is available for purchase
            if ($variant && (!$variant->is_visible || !$variant->isInStock())) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product variant is not available for purchase'
                ], 422);
            }
        } else {
            // Check if product has required variants
            if ($product->variants()->count() > 0 && $product->variants()->where('is_visible', true)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please select a product variant'
                ], 422);
            }
            
            // Check if product is in stock
            if ($product->track_inventory && $product->inventory_level < $request->quantity) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product is out of stock'
                ], 422);
            }
        }
        
        // Add the item to the cart
        $cartItem = $cart->addItem(
            $product, 
            $request->quantity, 
            $variant, 
            $request->options ?? []
        );
        
        // Reload cart with items and calculate totals
        $cart->load(['cartItems', 'cartItems.product', 'cartItems.productVariant']);
        $subtotal = $cart->getSubtotal();
        $totalItems = $cart->getTotalItems();
        
        // Calculate discount if coupon exists
        $discount = 0;
        if ($cart->coupon_code) {
            $coupon = Coupon::where('code', $cart->coupon_code)->first();
            if ($coupon && $coupon->isValid()) {
                $discount = $coupon->calculateDiscount($subtotal, $cart->cartItems->toArray(), $userId);
            }
        }
        
        $response = response()->json([
            'success' => true,
            'message' => 'Item added to cart',
            'data' => [
                'cart' => $cart,
                'cart_item' => $cartItem,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total' => $subtotal - $discount,
                'total_items' => $totalItems
            ]
        ]);
        
        if (!$userId) {
            $response->cookie('cart_session_id', $sessionId, 60 * 24 * 30); // 30 days
        }
        
        return $response;
    }

    /**
     * Update cart item quantity.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $itemId
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateItemQuantity(Request $request, $itemId)
    {
        // Check if store is enabled
        if (!StoreSetting::isStoreEnabled()) {
            return response()->json([
                'success' => false,
                'message' => 'Store is currently disabled'
            ], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'quantity' => 'required|integer|min:0'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $userId = Auth::id();
        $sessionId = $request->cookie('cart_session_id');
        
        // Find the cart
        $cart = Cart::where(function($query) use ($userId, $sessionId) {
            if ($userId) {
                $query->where('user_id', $userId);
            } else {
                $query->where('session_id', $sessionId);
            }
        })->first();
        
        if (!$cart) {
            return response()->json([
                'success' => false,
                'message' => 'Cart not found'
            ], 404);
        }
        
        // Find the cart item
        $cartItem = $cart->cartItems()->find($itemId);
        
        if (!$cartItem) {
            return response()->json([
                'success' => false,
                'message' => 'Cart item not found'
            ], 404);
        }
        
        // Check inventory if increasing quantity
        if ($request->quantity > $cartItem->quantity) {
            if ($cartItem->product_variant_id) {
                $variant = ProductVariant::find($cartItem->product_variant_id);
                if ($variant && $variant->inventory_management !== 'none' && 
                    $variant->inventory_quantity < $request->quantity) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Not enough inventory available'
                    ], 422);
                }
            } else {
                $product = $cartItem->product;
                if ($product->track_inventory && $product->inventory_level < $request->quantity) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Not enough inventory available'
                    ], 422);
                }
            }
        }
        
        // Update quantity or remove if quantity is 0
        if ($request->quantity > 0) {
            $cartItem->updateQuantity($request->quantity);
        } else {
            $cartItem->delete();
        }
        
        // Reload cart with items and calculate totals
        $cart->load(['cartItems', 'cartItems.product', 'cartItems.productVariant']);
        $subtotal = $cart->getSubtotal();
        $totalItems = $cart->getTotalItems();
        
        // Calculate discount if coupon exists
        $discount = 0;
        if ($cart->coupon_code) {
            $coupon = Coupon::where('code', $cart->coupon_code)->first();
            if ($coupon && $coupon->isValid()) {
                $discount = $coupon->calculateDiscount($subtotal, $cart->cartItems->toArray(), $userId);
            }
        }
        
        return response()->json([
            'success' => true,
            'message' => $request->quantity > 0 ? 'Cart item updated' : 'Cart item removed',
            'data' => [
                'cart' => $cart,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total' => $subtotal - $discount,
                'total_items' => $totalItems
            ]
        ]);
    }

    /**
     * Remove an item from the cart.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $itemId
     * @return \Illuminate\Http\JsonResponse
     */
    public function removeItem(Request $request, $itemId)
    {
        // Check if store is enabled
        if (!StoreSetting::isStoreEnabled()) {
            return response()->json([
                'success' => false,
                'message' => 'Store is currently disabled'
            ], 403);
        }
        
        $userId = Auth::id();
        $sessionId = $request->cookie('cart_session_id');
        
        // Find the cart
        $cart = Cart::where(function($query) use ($userId, $sessionId) {
            if ($userId) {
                $query->where('user_id', $userId);
            } else {
                $query->where('session_id', $sessionId);
            }
        })->first();
        
        if (!$cart) {
            return response()->json([
                'success' => false,
                'message' => 'Cart not found'
            ], 404);
        }
        
        // Find the cart item
        $cartItem = $cart->cartItems()->find($itemId);
        
        if (!$cartItem) {
            return response()->json([
                'success' => false,
                'message' => 'Cart item not found'
            ], 404);
        }
        
        // Delete the cart item
        $cartItem->delete();
        
        // Reload cart with items and calculate totals
        $cart->load(['cartItems', 'cartItems.product', 'cartItems.productVariant']);
        $subtotal = $cart->getSubtotal();
        $totalItems = $cart->getTotalItems();
        
        // Calculate discount if coupon exists
        $discount = 0;
        if ($cart->coupon_code) {
            $coupon = Coupon::where('code', $cart->coupon_code)->first();
            if ($coupon && $coupon->isValid()) {
                $discount = $coupon->calculateDiscount($subtotal, $cart->cartItems->toArray(), $userId);
            }
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Item removed from cart',
            'data' => [
                'cart' => $cart,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total' => $subtotal - $discount,
                'total_items' => $totalItems
            ]
        ]);
    }

    /**
     * Clear the cart.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function clearCart(Request $request)
    {
        // Check if store is enabled
        if (!StoreSetting::isStoreEnabled()) {
            return response()->json([
                'success' => false,
                'message' => 'Store is currently disabled'
            ], 403);
        }
        
        $userId = Auth::id();
        $sessionId = $request->cookie('cart_session_id');
        
        // Find the cart
        $cart = Cart::where(function($query) use ($userId, $sessionId) {
            if ($userId) {
                $query->where('user_id', $userId);
            } else {
                $query->where('session_id', $sessionId);
            }
        })->first();
        
        if (!$cart) {
            return response()->json([
                'success' => false,
                'message' => 'Cart not found'
            ], 404);
        }
        
        // Clear the cart
        $cart->clear();
        
        return response()->json([
            'success' => true,
            'message' => 'Cart cleared',
            'data' => [
                'cart' => $cart,
                'subtotal' => 0,
                'discount' => 0,
                'total' => 0,
                'total_items' => 0
            ]
        ]);
    }

    /**
     * Apply a coupon to the cart.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function applyCoupon(Request $request)
    {
        // Check if store is enabled
        if (!StoreSetting::isStoreEnabled()) {
            return response()->json([
                'success' => false,
                'message' => 'Store is currently disabled'
            ], 403);
        }
        
        // Check if coupons are enabled
        $couponsEnabled = StoreSetting::getValue('enable_coupons', true);
        if (!$couponsEnabled) {
            return response()->json([
                'success' => false,
                'message' => 'Coupons are disabled'
            ], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'coupon_code' => 'required|string|max:50'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $userId = Auth::id();
        $sessionId = $request->cookie('cart_session_id');
        
        // Find the cart
        $cart = Cart::where(function($query) use ($userId, $sessionId) {
            if ($userId) {
                $query->where('user_id', $userId);
            } else {
                $query->where('session_id', $sessionId);
            }
        })->first();
        
        if (!$cart) {
            return response()->json([
                'success' => false,
                'message' => 'Cart not found'
            ], 404);
        }
        
        // Check if cart is empty
        if ($cart->cartItems()->count() === 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot apply coupon to an empty cart'
            ], 422);
        }
        
        // Find the coupon
        $coupon = Coupon::where('code', $request->coupon_code)->first();
        
        if (!$coupon) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid coupon code'
            ], 422);
        }
        
        // Check if coupon is valid
        if (!$coupon->isValid()) {
            return response()->json([
                'success' => false,
                'message' => 'Coupon is expired or no longer valid'
            ], 422);
        }
        
        // Apply the coupon
        $cart->coupon_code = $coupon->code;
        $cart->save();
        
        // Reload cart with items and calculate totals
        $cart->load(['cartItems', 'cartItems.product', 'cartItems.productVariant']);
        $subtotal = $cart->getSubtotal();
        $totalItems = $cart->getTotalItems();
        
        // Calculate discount
        $discount = $coupon->calculateDiscount($subtotal, $cart->cartItems->toArray(), $userId);
        
        // Check if coupon has minimum order amount
        if ($coupon->min_order_amount && $subtotal < $coupon->min_order_amount) {
            return response()->json([
                'success' => false,
                'message' => "This coupon requires a minimum order amount of " . StoreSetting::formatPrice($coupon->min_order_amount)
            ], 422);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Coupon applied successfully',
            'data' => [
                'cart' => $cart,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total' => $subtotal - $discount,
                'total_items' => $totalItems
            ]
        ]);
    }

    /**
     * Remove a coupon from the cart.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function removeCoupon(Request $request)
    {
        // Check if store is enabled
        if (!StoreSetting::isStoreEnabled()) {
            return response()->json([
                'success' => false,
                'message' => 'Store is currently disabled'
            ], 403);
        }
        
        $userId = Auth::id();
        $sessionId = $request->cookie('cart_session_id');
        
        // Find the cart
        $cart = Cart::where(function($query) use ($userId, $sessionId) {
            if ($userId) {
                $query->where('user_id', $userId);
            } else {
                $query->where('session_id', $sessionId);
            }
        })->first();
        
        if (!$cart) {
            return response()->json([
                'success' => false,
                'message' => 'Cart not found'
            ], 404);
        }
        
        // Remove the coupon
        $cart->coupon_code = null;
        $cart->save();
        
        // Reload cart with items and calculate totals
        $cart->load(['cartItems', 'cartItems.product', 'cartItems.productVariant']);
        $subtotal = $cart->getSubtotal();
        $totalItems = $cart->getTotalItems();
        
        return response()->json([
            'success' => true,
            'message' => 'Coupon removed',
            'data' => [
                'cart' => $cart,
                'subtotal' => $subtotal,
                'discount' => 0,
                'total' => $subtotal,
                'total_items' => $totalItems
            ]
        ]);
    }

    /**
     * Update cart notes.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateNotes(Request $request)
    {
        // Check if store is enabled
        if (!StoreSetting::isStoreEnabled()) {
            return response()->json([
                'success' => false,
                'message' => 'Store is currently disabled'
            ], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'notes' => 'nullable|string',
            'gift_message' => 'nullable|string'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $userId = Auth::id();
        $sessionId = $request->cookie('cart_session_id');
        
        // Find the cart
        $cart = Cart::where(function($query) use ($userId, $sessionId) {
            if ($userId) {
                $query->where('user_id', $userId);
            } else {
                $query->where('session_id', $sessionId);
            }
        })->first();
        
        if (!$cart) {
            return response()->json([
                'success' => false,
                'message' => 'Cart not found'
            ], 404);
        }
        
        // Update notes
        if ($request->has('notes')) {
            $cart->notes = $request->notes;
        }
        
        // Update gift message
        if ($request->has('gift_message')) {
            $cart->gift_message = $request->gift_message;
        }
        
        $cart->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Cart notes updated',
            'data' => $cart
        ]);
    }
    
    /**
     * Restore a soft-deleted cart.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function restoreCart($id)
    {
        // Check if store is enabled
        if (!StoreSetting::isStoreEnabled()) {
            return response()->json([
                'success' => false,
                'message' => 'Store is currently disabled'
            ], 403);
        }
        
        $cart = Cart::withTrashed()->find($id);
        
        if (!$cart) {
            return response()->json([
                'success' => false,
                'message' => 'Cart not found'
            ], 404);
        }
        
        if (!$cart->trashed()) {
            return response()->json([
                'success' => false,
                'message' => 'Cart is not deleted'
            ], 422);
        }
        
        try {
            $cart->restore();
            
            return response()->json([
                'success' => true,
                'message' => 'Cart restored successfully',
                'data' => $cart
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while restoring the cart',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Restore a soft-deleted cart item.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function restoreCartItem($id)
    {
        // Check if store is enabled
        if (!StoreSetting::isStoreEnabled()) {
            return response()->json([
                'success' => false,
                'message' => 'Store is currently disabled'
            ], 403);
        }
        
        $cartItem = CartItem::withTrashed()->find($id);
        
        if (!$cartItem) {
            return response()->json([
                'success' => false,
                'message' => 'Cart item not found'
            ], 404);
        }
        
        if (!$cartItem->trashed()) {
            return response()->json([
                'success' => false,
                'message' => 'Cart item is not deleted'
            ], 422);
        }
        
        // Check if the parent cart exists and is not deleted
        $cart = Cart::find($cartItem->cart_id);
        if (!$cart) {
            return response()->json([
                'success' => false,
                'message' => 'Parent cart not found or deleted'
            ], 422);
        }
        
        try {
            $cartItem->restore();
            
            // Reload cart with items and calculate totals
            $cart->load(['cartItems', 'cartItems.product', 'cartItems.productVariant']);
            $subtotal = $cart->getSubtotal();
            $totalItems = $cart->getTotalItems();
            
            // Calculate discount if coupon exists
            $discount = 0;
            if ($cart->coupon_code) {
                $coupon = Coupon::where('code', $cart->coupon_code)->first();
                if ($coupon && $coupon->isValid()) {
                    $discount = $coupon->calculateDiscount($subtotal, $cart->cartItems->toArray(), $cart->user_id);
                }
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Cart item restored successfully',
                'data' => [
                    'cart_item' => $cartItem,
                    'cart' => $cart,
                    'subtotal' => $subtotal,
                    'discount' => $discount,
                    'total' => $subtotal - $discount,
                    'total_items' => $totalItems
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while restoring the cart item',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}