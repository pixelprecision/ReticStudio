<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class FooterSetting extends Model
{
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'site_name',
        'copyright_text',
        'footer_style',
        'position',
        'columns',
        'show_footer',
        'show_footer_bar',
        'footer_bar_message',
        'footer_bar_badge_color',
        'footer_background_color',
        'footer_text_color',
        'show_social_icons',
        'social_links',
        'logo',
        'logo_media_id',
        'custom_css',
        'custom_footer_classes',
        'custom_footer_bar_classes',
        'custom_logo_classes',
    ];
    
    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'show_footer' => 'boolean',
        'show_footer_bar' => 'boolean',
        'show_social_icons' => 'boolean',
        'social_links' => 'json',
        'columns' => 'integer',
    ];
    
    /**
     * Get active footer settings
     * 
     * @return FooterSetting
     */
    public static function getActive()
    {
        // Check cache first for performance
        if (Cache::has('footer_settings')) {
            return Cache::get('footer_settings');
        }
        
        // Get default values from config
        $defaultValues = [
            'site_name' => config('app.name'),
            'copyright_text' => '© ' . date('Y') . ' ' . config('app.name') . '. All rights reserved.',
            'footer_style' => config('cms.footer.footer_style', 'standard'),
            'position' => config('cms.footer.position', 'bottom'),
            'columns' => config('cms.footer.columns', 3),
            'show_footer' => config('cms.footer.show_footer', true),
            'show_footer_bar' => config('cms.footer.show_footer_bar', true),
            'footer_background_color' => '#1f2937',
            'footer_text_color' => '#ffffff',
        ];
        
        // Try to get from database first
        $settings = self::first();
        
        // Create new settings instance if none exists
        if (!$settings) {
            $settings = self::create($defaultValues);
            
            // Also create entries in the Settings table
            foreach ($defaultValues as $key => $value) {
                if (in_array($key, $settings->fillable)) {
                    // Skip site_name as it should already exist in general settings
                    if ($key === 'site_name') continue;
                    
                    $type = 'string';
                    if (isset($settings->casts[$key])) {
                        $type = $settings->casts[$key] === 'boolean' ? 'boolean' : 
                              ($settings->casts[$key] === 'json' ? 'json' : 'string');
                    }
                    
                    Setting::updateOrCreate(
                        ['group' => 'footer', 'key' => $key],
                        [
                            'value' => $value, 
                            'type' => $type,
                            'is_system' => false
                        ]
                    );
                }
            }
        }
        
        // Get settings from Settings table to make sure we have the latest values
        $dbSettings = Setting::where('group', 'footer')->get();
        
        // Check if we have any settings in the database at all
        if ($dbSettings->count() > 0) {
            // Update from settings table
            foreach ($dbSettings as $setting) {
                if (in_array($setting->key, $settings->fillable)) {
                    $settings->{$setting->key} = $setting->value;
                }
            }
        } else {
            // No settings in the database, let's create them based on the model
            foreach ($settings->fillable as $key) {
                // Skip site_name and logo as they should be in general settings
                if (in_array($key, ['site_name', 'logo'])) continue;
                
                if (isset($settings->$key)) {
                    $type = 'string';
                    if (isset($settings->casts[$key])) {
                        $type = $settings->casts[$key] === 'boolean' ? 'boolean' : 
                              ($settings->casts[$key] === 'json' ? 'json' : 'string');
                    }
                    
                    Setting::updateOrCreate(
                        ['group' => 'footer', 'key' => $key],
                        [
                            'value' => $settings->$key, 
                            'type' => $type,
                            'is_system' => false
                        ]
                    );
                }
            }
        }
        
        // Always get site name and logo from general settings as they should be there
        $siteName = Setting::where('group', 'general')
            ->where('key', 'site_name')
            ->value('value');
            
        if ($siteName) {
            $settings->site_name = $siteName;
        }
        
        $logo = Setting::where('group', 'general')
            ->where('key', 'site_logo')
            ->value('value');
        
        if ($logo) {
            $settings->logo = $logo;
        }
        
        // Cache the settings for better performance
        Cache::put('footer_settings', $settings, now()->addMinutes(60));
        
        return $settings;
    }
    
    /**
     * Update footer settings and sync with Settings table
     *
     * @param array $attributes
     * @param array $options
     * @return bool
     */
    public function update(array $attributes = [], array $options = [])
    {
        // Clear cache first to ensure fresh data
        Cache::forget('footer_settings');
        
        // First update the model
        $result = parent::update($attributes, $options);
        
        // Then sync with Settings table
        foreach ($attributes as $key => $value) {
            if (in_array($key, $this->fillable)) {
                // Handle special cases
                if ($key === 'site_name') {
                    // Update in general settings
                    Setting::updateOrCreate(
                        ['group' => 'general', 'key' => 'site_name'],
                        ['value' => $value, 'type' => 'string', 'is_system' => true]
                    );
                } elseif ($key === 'logo') {
                    // Update in general settings
                    Setting::updateOrCreate(
                        ['group' => 'general', 'key' => 'site_logo'],
                        ['value' => $value, 'type' => 'string', 'is_system' => false]
                    );
                } else {
                    // Regular footer setting
                    $type = 'string';
                    if (isset($this->casts[$key])) {
                        $type = $this->casts[$key] === 'boolean' ? 'boolean' : 
                              ($this->casts[$key] === 'json' ? 'json' : 'string');
                    }
                    
                    // For boolean values, ensure they are properly formatted
                    if ($type === 'boolean') {
                        $value = filter_var($value, FILTER_VALIDATE_BOOLEAN) ? true : false;
                    }
                    
                    Setting::updateOrCreate(
                        ['group' => 'footer', 'key' => $key],
                        ['value' => $value, 'type' => $type, 'is_system' => false]
                    );
                }
            }
        }
        
        return $result;
    }
    
    /**
     * When we're saving a completely new record, make sure to sync with Settings table
     *
     * @param array $options
     * @return bool
     */
    public function save(array $options = [])
    {
        // Clear cache
        Cache::forget('footer_settings');
        
        // Save the model
        $result = parent::save($options);
        
        // Sync all attributes with the Settings table
        foreach ($this->fillable as $key) {
            if (isset($this->attributes[$key])) {
                $value = $this->attributes[$key];
                
                // Skip if value is null (not set)
                if ($value === null) continue;
                
                // Handle special cases
                if ($key === 'site_name') {
                    // Update in general settings
                    Setting::updateOrCreate(
                        ['group' => 'general', 'key' => 'site_name'],
                        ['value' => $value, 'type' => 'string', 'is_system' => true]
                    );
                } elseif ($key === 'logo') {
                    // Update in general settings
                    Setting::updateOrCreate(
                        ['group' => 'general', 'key' => 'site_logo'],
                        ['value' => $value, 'type' => 'string', 'is_system' => false]
                    );
                } else {
                    // Regular footer setting
                    $type = 'string';
                    if (isset($this->casts[$key])) {
                        $type = $this->casts[$key] === 'boolean' ? 'boolean' : 
                              ($this->casts[$key] === 'json' ? 'json' : 'string');
                    }
                    
                    // For boolean values, ensure they are properly formatted
                    if ($type === 'boolean') {
                        $value = filter_var($value, FILTER_VALIDATE_BOOLEAN) ? true : false;
                    }
                    
                    Setting::updateOrCreate(
                        ['group' => 'footer', 'key' => $key],
                        ['value' => $value, 'type' => $type, 'is_system' => false]
                    );
                }
            }
        }
        
        return $result;
    }
}
