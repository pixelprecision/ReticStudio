<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HeaderSetting extends Model
{
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'site_name',
        'logo',
        'favicon',
        'show_topbar',
        'topbar_message',
        'topbar_secondary_message',
        'topbar_badge_color',
        'show_search',
        'show_auth_buttons',
        'show_cart',
        'sticky_header',
        'header_style',
        'transparent_header',
        'mobile_menu_type',
        'custom_header_classes',
        'custom_topbar_classes',
        'custom_subheader_classes',
        'custom_logo_classes',
        'custom_css',
        'is_active',
    ];
    
    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'show_topbar' => 'boolean',
        'show_search' => 'boolean',
        'show_auth_buttons' => 'boolean',
        'show_cart' => 'boolean',
        'sticky_header' => 'boolean',
        'transparent_header' => 'boolean',
        'is_active' => 'boolean',
        'custom_css' => 'json',
    ];
    
    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['logo_url', 'favicon_url'];
    
    /**
     * Get the logo URL
     *
     * @return string|null
     */
    public function getLogoUrlAttribute()
    {
        return $this->logo ? asset('storage/' . $this->logo) : null;
    }
    
    /**
     * Get the favicon URL
     *
     * @return string|null
     */
    public function getFaviconUrlAttribute()
    {
        return $this->favicon ? asset('storage/' . $this->favicon) : null;
    }
    
    /**
     * Get the active header settings
     *
     * @return HeaderSetting
     */
    public static function getActive()
    {
        return self::where('is_active', true)->first() ?? self::create([
            'site_name' => config('app.name'),
            'is_active' => true,
        ]);
    }
}
