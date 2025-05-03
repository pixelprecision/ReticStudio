<?php

namespace App\Console\Commands;

use App\Models\Component;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class AddExtraClassesToComponents extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'components:add-extra-classes';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Add extraClasses property to all component schemas in the database';

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
                
                // Get the schema and ensure it's in the right format
                $schema = $component->schema;
                $schemaType = gettype($schema);
                
                // Handle different schema types
                if ($schemaType === 'string') {
                    // If it's a JSON string, decode it
                    $schema = json_decode($schema, true);
                    $this->line("- Schema was a JSON string, decoded to array");
                } elseif ($schemaType === 'object') {
                    // If it's a stdClass object, convert to array
                    $schema = json_decode(json_encode($schema), true);
                    $this->line("- Schema was an object, converted to array");
                } elseif ($schemaType !== 'array') {
                    $this->warn("- Component {$component->name} has schema of type {$schemaType}, skipping");
                    $errorCount++;
                    continue;
                }
                
                // If schema is still not an array or doesn't have properties, skip it
                if (!is_array($schema)) {
                    $this->warn("- Component {$component->name} has invalid schema structure (not an array)");
                    $errorCount++;
                    continue;
                }
                
                // For objects where properties may be at the top level
                if (!isset($schema['properties']) && count($schema) > 0) {
                    // This might be a schema where "properties" is implied
                    $schema = ['properties' => $schema];
                    $this->line("- Restructured schema to include properties key");
                }
                
                // Skip if no properties exist
                if (!isset($schema['properties'])) {
                    $this->warn("- Component {$component->name} schema doesn't have properties key");
                    $errorCount++;
                    continue;
                }
                
                // Check if extraClasses property already exists
                if (isset($schema['properties']['extraClasses'])) {
                    $this->warn("- Component already has extraClasses property. Skipping.");
                    $skippedCount++;
                    continue;
                }
                
                // Add extraClasses property
                $schema['properties']['extraClasses'] = [
                    'type' => 'text',
                    'label' => 'Tailwind Classes',
                    'default' => null,
                    'description' => 'Additional Tailwind CSS classes to apply to the component'
                ];
                
                // Update the component schema
                $component->schema = $schema;
                $component->save();
                
                $this->info("- Successfully added extraClasses to {$component->name}");
                $updatedCount++;
                
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
