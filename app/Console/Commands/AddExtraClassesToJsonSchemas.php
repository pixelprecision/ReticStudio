<?php

namespace App\Console\Commands;

use App\Models\Component;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class AddExtraClassesToJsonSchemas extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'components:add-extra-classes-json';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Add extraClasses property to all component schemas stored as JSON strings';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Starting to add extraClasses property to component schemas...');
        
        // Get all components from the database
        $components = Component::all();
        $this->info("Found {$components->count()} components");
        
        $updatedCount = 0;
        $skippedCount = 0;
        $errorCount = 0;
        
        foreach ($components as $component) {
            try {
                $this->info("Processing component: {$component->name} (ID: {$component->id})");
                
                // Get current schema 
                $originalSchema = $component->schema;
                $schemaType = gettype($originalSchema);
                $this->line("- Schema type: {$schemaType}");
                
                // Process the schema based on its type
                if ($schemaType === 'string') {
                    // If it's a JSON string (like in your example), process it as JSON
                    $this->line("- Treating as JSON string");
                    
                    // First, verify it's valid JSON by decoding - using default parameter to get objects
                    $decodedSchema = json_decode($originalSchema);
                    if (json_last_error() !== JSON_ERROR_NONE) {
                        $this->warn("- Component {$component->name} has invalid JSON schema: " . json_last_error_msg());
                        $errorCount++;
                        continue;
                    }
                    
                    // Check if it's an object and has properties
                    if (is_object($decodedSchema)) {
                        $this->line("- Decoded schema is an object");
                        
                        // Check if properties exists
                        if (!property_exists($decodedSchema, 'properties')) {
                            $this->warn("- Component {$component->name} schema doesn't have properties key");
                            $errorCount++;
                            continue;
                        }
                        
                        // Check if extraClasses property already exists
                        if (property_exists($decodedSchema->properties, 'extraClasses')) {
                            $this->warn("- Component already has extraClasses property. Skipping.");
                            $skippedCount++;
                            continue;
                        }
                        
                        // Add extraClasses property to the decoded schema object
                        $decodedSchema->properties->extraClasses = (object)[
                            'type' => 'text',
                            'label' => 'Tailwind Classes',
                            'default' => null,
                            'description' => 'Additional Tailwind CSS classes to apply to the component'
                        ];
                    } 
                    else {
                        // It's already an array from json_decode
                        $this->line("- Decoded schema is an array");
                        
                        // Check if properties exists in the schema
                        if (!isset($decodedSchema['properties'])) {
                            $this->warn("- Component {$component->name} schema doesn't have properties key");
                            $errorCount++;
                            continue;
                        }
                        
                        // Check if extraClasses property already exists
                        if (isset($decodedSchema['properties']['extraClasses'])) {
                            $this->warn("- Component already has extraClasses property. Skipping.");
                            $skippedCount++;
                            continue;
                        }
                        
                        // Add extraClasses property to the decoded schema array
                        $decodedSchema['properties']['extraClasses'] = [
                            'type' => 'text',
                            'label' => 'Tailwind Classes',
                            'default' => null,
                            'description' => 'Additional Tailwind CSS classes to apply to the component'
                        ];
                    }
                    
                    // Encode the schema back to JSON
                    $newSchema = json_encode($decodedSchema);
                    
                    // Update the component schema
                    $component->schema = $newSchema;
                    $component->save();
                    
                    $this->info("- Successfully added extraClasses to {$component->name}");
                    $updatedCount++;
                } 
                elseif (is_array($originalSchema)) {
                    $this->line("- Schema is a native array");
                    
                    // Check if properties exists in the schema
                    if (!isset($originalSchema['properties'])) {
                        $this->warn("- Component {$component->name} schema doesn't have properties key");
                        $errorCount++;
                        continue;
                    }
                    
                    // Check if extraClasses property already exists
                    if (isset($originalSchema['properties']['extraClasses'])) {
                        $this->warn("- Component already has extraClasses property. Skipping.");
                        $skippedCount++;
                        continue;
                    }
                    
                    // Add extraClasses property
                    $originalSchema['properties']['extraClasses'] = [
                        'type' => 'text',
                        'label' => 'Tailwind Classes',
                        'default' => null,
                        'description' => 'Additional Tailwind CSS classes to apply to the component'
                    ];
                    
                    // Update the component schema
                    $component->schema = $originalSchema;
                    $component->save();
                    
                    $this->info("- Successfully added extraClasses to {$component->name}");
                    $updatedCount++;
                }
                elseif (is_object($originalSchema)) {
                    $this->line("- Schema is a native object");
                    
                    // Check if properties exists
                    if (!property_exists($originalSchema, 'properties')) {
                        $this->warn("- Component {$component->name} schema doesn't have properties key");
                        $errorCount++;
                        continue;
                    }
                    
                    // Check if extraClasses property already exists
                    if (property_exists($originalSchema->properties, 'extraClasses')) {
                        $this->warn("- Component already has extraClasses property. Skipping.");
                        $skippedCount++;
                        continue;
                    }
                    
                    // Add extraClasses property as an object
                    $originalSchema->properties->extraClasses = (object)[
                        'type' => 'text',
                        'label' => 'Tailwind Classes',
                        'default' => null,
                        'description' => 'Additional Tailwind CSS classes to apply to the component'
                    ];
                    
                    // Update the component schema
                    $component->schema = $originalSchema;
                    $component->save();
                    
                    $this->info("- Successfully added extraClasses to {$component->name}");
                    $updatedCount++;
                }
                else {
                    $this->warn("- Component {$component->name} has unsupported schema type: {$schemaType}");
                    $errorCount++;
                    continue;
                }
                
            } catch (\Exception $e) {
                $this->error("- Error processing component {$component->name}: {$e->getMessage()}");
                Log::error("Error adding extraClasses to component {$component->id}: {$e->getMessage()}");
                $errorCount++;
            }
        }
        
        $this->newLine();
        $this->info("===== Summary =====");
        $this->info("Total components: {$components->count()}");
        $this->info("Updated: {$updatedCount}");
        $this->info("Skipped (already had extraClasses): {$skippedCount}");
        $this->info("Errors: {$errorCount}");
        
        return Command::SUCCESS;
    }
}