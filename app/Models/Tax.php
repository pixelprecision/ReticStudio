<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tax extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'rate',
        'country',
        'state',
        'zip',
        'is_active',
        'applies_to_shipping',
        'priority',
        'compound',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'rate' => 'decimal:4',
        'is_active' => 'boolean',
        'applies_to_shipping' => 'boolean',
        'priority' => 'integer',
        'compound' => 'boolean',
    ];

    /**
     * Check if the tax rule applies to a given address.
     *
     * @param string $country
     * @param string|null $state
     * @param string|null $zip
     * @return bool
     */
    public function appliesToAddress($country, $state = null, $zip = null)
    {
        // Check country
        if ($this->country && $this->country !== $country) {
            return false;
        }

        // Check state if specified
        if ($this->state && $state && $this->state !== $state) {
            return false;
        }

        // Check zip if specified
        if ($this->zip && $zip && $this->zip !== $zip) {
            return false;
        }

        return true;
    }

    /**
     * Calculate tax amount for a given price.
     *
     * @param float $price
     * @return float
     */
    public function calculateTax($price)
    {
        return $price * ($this->rate / 100);
    }

    /**
     * Scope a query to only include active tax rules.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to filter tax rules by country.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $country
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForCountry($query, $country)
    {
        return $query->where(function ($query) use ($country) {
            $query->whereNull('country')
                ->orWhere('country', $country);
        });
    }

    /**
     * Scope a query to filter tax rules by state.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $state
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForState($query, $state)
    {
        return $query->where(function ($query) use ($state) {
            $query->whereNull('state')
                ->orWhere('state', $state);
        });
    }

    /**
     * Scope a query to filter tax rules by zip.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $zip
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForZip($query, $zip)
    {
        return $query->where(function ($query) use ($zip) {
            $query->whereNull('zip')
                ->orWhere('zip', $zip);
        });
    }

    /**
     * Scope a query to order tax rules by priority.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByPriority($query)
    {
        return $query->orderBy('priority');
    }
}