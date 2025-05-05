<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Cart extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'session_id',
        'coupon_code',
        'shipping_method_id',
        'notes',
        'gift_message',
    ];

    /**
     * Get the user that owns the cart.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the cart items for the cart.
     */
    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    /**
     * Calculate the subtotal for all cart items.
     *
     * @return float
     */
    public function getSubtotal()
    {
        return $this->cartItems->sum(function ($item) {
            return $item->price * $item->quantity;
        });
    }

    /**
     * Calculate the total items in the cart.
     *
     * @return int
     */
    public function getTotalItems()
    {
        return $this->cartItems->sum('quantity');
    }

    /**
     * Apply a coupon to the cart.
     *
     * @param string $code
     * @return bool
     */
    public function applyCoupon($code)
    {
        // Logic to apply a coupon would be implemented here
        $this->coupon_code = $code;
        $this->save();

        return true;
    }

    /**
     * Clear all items from the cart.
     *
     * @return void
     */
    public function clear()
    {
        $this->cartItems()->delete();
    }

    /**
     * Convert the cart to an order.
     *
     * @param array $orderData
     * @return \App\Models\Order
     */
    public function convertToOrder($orderData)
    {
        // Implementation logic to convert cart to order would go here
        // This is a placeholder for the actual implementation
        
        // Create a new order
        $order = Order::create(array_merge([
            'user_id' => $this->user_id,
            'subtotal' => $this->getSubtotal(),
            'coupon_code' => $this->coupon_code,
        ], $orderData));

        // Convert cart items to order items
        foreach ($this->cartItems as $cartItem) {
            $order->orderItems()->create([
                'product_id' => $cartItem->product_id,
                'product_variant_id' => $cartItem->product_variant_id,
                'name' => $cartItem->name,
                'sku' => $cartItem->sku,
                'price' => $cartItem->price,
                'quantity' => $cartItem->quantity,
                'subtotal' => $cartItem->price * $cartItem->quantity,
                'options' => $cartItem->options,
            ]);
        }

        // Clear the cart
        $this->clear();

        return $order;
    }

    /**
     * Add a product to the cart.
     *
     * @param \App\Models\Product $product
     * @param int $quantity
     * @param \App\Models\ProductVariant|null $variant
     * @param array $options
     * @return \App\Models\CartItem
     */
    public function addItem($product, $quantity = 1, $variant = null, $options = [])
    {
        $existingItem = $this->findCartItem($product->id, $variant ? $variant->id : null, $options);

        if ($existingItem) {
            $existingItem->quantity += $quantity;
            $existingItem->save();
            return $existingItem;
        }

        return $this->cartItems()->create([
            'product_id' => $product->id,
            'product_variant_id' => $variant ? $variant->id : null,
            'name' => $product->name,
            'sku' => $variant ? $variant->sku : $product->sku,
            'price' => $variant ? $variant->price : $product->price,
            'quantity' => $quantity,
            'options' => $options,
        ]);
    }

    /**
     * Find a cart item based on product, variant, and options.
     *
     * @param int $productId
     * @param int|null $variantId
     * @param array $options
     * @return \App\Models\CartItem|null
     */
    protected function findCartItem($productId, $variantId = null, $options = [])
    {
        $query = $this->cartItems()
            ->where('product_id', $productId);

        if ($variantId) {
            $query->where('product_variant_id', $variantId);
        } else {
            $query->whereNull('product_variant_id');
        }

        // For simplicity, we'll just check if there's an exact options match
        // A more robust implementation might check the equivalence of options
        $items = $query->get();
        foreach ($items as $item) {
            $itemOptions = $item->options ?? [];
            if (json_encode($itemOptions) === json_encode($options)) {
                return $item;
            }
        }

        return null;
    }
}