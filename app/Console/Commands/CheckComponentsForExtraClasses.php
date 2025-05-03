<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class CheckComponentsForExtraClasses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'components:check-extra-classes';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check which components need to be updated with extraClasses support';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Checking components for extraClasses support...');
        
        $componentsPath = resource_path('js/admin/src/components/pageRenderer/components');
        
        if (!File::isDirectory($componentsPath)) {
            $this->error("Components directory not found: {$componentsPath}");
            return Command::FAILURE;
        }
        
        $files = File::glob("{$componentsPath}/*Component.jsx");
        $this->info("Found " . count($files) . " component files");
        
        $needsUpdate = [];
        $hasSupport = [];
        
        foreach ($files as $file) {
            $content = File::get($file);
            $filename = basename($file);
            
            // Check if the file contains extraClasses in the props
            if (strpos($content, 'extraClasses') !== false) {
                $hasSupport[] = $filename;
                continue;
            }
            
            // This component needs to be updated
            $needsUpdate[] = $filename;
        }
        
        $this->newLine();
        $this->info('=== Components with extraClasses support ===');
        if (count($hasSupport) > 0) {
            foreach ($hasSupport as $component) {
                $this->line("✓ {$component}");
            }
        } else {
            $this->warn("No components with extraClasses support found!");
        }
        
        $this->newLine();
        $this->info('=== Components that need extraClasses support ===');
        if (count($needsUpdate) > 0) {
            foreach ($needsUpdate as $component) {
                $this->warn("❌ {$component}");
            }
            
            $this->newLine();
            $this->line("To add extraClasses support to a component:");
            $this->line("1. Add 'extraClasses = \"\"' to the component props");
            $this->line("2. Import the utility functions:");
            $this->line("   import { extractArbitraryStyles, processArbitraryClasses } from '../../../utils/tailwindUtils';");
            $this->line("3. Process the classes:");
            $this->line("   const { styles, remainingClasses } = extractArbitraryStyles(extraClasses);");
            $this->line("   const processedExtraClasses = processArbitraryClasses(extraClasses);");
            $this->line("4. Add to component's className and style props:");
            $this->line("   className={`...existing-classes... \${processedExtraClasses}`}");
            $this->line("   style={styles}");
        } else {
            $this->info("All components have extraClasses support!");
        }
        
        return Command::SUCCESS;
    }
}