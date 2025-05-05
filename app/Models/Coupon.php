<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Coupon extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'code',
        'type',
        'value',
        'min_order_amount',
        'max_uses',
        'uses_count',
        'is_percent',
        'starts_at',
        'expires_at',
        'is_active',
        'applies_to',
        'excluded_products',
        'excluded_categories',
        'included_products',
        'included_categories',
        'customer_eligibility',
        'eligible_customers',
        'description',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'value' => 'decimal:2',
        'min_order_amount' => 'decimal:2',
        'max_uses' => 'integer',
        'uses_count' => 'integer',
        'is_percent' => 'boolean',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
        'excluded_products' => 'json',
        'excluded_categories' => 'json',
        'included_products' => 'json',
        'included_categories' => 'json',
        'eligible_customers' => 'json',
    ];

    /**
     * Coupon types
     */
    const TYPE_FIXED = 'fixed';
    const TYPE_PERCENT = 'percent';
    const TYPE_FREE_SHIPPING = 'free_shipping';
    const TYPE_BUY_X_GET_Y = 'buy_x_get_y';

    /**
     * Applies to options
     */
    const APPLIES_TO_ENTIRE_ORDER = 'entire_order';
    const APPLIES_TO_SPECIFIC_PRODUCTS = 'specific_products';
    const APPLIES_TO_SPECIFIC_CATEGORIES = 'specific_categories';

    /**
     * Customer eligibility options
     */
    const CUSTOMER_ELIGIBILITY_ALL = 'all';
    const CUSTOMER_ELIGIBILITY_SPECIFIC = 'specific';

    /**
     * Get the orders where this coupon was used.
     */
    public function orders()
    {
        return $this->hasMany(Order::class, 'coupon_code', 'code');
    }

    /**
     * Check if the coupon is valid.
     *
     * @return bool
     */
    public function isValid()
    {
        // Check if active
        if (!$this->is_active) {
            return false;
        }

        // Check date constraints
        $now = now();
        if ($this->starts_at && $now->lt($this->starts_at)) {
            return false;
        }
        if ($this->expires_at && $now->gt($this->expires_at)) {
            return false;
        }

        // Check usage constraints
        if ($this->max_uses && $this->uses_count >= $this->max_uses) {
            return false;
        }

        return true;
    }

    /**
     * Calculate the discount amount for an order.
     *
     * @param float $orderAmount
     * @param array $items Array of cart items
     * @param int|null $customerId
     * @return float
     */
    public function calculateDiscount($orderAmount, $items = [], $customerId = null)
    {
        // Check if the coupon is valid
        if (!$this->isValid()) {
            return 0;
        }

        // Check minimum order amount
        if ($this->min_order_amount && $orderAmount < $this->min_order_amount) {
            return 0;
        }

        // Check customer eligibility
        if ($this->customer_eligibility === self::CUSTOMER_ELIGIBILITY_SPECIFIC) {
            $eligibleCustomers = $this->eligible_customers ?? [];
            if (!in_array($customerId, $eligibleCustomers)) {
                return 0;
            }
        }

        // Calculate discount based on type
        switch ($this->type) {
            case self::TYPE_FIXED:
                return min($this->value, $orderAmount);
            
            case self::TYPE_PERCENT:
                return $orderAmount * ($this->value / 100);
            
            case self::TYPE_FREE_SHIPPING:
                // This would be handled in the shipping calculation
                return 0;
            
            case self::TYPE_BUY_X_GET_Y:
                // This would require more complex logic based on cart contents
                return 0;
            
            default:
                return 0;
        }
    }

    /**
     * Increment the uses count.
     *
     * @return bool
     */
    public function incrementUsage()
    {
        $this->uses_count++;
        return $this->save();
    }

    /**
     * Scope a query to only include active coupons.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include valid coupons based on date.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeValid($query)
    {
        $now = now();
        
        return $query->where('is_active', true)
            ->where(function ($query) use ($now) {
                $query->whereNull('starts_at')
                    ->orWhere('starts_at', '<=', $now);
            })
            ->where(function ($query) use ($now) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>=', $now);
            })
            ->where(function ($query) {
                $query->whereNull('max_uses')
                    ->orWhereRaw('uses_count < max_uses');
            });
    }
}