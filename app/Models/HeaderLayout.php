<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HeaderLayout extends Model
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
        'is_default',
        'layout_type',
        'show_topbar',
        'show_header',
        'show_subheader',
        'is_active',
    ];
    
    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'is_default' => 'boolean',
        'show_topbar' => 'boolean',
        'show_header' => 'boolean',
        'show_subheader' => 'boolean',
        'is_active' => 'boolean',
    ];
    
    /**
     * Get the components for this header layout
     * 
     * @return HasMany
     */
    public function components(): HasMany
    {
        return $this->hasMany(HeaderComponent::class);
    }
    
    /**
     * Get the topbar components
     * 
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function topbarComponents()
    {
        return $this->components()
            ->where('position', 'topbar')
            ->where('is_active', true)
            ->orderBy('order')
            ->get();
    }
    
    /**
     * Get the header components
     * 
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function headerComponents()
    {
        return $this->components()
            ->where('position', 'header')
            ->where('is_active', true)
            ->orderBy('order')
            ->get();
    }
    
    /**
     * Get the subheader components
     * 
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function subheaderComponents()
    {
        return $this->components()
            ->where('position', 'subheader')
            ->where('is_active', true)
            ->orderBy('order')
            ->get();
    }
    
    /**
     * Get the default header layout
     * 
     * @return HeaderLayout
     */
    public static function getDefault()
    {
        return self::where('is_default', true)
            ->where('is_active', true)
            ->first() ?? 
            self::create([
                'name' => 'Default Layout',
                'is_default' => true,
                'layout_type' => 'standard',
                'show_header' => true,
                'is_active' => true,
            ]);
    }
}
