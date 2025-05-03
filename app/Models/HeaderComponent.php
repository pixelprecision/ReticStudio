<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HeaderComponent extends Model
{
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'type',
        'position',
        'settings',
        'order',
        'header_layout_id',
        'is_active',
        'custom_classes',
        'visibility',
    ];
    
    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'settings' => 'json',
        'is_active' => 'boolean',
        'order' => 'integer',
    ];
    
    /**
     * Get the header layout that this component belongs to
     *
     * @return BelongsTo
     */
    public function headerLayout(): BelongsTo
    {
        return $this->belongsTo(HeaderLayout::class);
    }
    
    /**
     * Get menu if this component is a menu type
     *
     * @return Menu|null
     */
    public function menu()
    {
        if ($this->type !== 'menu' || empty($this->settings['menu_id'])) {
            return null;
        }
        
        return Menu::find($this->settings['menu_id']);
    }
    
    /**
     * Create default components for a header layout
     *
     * @param HeaderLayout $layout
     * @return void
     */
    public static function createDefaultComponents(HeaderLayout $layout)
    {
        // Create logo component
        self::create([
            'name' => 'Logo',
            'type' => 'logo',
            'position' => 'header',
            'order' => 1,
            'header_layout_id' => $layout->id,
            'is_active' => true,
            'visibility' => 'all',
        ]);
        
        // Create primary menu component
        self::create([
            'name' => 'Primary Menu',
            'type' => 'menu',
            'position' => 'header',
            'settings' => ['menu_id' => 1], // Assuming main menu has ID 1
            'order' => 2,
            'header_layout_id' => $layout->id,
            'is_active' => true,
            'visibility' => 'all',
        ]);
        
        // Create auth buttons component
        self::create([
            'name' => 'Authentication',
            'type' => 'auth',
            'position' => 'header',
            'order' => 3,
            'header_layout_id' => $layout->id,
            'is_active' => true,
            'visibility' => 'all',
        ]);
        
        // Create cart component
        self::create([
            'name' => 'Shopping Cart',
            'type' => 'cart',
            'position' => 'header',
            'order' => 4,
            'header_layout_id' => $layout->id,
            'is_active' => true,
            'visibility' => 'all',
        ]);
    }
}
