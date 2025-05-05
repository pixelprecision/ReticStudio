<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CartItem extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'cart_id',
        'product_id',
        'product_variant_id',
        'name',
        'sku',
        'price',
        'quantity',
        'options',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'decimal:2',
        'quantity' => 'integer',
        'options' => 'json',
    ];

    /**
     * Get the cart that owns the item.
     */
    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }

    /**
     * Get the product that is in the cart.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the product variant that is in the cart.
     */
    public function productVariant()
    {
        return $this->belongsTo(ProductVariant::class);
    }

    /**
     * Calculate the subtotal for the cart item.
     *
     * @return float
     */
    public function getSubtotal()
    {
        return $this->price * $this->quantity;
    }

    /**
     * Update the quantity of the cart item.
     *
     * @param int $quantity
     * @return bool
     */
    public function updateQuantity($quantity)
    {
        if ($quantity <= 0) {
            return $this->delete();
        }

        $this->quantity = $quantity;
        return $this->save();
    }
}