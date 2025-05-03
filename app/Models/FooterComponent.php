<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FooterComponent extends Model
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
        'column',
        'order',
        'footer_layout_id',
        'settings',
        'is_active',
        'custom_classes',
        'visibility',
        'page_component_id',
        'page_component_data',
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
        'column' => 'integer',
        'page_component_data' => 'json',
    ];
    
    /**
     * Get the footer layout that this component belongs to
     *
     * @return BelongsTo
     */
    public function footerLayout(): BelongsTo
    {
        return $this->belongsTo(FooterLayout::class);
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
     * Get component if this is a component type
     * 
     * @return BelongsTo
     */
    public function pageComponent(): BelongsTo
    {
        return $this->belongsTo(Component::class, 'page_component_id');
    }
    
    /**
     * Get the component data based on settings or relationship
     * 
     * @return Component|null
     */
    public function getComponentData()
    {
        // Direct page component relationship via ID
        if (!empty($this->page_component_id)) {
            return $this->pageComponent;
        }
        
        // Legacy support for settings-based component reference
        if ($this->type === 'component' && !empty($this->settings['component_id'])) {
            return Component::find($this->settings['component_id']);
        }
        
        return null;
    }
    
    /**
     * Create default components for a footer layout
     *
     * @param FooterLayout $layout
     * @return void
     */
    public static function createDefaultComponents(FooterLayout $layout)
    {
        // Create logo component
        self::create([
            'name' => 'Logo',
            'type' => 'logo',
            'position' => 'column_1',
            'column' => 1,
            'order' => 1,
            'footer_layout_id' => $layout->id,
            'is_active' => true,
            'visibility' => 'all',
        ]);
        
        // Create about text component
        self::create([
            'name' => 'About Text',
            'type' => 'text',
            'position' => 'column_1',
            'column' => 1,
            'order' => 2,
            'footer_layout_id' => $layout->id,
            'settings' => ['text' => 'A brief description of your company or website.'],
            'is_active' => true,
            'visibility' => 'all',
        ]);
        
        // Create menu component for column 2
        self::create([
            'name' => 'Links Menu',
            'type' => 'menu',
            'position' => 'column_2',
            'column' => 2,
            'order' => 1,
            'footer_layout_id' => $layout->id,
            'settings' => ['menu_id' => 1, 'title' => 'Quick Links'], // Assuming main menu has ID 1
            'is_active' => true,
            'visibility' => 'all',
        ]);
        
        // Create contact component
        self::create([
            'name' => 'Contact Info',
            'type' => 'contact',
            'position' => 'column_3',
            'column' => 3,
            'order' => 1,
            'footer_layout_id' => $layout->id,
            'settings' => [
                'title' => 'Contact Us',
                'address' => '123 Street Name, City, Country',
                'phone' => '+1 (555) 123-4567',
                'email' => 'info@example.com'
            ],
            'is_active' => true,
            'visibility' => 'all',
        ]);
        
        // Create social component
        self::create([
            'name' => 'Social Media',
            'type' => 'social',
            'position' => 'column_3',
            'column' => 3,
            'order' => 2,
            'footer_layout_id' => $layout->id,
            'settings' => [
                'title' => 'Follow Us',
                'networks' => [
                    ['name' => 'facebook', 'url' => 'https://facebook.com'],
                    ['name' => 'twitter', 'url' => 'https://twitter.com'],
                    ['name' => 'instagram', 'url' => 'https://instagram.com']
                ]
            ],
            'is_active' => true,
            'visibility' => 'all',
        ]);
        
        // Create copyright for footer bar
        self::create([
            'name' => 'Copyright',
            'type' => 'copyright',
            'position' => 'footer_bar',
            'order' => 1,
            'footer_layout_id' => $layout->id,
            'is_active' => true,
            'visibility' => 'all',
        ]);
    }
}
