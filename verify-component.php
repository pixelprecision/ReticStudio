<?php
// Temporary script to verify our component exists in the database

// Bootstrap Laravel
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Check if our component exists
$component = \App\Models\Component::where('slug', 'tailwindimagehero')->first();

if ($component) {
    echo "✅ TailwindImageHero component found in database!\n";
    echo "Name: " . $component->name . "\n";
    echo "Description: " . $component->description . "\n";
    echo "Category: " . $component->category . "\n";
    
    // Verify schema includes our properties
    $schema = json_decode($component->schema, true);
    $properties = $schema['properties'] ?? [];
    
    $requiredProps = [
        'backgroundImage', 
        'overlayColor', 
        'overlayOpacity',
        'sideImage',
        'sideImagePosition',
        'sideImageWidth',
        'extraClasses',
        'imageExtraClasses',
        'textExtraClasses'
    ];
    
    $missingProps = [];
    foreach ($requiredProps as $prop) {
        if (!isset($properties[$prop])) {
            $missingProps[] = $prop;
        }
    }
    
    if (empty($missingProps)) {
        echo "✅ All required properties are present in the schema\n";
    } else {
        echo "❌ Missing properties: " . implode(', ', $missingProps) . "\n";
    }
    
    // Verify template contains key elements
    $templateChecks = [
        'backgroundImage' => 'props.backgroundImage',
        'overlayColor' => 'props.overlayColor',
        'sideImage' => 'props.sideImage',
        'sideImagePosition' => 'props.sideImagePosition'
    ];
    
    $missingTemplateElements = [];
    foreach ($templateChecks as $name => $check) {
        if (strpos($component->template, $check) === false) {
            $missingTemplateElements[] = $name;
        }
    }
    
    if (empty($missingTemplateElements)) {
        echo "✅ Template contains all required elements\n";
    } else {
        echo "❌ Template missing elements: " . implode(', ', $missingTemplateElements) . "\n";
    }
    
} else {
    echo "❌ TailwindImageHero component NOT found in database!\n";
}