<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductReview extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'product_id',
        'user_id',
        'order_id',
        'name',
        'email',
        'title',
        'content',
        'rating',
        'is_approved',
        'is_verified_purchase',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'rating' => 'integer',
        'is_approved' => 'boolean',
        'is_verified_purchase' => 'boolean',
    ];

    /**
     * Get the product that was reviewed.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the user who wrote the review.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the order associated with this review.
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the review images.
     */
    public function images()
    {
        return $this->hasMany(ProductReviewImage::class);
    }

    /**
     * Approve the review.
     *
     * @return bool
     */
    public function approve()
    {
        $this->is_approved = true;
        return $this->save();
    }

    /**
     * Check if the rating is positive (4 or higher).
     *
     * @return bool
     */
    public function isPositive()
    {
        return $this->rating >= 4;
    }

    /**
     * Check if the rating is negative (2 or lower).
     *
     * @return bool
     */
    public function isNegative()
    {
        return $this->rating <= 2;
    }

    /**
     * Scope a query to only include approved reviews.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }

    /**
     * Scope a query to only include verified purchase reviews.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeVerifiedPurchase($query)
    {
        return $query->where('is_verified_purchase', true);
    }

    /**
     * Scope a query to filter reviews by rating.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  int  $rating
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWithRating($query, $rating)
    {
        return $query->where('rating', $rating);
    }
}