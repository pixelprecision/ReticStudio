<?php
// Verify parallax support in TailwindImageHero component

// Bootstrap Laravel
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Check for our component
$component = \App\Models\Component::where('slug', 'tailwindimagehero')->first();

if (!$component) {
    echo "❌ TailwindImageHero component not found!\n";
    exit(1);
}

// Verify schema includes parallax properties
$schema = json_decode($component->schema, true);
$properties = $schema['properties'] ?? [];

$parallaxProperties = [
    'parallaxEnabled', 
    'parallaxSpeed'
];

$missingProps = [];
foreach ($parallaxProperties as $prop) {
    if (!isset($properties[$prop])) {
        $missingProps[] = $prop;
    }
}

if (empty($missingProps)) {
    echo "✅ Parallax properties found in schema!\n";
    
    // Show property settings
    echo "parallaxEnabled: Type = " . $properties['parallaxEnabled']['type'] . ", Default = " . 
        ($properties['parallaxEnabled']['default'] ? 'true' : 'false') . "\n";
    
    echo "parallaxSpeed options:\n";
    foreach ($properties['parallaxSpeed']['options'] as $option) {
        echo "  - " . $option['value'] . ": " . $option['label'] . "\n";
    }
} else {
    echo "❌ Missing properties: " . implode(', ', $missingProps) . "\n";
}

// Verify template contains parallax code
$templateChecks = [
    'parallaxEnabled' => 'props.parallaxEnabled',
    'parallaxSpeed' => 'props.parallaxSpeed',
    'data-parallax' => 'data-parallax'
];

$missingTemplateElements = [];
foreach ($templateChecks as $name => $check) {
    if (strpos($component->template, $check) === false) {
        $missingTemplateElements[] = $name;
    }
}

if (empty($missingTemplateElements)) {
    echo "✅ Template contains parallax code!\n";
    
    // Count occurrences of parallax-related code to verify implementation
    $parallaxCount = substr_count($component->template, 'parallax');
    echo "Found {$parallaxCount} occurrences of 'parallax' in the template.\n";
} else {
    echo "❌ Template missing elements: " . implode(', ', $missingTemplateElements) . "\n";
}

// Check parallax utilities
$parallaxUtilsPath = __DIR__ . '/resources/js/admin/src/utils/parallaxUtils.js';
if (file_exists($parallaxUtilsPath)) {
    echo "✅ parallaxUtils.js exists and contains " . filesize($parallaxUtilsPath) . " bytes.\n";
} else {
    echo "❌ parallaxUtils.js not found!\n";
}