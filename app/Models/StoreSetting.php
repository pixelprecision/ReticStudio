<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class StoreSetting extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'enable_store',
        'store_name',
        'store_email',
        'store_phone',
        'store_address',
        'store_city',
        'store_state',
        'store_postal_code',
        'store_country',
        'store_currency',
        'currency_symbol',
        'currency_position',
        'price_thousand_separator',
        'price_decimal_separator',
        'price_number_of_decimals',
        'weight_unit',
        'dimension_unit',
        'enable_taxes',
        'tax_calculation',
        'tax_rate',
        'prices_include_tax',
        'tax_calculations_based_on',
        'enable_shipping',
        'shipping_calculation_method',
        'enable_customer_accounts',
        'enable_guest_checkout',
        'order_status_options',
        'default_order_status',
        'order_prefix',
        'invoice_prefix',
        'enable_reviews',
        'allow_anonymous_reviews',
        'require_review_approval',
        'enable_coupons',
        'terms_and_conditions',
        'privacy_policy',
        'shipping_policy',
        'return_policy',
        'store_logo',
        'store_favicon',
        'social_media_links',
        'seo_title_format',
        'seo_meta_description',
        'google_analytics_id',
        'facebook_pixel_id',
        'inventory_management',
        'low_stock_threshold',
        'out_of_stock_visibility',
        'out_of_stock_behaviour',
        'date_format',
        'time_format',
        'timezone',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'enable_store' => 'boolean',
        'price_number_of_decimals' => 'integer',
        'enable_taxes' => 'boolean',
        'tax_rate' => 'decimal:2',
        'prices_include_tax' => 'boolean',
        'enable_shipping' => 'boolean',
        'enable_customer_accounts' => 'boolean',
        'enable_guest_checkout' => 'boolean',
        'order_status_options' => 'json',
        'enable_reviews' => 'boolean',
        'allow_anonymous_reviews' => 'boolean',
        'require_review_approval' => 'boolean',
        'enable_coupons' => 'boolean',
        'social_media_links' => 'json',
        'low_stock_threshold' => 'integer',
    ];

    /**
     * Currency position options
     */
    const CURRENCY_POSITION_LEFT = 'left';           // $99.99
    const CURRENCY_POSITION_RIGHT = 'right';         // 99.99$
    const CURRENCY_POSITION_LEFT_SPACE = 'left_space'; // $ 99.99
    const CURRENCY_POSITION_RIGHT_SPACE = 'right_space'; // 99.99 $

    /**
     * Tax calculation base options
     */
    const TAX_CALCULATION_BILLING = 'billing';
    const TAX_CALCULATION_SHIPPING = 'shipping';
    const TAX_CALCULATION_STORE = 'store';

    /**
     * Inventory management options
     */
    const INVENTORY_TRACK = 'track';
    const INVENTORY_DONT_TRACK = 'dont_track';

    /**
     * Out of stock visibility options
     */
    const OUT_OF_STOCK_HIDE = 'hide';
    const OUT_OF_STOCK_SHOW = 'show';

    /**
     * Out of stock behavior options
     */
    const OUT_OF_STOCK_ALLOW_BACKORDERS = 'allow_backorders';
    const OUT_OF_STOCK_PREVENT_SALES = 'prevent_sales';

    /**
     * Get a setting value by key
     *
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    public static function getValue(string $key, $default = null)
    {
        $setting = self::first();
        
        if (!$setting || !isset($setting->$key)) {
            return $default;
        }
        
        return $setting->$key;
    }

    /**
     * Check if the store is enabled
     *
     * @return bool
     */
    public static function isStoreEnabled(): bool
    {
        return (bool) self::getValue('enable_store', false);
    }

    /**
     * Format a price according to store settings.
     *
     * @param float $price
     * @return string
     */
    public static function formatPrice($price)
    {
        $setting = self::first();
        
        if (!$setting) {
            return number_format($price, 2, '.', ',');
        }
        
        $formattedPrice = number_format(
            $price,
            $setting->price_number_of_decimals ?? 2,
            $setting->price_decimal_separator ?? '.',
            $setting->price_thousand_separator ?? ','
        );
        
        $currencySymbol = $setting->currency_symbol ?? '$';
        
        switch ($setting->currency_position ?? self::CURRENCY_POSITION_LEFT) {
            case self::CURRENCY_POSITION_LEFT:
                return $currencySymbol . $formattedPrice;
            
            case self::CURRENCY_POSITION_RIGHT:
                return $formattedPrice . $currencySymbol;
            
            case self::CURRENCY_POSITION_LEFT_SPACE:
                return $currencySymbol . ' ' . $formattedPrice;
            
            case self::CURRENCY_POSITION_RIGHT_SPACE:
                return $formattedPrice . ' ' . $currencySymbol;
            
            default:
                return $currencySymbol . $formattedPrice;
        }
    }

    /**
     * Get store address as a formatted string.
     *
     * @return string|null
     */
    public function getFormattedAddress()
    {
        if (!$this->store_address) {
            return null;
        }
        
        $address = $this->store_address;
        
        if ($this->store_city) {
            $address .= ', ' . $this->store_city;
        }
        
        if ($this->store_state) {
            $address .= ', ' . $this->store_state;
        }
        
        if ($this->store_postal_code) {
            $address .= ' ' . $this->store_postal_code;
        }
        
        if ($this->store_country) {
            $address .= ', ' . $this->store_country;
        }
        
        return $address;
    }

    /**
     * Check if customer accounts are enabled.
     *
     * @return bool
     */
    public function areCustomerAccountsEnabled()
    {
        return $this->enable_customer_accounts ?? false;
    }

    /**
     * Check if guest checkout is enabled.
     *
     * @return bool
     */
    public function isGuestCheckoutEnabled()
    {
        return $this->enable_guest_checkout ?? true;
    }

    /**
     * Check if reviews are enabled.
     *
     * @return bool
     */
    public function areReviewsEnabled()
    {
        return $this->enable_reviews ?? true;
    }

    /**
     * Check if taxes are enabled.
     *
     * @return bool
     */
    public function areTaxesEnabled()
    {
        return $this->enable_taxes ?? false;
    }
}
