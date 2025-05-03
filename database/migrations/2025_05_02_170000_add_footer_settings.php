<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\Setting;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add footer settings to the settings table
        $footerSettings = [
            [
                'group' => 'footer',
                'key' => 'show_footer',
                'value' => true,
                'type' => 'boolean',
                'is_system' => false,
            ],
            [
                'group' => 'footer',
                'key' => 'show_footer_bar',
                'value' => true,
                'type' => 'boolean',
                'is_system' => false,
            ],
            [
                'group' => 'footer',
                'key' => 'footer_style',
                'value' => 'standard',
                'type' => 'string',
                'is_system' => false,
            ],
            [
                'group' => 'footer',
                'key' => 'footer_background_color',
                'value' => '#1f2937',
                'type' => 'string',
                'is_system' => false,
            ],
            [
                'group' => 'footer',
                'key' => 'footer_text_color',
                'value' => '#ffffff',
                'type' => 'string',
                'is_system' => false,
            ],
            [
                'group' => 'footer',
                'key' => 'copyright_text',
                'value' => '© {year} Your Site. All rights reserved.',
                'type' => 'string',
                'is_system' => false,
            ],
            [
                'group' => 'footer',
                'key' => 'footer_columns',
                'value' => 3,
                'type' => 'integer',
                'is_system' => false,
            ],
            [
                'group' => 'footer',
                'key' => 'custom_footer_classes',
                'value' => '',
                'type' => 'string',
                'is_system' => false,
            ],
            [
                'group' => 'footer',
                'key' => 'custom_footer_bar_classes',
                'value' => '',
                'type' => 'string',
                'is_system' => false,
            ],
        ];

        foreach ($footerSettings as $setting) {
            Setting::create($setting);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove footer settings
        Setting::where('group', 'footer')->delete();
    }
};