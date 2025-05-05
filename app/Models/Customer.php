<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'default_address_id',
        'accepts_marketing',
        'last_order_date',
        'total_spent',
        'total_orders',
        'notes',
        'tags',
        'tax_exempt',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'accepts_marketing' => 'boolean',
        'last_order_date' => 'datetime',
        'total_spent' => 'decimal:2',
        'total_orders' => 'integer',
        'tax_exempt' => 'boolean',
        'tags' => 'json',
    ];

    /**
     * Get the user associated with the customer.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the addresses for the customer.
     */
    public function addresses()
    {
        return $this->hasMany(CustomerAddress::class);
    }

    /**
     * Get the default address for the customer.
     */
    public function defaultAddress()
    {
        return $this->belongsTo(CustomerAddress::class, 'default_address_id');
    }

    /**
     * Get the orders for the customer.
     */
    public function orders()
    {
        return $this->hasMany(Order::class, 'user_id', 'user_id');
    }

    /**
     * Get the cart for the customer.
     */
    public function cart()
    {
        return $this->hasOne(Cart::class, 'user_id', 'user_id');
    }

    /**
     * Get the full name of the customer.
     *
     * @return string
     */
    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /**
     * Update the customer's order stats.
     *
     * @param \App\Models\Order $order
     * @return void
     */
    public function updateOrderStats(Order $order)
    {
        $this->last_order_date = $order->created_at;
        $this->total_orders = $this->orders()->count();
        $this->total_spent = $this->orders()->sum('total_price');
        $this->save();
    }

    /**
     * Scope a query to only include customers who accept marketing.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeAcceptsMarketing($query)
    {
        return $query->where('accepts_marketing', true);
    }

    /**
     * Scope a query to filter customers by tags.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string|array  $tags
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWithTags($query, $tags)
    {
        if (is_string($tags)) {
            $tags = [$tags];
        }

        return $query->where(function ($query) use ($tags) {
            foreach ($tags as $tag) {
                $query->orWhereJsonContains('tags', $tag);
            }
        });
    }
}