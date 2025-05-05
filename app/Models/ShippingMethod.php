<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ShippingMethod extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'price',
        'free_shipping_threshold',
        'is_active',
        'delivery_time',
        'calculation_type',
        'min_order_amount',
        'max_order_amount',
        'sort_order',
        'restricted_countries',
        'shipping_zones',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'decimal:2',
        'free_shipping_threshold' => 'decimal:2',
        'is_active' => 'boolean',
        'min_order_amount' => 'decimal:2',
        'max_order_amount' => 'decimal:2',
        'sort_order' => 'integer',
        'restricted_countries' => 'json',
        'shipping_zones' => 'json',
    ];

    /**
     * Calculation types
     */
    const CALCULATION_FLAT = 'flat';
    const CALCULATION_WEIGHT = 'weight';
    const CALCULATION_PRICE = 'price';
    const CALCULATION_QUANTITY = 'quantity';

    /**
     * Get the orders that used this shipping method.
     */
    public function orders()
    {
        return $this->hasMany(Order::class, 'shipping_method');
    }

    /**
     * Calculate the shipping cost for an order.
     *
     * @param float $orderAmount
     * @param float $weight
     * @param int $itemCount
     * @param string|null $country
     * @return float|null
     */
    public function calculateCost($orderAmount, $weight = 0, $itemCount = 0, $country = null)
    {
        // Check if this method is available for the given parameters
        if (!$this->isAvailable($orderAmount, $country)) {
            return null;
        }

        // Check if the order qualifies for free shipping
        if ($this->free_shipping_threshold && $orderAmount >= $this->free_shipping_threshold) {
            return 0;
        }

        // Calculate based on the calculation type
        switch ($this->calculation_type) {
            case self::CALCULATION_FLAT:
                return $this->price;
            
            case self::CALCULATION_WEIGHT:
                // For simplicity, we'll just return the base price
                // A real implementation would use the weight to calculate
                return $this->price;
            
            case self::CALCULATION_PRICE:
                // For simplicity, we'll just return the base price
                // A real implementation would use the order amount to calculate
                return $this->price;
            
            case self::CALCULATION_QUANTITY:
                // For simplicity, we'll just return the base price
                // A real implementation would use the item count to calculate
                return $this->price;
            
            default:
                return $this->price;
        }
    }

    /**
     * Check if this shipping method is available for a given order.
     *
     * @param float $orderAmount
     * @param string|null $country
     * @return bool
     */
    public function isAvailable($orderAmount, $country = null)
    {
        // Check if the method is active
        if (!$this->is_active) {
            return false;
        }

        // Check order amount constraints
        if ($this->min_order_amount && $orderAmount < $this->min_order_amount) {
            return false;
        }

        if ($this->max_order_amount && $orderAmount > $this->max_order_amount) {
            return false;
        }

        // Check country restrictions
        if ($country && !empty($this->restricted_countries)) {
            $restrictedCountries = $this->restricted_countries;
            
            if (in_array($country, $restrictedCountries)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Scope a query to only include active shipping methods.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to order shipping methods by sort_order.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSorted($query)
    {
        return $query->orderBy('sort_order');
    }
}