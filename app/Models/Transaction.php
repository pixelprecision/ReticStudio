<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'order_id',
        'transaction_id',
        'parent_id',
        'type',
        'payment_method',
        'amount',
        'currency',
        'status',
        'gateway',
        'gateway_transaction_id',
        'gateway_parent_transaction_id',
        'gateway_response',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'gateway_response' => 'json',
    ];

    /**
     * Transaction types
     */
    const TYPE_AUTHORIZATION = 'authorization';
    const TYPE_CAPTURE = 'capture';
    const TYPE_SALE = 'sale';
    const TYPE_REFUND = 'refund';
    const TYPE_VOID = 'void';

    /**
     * Transaction statuses
     */
    const STATUS_PENDING = 'pending';
    const STATUS_SUCCESS = 'success';
    const STATUS_FAILED = 'failed';

    /**
     * Get the order associated with the transaction.
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the parent transaction.
     */
    public function parent()
    {
        return $this->belongsTo(Transaction::class, 'parent_id');
    }

    /**
     * Get the child transactions.
     */
    public function children()
    {
        return $this->hasMany(Transaction::class, 'parent_id');
    }

    /**
     * Check if the transaction is successful.
     *
     * @return bool
     */
    public function isSuccessful()
    {
        return $this->status === self::STATUS_SUCCESS;
    }

    /**
     * Check if the transaction is a refund.
     *
     * @return bool
     */
    public function isRefund()
    {
        return $this->type === self::TYPE_REFUND;
    }

    /**
     * Scope a query to only include successful transactions.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSuccessful($query)
    {
        return $query->where('status', self::STATUS_SUCCESS);
    }

    /**
     * Scope a query to only include failed transactions.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeFailed($query)
    {
        return $query->where('status', self::STATUS_FAILED);
    }

    /**
     * Scope a query to only include transactions of a specific type.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $type
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }
}