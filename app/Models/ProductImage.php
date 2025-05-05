<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductImage extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'product_id',
        'url', // Keep for backward compatibility
        'thumbnail_url', // Keep for backward compatibility
        'image_id', // New field for media relation
        'alt_text',
        'is_featured', // Used for primary image (renamed from is_primary)
        'sort_order',
        'product_variant_id',
        'title', // Optional title field
        'description', // Optional description field
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_featured' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Get the product that owns the image.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the product variant that owns the image.
     */
    public function productVariant()
    {
        return $this->belongsTo(ProductVariant::class);
    }
    
    /**
     * Get the media object associated with this product image.
     */
    public function media()
    {
        return $this->belongsTo(\Spatie\MediaLibrary\MediaCollections\Models\Media::class, 'image_id');
    }
    
    /**
     * Get the image URL.
     *
     * @return string|null
     */
    public function getImageUrlAttribute()
    {
        if ($this->image_id && $this->media) {
            return $this->media->getUrl();
        }
        
        // Fallback to the old path for backward compatibility
        if ($this->path) {
            return '/storage/' . $this->path;
        }
        
        return null;
    }

    /**
     * Scope a query to only include featured/primary images.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePrimary($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope a query to order images by sort_order.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSorted($query)
    {
        return $query->orderBy('sort_order');
    }
}
