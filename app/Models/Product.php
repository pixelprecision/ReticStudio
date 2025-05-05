<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Product extends Model implements HasMedia
{
    use HasFactory, SoftDeletes, InteractsWithMedia;
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'brand_id',
        'product_type',
        'sku',
        'barcode',
        'default_price',
        'cost',
        'msrp',
        'sale_price',
        'weight',
        'width',
        'height',
        'depth',
        'free_shipping',
        'fixed_shipping_price',
        'origin_location',
        'dimension_rules',
        'availability',
        'stock_status',
        'bin_picking_number',
        'warranty_information',
        'template_page',
        'search_keywords',
        'is_visible',
        'is_featured',
        'gift_wrapping',
        'sort_order',
        'condition',
        'min_purchase_qty',
        'max_purchase_qty',
        'seo_object_type',
        'seo_title',
        'seo_description',
        'seo_image',
        'track_inventory',
        'inventory_level',
        'inventory_warning_level',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'default_price' => 'decimal:2',
        'cost' => 'decimal:2',
        'msrp' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'weight' => 'decimal:2',
        'width' => 'decimal:2',
        'height' => 'decimal:2',
        'depth' => 'decimal:2',
        'fixed_shipping_price' => 'decimal:2',
        'dimension_rules' => 'json',
        'free_shipping' => 'boolean',
        'is_visible' => 'boolean',
        'is_featured' => 'boolean',
        'track_inventory' => 'boolean',
        'inventory_level' => 'integer',
        'inventory_warning_level' => 'integer',
        'min_purchase_qty' => 'integer',
        'max_purchase_qty' => 'integer',
        'sort_order' => 'integer',
    ];
    
    /**
     * The relationships that should always be loaded.
     *
     * @var array
     */
    protected $with = ['brand'];
    
    /**
     * Get the brand that owns the product.
     */
    public function brand()
    {
        return $this->belongsTo(ProductBrand::class);
    }
    
    /**
     * Get the categories for the product.
     */
    public function categories()
    {
        return $this->belongsToMany(ProductCategory::class, 'product_category_relationships', 'product_id', 'category_id')
                    ->withPivot('sort_order', 'is_primary')
                    ->withTimestamps();
    }
    
    /**
     * Get the primary category for the product.
     */
    public function primaryCategory()
    {
        return $this->belongsToMany(ProductCategory::class, 'product_category_relationships', 'product_id', 'category_id')
                    ->wherePivot('is_primary', true)
                    ->first();
    }
    
    /**
     * Get the images for the product.
     */
    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }
    
    /**
     * Get the featured image for the product.
     */
    public function featuredImage()
    {
        return $this->hasOne(ProductImage::class)->where('is_featured', true);
    }
    
    /**
     * Get the videos for the product.
     */
    public function videos()
    {
        return $this->hasMany(ProductVideo::class);
    }
    
    /**
     * Get the variants for the product.
     */
    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }
    
    /**
     * Get the specifications for the product.
     */
    public function specifications()
    {
        return $this->hasMany(ProductSpecification::class);
    }
    
    /**
     * Get the reviews for the product.
     */
    public function reviews()
    {
        return $this->hasMany(ProductReview::class);
    }
    
    /**
     * Get the current price of the product.
     * 
     * @return float
     */
    public function getCurrentPrice()
    {
        return $this->sale_price ?? $this->default_price;
    }
    
    /**
     * Scope a query to only include visible products.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeVisible($query)
    {
        return $query->where('is_visible', true);
    }
    
    /**
     * Scope a query to only include featured products.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }
    
    /**
     * Scope a query to only include products in stock.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeInStock($query)
    {
        return $query->where('stock_status', 'in_stock');
    }
    
    /**
     * Scope a query to only include products on sale.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeOnSale($query)
    {
        return $query->whereNotNull('sale_price');
    }
    
    /**
     * Register media collections for the product.
     *
     * @return void
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('product_images')
            ->useDisk('public');
    }
}
