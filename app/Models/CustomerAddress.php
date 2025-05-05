<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CustomerAddress extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'customer_id',
        'first_name',
        'last_name',
        'company',
        'address1',
        'address2',
        'city',
        'state',
        'zip',
        'country',
        'phone',
        'is_default',
        'is_billing',
        'is_shipping',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_default' => 'boolean',
        'is_billing' => 'boolean',
        'is_shipping' => 'boolean',
    ];

    /**
     * Get the customer that owns the address.
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the full name of the address owner.
     *
     * @return string
     */
    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /**
     * Get the full address as a string.
     *
     * @return string
     */
    public function getFullAddressAttribute()
    {
        $address = $this->address1;
        
        if ($this->address2) {
            $address .= ", {$this->address2}";
        }
        
        return "{$address}, {$this->city}, {$this->state} {$this->zip}, {$this->country}";
    }

    /**
     * Set this address as the default address for the customer.
     *
     * @return bool
     */
    public function setAsDefault()
    {
        // Unmark other addresses as default
        CustomerAddress::where('customer_id', $this->customer_id)
            ->where('id', '!=', $this->id)
            ->update(['is_default' => false]);
        
        // Mark this address as default
        $this->is_default = true;
        $this->save();
        
        // Update customer's default_address_id
        $this->customer->update(['default_address_id' => $this->id]);
        
        return true;
    }

    /**
     * Scope a query to only include default addresses.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    /**
     * Scope a query to only include billing addresses.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeBilling($query)
    {
        return $query->where('is_billing', true);
    }

    /**
     * Scope a query to only include shipping addresses.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeShipping($query)
    {
        return $query->where('is_shipping', true);
    }
}