<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductVariant extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'product_id',
        'sku',
        'name',
        'price',
        'compare_at_price',
        'cost_price',
        'inventory_quantity',
        'inventory_policy',
        'inventory_management',
        'is_visible',
        'barcode',
        'weight',
        'weight_unit',
        'length',
        'width',
        'height',
        'dimension_unit',
        'options',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'decimal:2',
        'compare_at_price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'inventory_quantity' => 'integer',
        'is_visible' => 'boolean',
        'weight' => 'decimal:2',
        'length' => 'decimal:2',
        'width' => 'decimal:2',
        'height' => 'decimal:2',
        'options' => 'json',
    ];

    /**
     * Get the product that owns the variant.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the images for the variant.
     */
    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    /**
     * Check if the variant is in stock.
     *
     * @return bool
     */
    public function isInStock()
    {
        if ($this->inventory_management === 'none') {
            return true;
        }

        return $this->inventory_quantity > 0;
    }

    /**
     * Get the current price considering sale price.
     *
     * @return float
     */
    public function getCurrentPrice()
    {
        return isset($this->compare_at_price) && $this->compare_at_price > $this->price
            ? $this->price
            : $this->price;
    }

    /**
     * Check if the variant is on sale.
     *
     * @return bool
     */
    public function isOnSale()
    {
        return isset($this->compare_at_price) && $this->compare_at_price > $this->price;
    }

    /**
     * Calculate the discount percentage.
     *
     * @return float|null
     */
    public function getDiscountPercentage()
    {
        if (!$this->isOnSale()) {
            return null;
        }

        return round((($this->compare_at_price - $this->price) / $this->compare_at_price) * 100);
    }

    /**
     * Scope a query to only include visible variants.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeVisible($query)
    {
        return $query->where('is_visible', true);
    }

    /**
     * Scope a query to only include in-stock variants.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeInStock($query)
    {
        return $query->where(function ($query) {
            $query->where('inventory_management', 'none')
                ->orWhere('inventory_quantity', '>', 0);
        });
    }
}