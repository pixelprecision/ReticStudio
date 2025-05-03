<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FooterLayout extends Model
{
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'description',
        'layout_type',
        'show_footer',
        'show_footer_bar',
        'is_default',
        'is_active',
        'columns',
    ];
    
    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'show_footer' => 'boolean',
        'show_footer_bar' => 'boolean',
        'is_default' => 'boolean',
        'is_active' => 'boolean',
        'columns' => 'integer',
    ];
    
    /**
     * Get the components for this footer layout
     *
     * @return HasMany
     */
    public function components(): HasMany
    {
        return $this->hasMany(FooterComponent::class);
    }
    
    /**
     * Get active components for this layout
     *
     * @return HasMany
     */
    public function activeComponents(): HasMany
    {
        return $this->components()->where('is_active', true)->orderBy('position')->orderBy('order');
    }
    
    /**
     * Get or create default footer layout
     *
     * @return FooterLayout
     */
    public static function getDefault()
    {
        $layout = self::where('is_default', true)->first();
        
        if (!$layout) {
            $layout = self::create([
                'name' => 'Default Footer Layout',
                'description' => 'Default footer layout with standard configuration',
                'layout_type' => 'standard',
                'show_footer' => true,
                'show_footer_bar' => true,
                'is_default' => true,
                'is_active' => true,
                'columns' => 3,
            ]);
            
            // Create default components
            FooterComponent::createDefaultComponents($layout);
        }
        
        return $layout;
    }
}
