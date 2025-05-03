<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class FixMediaController extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fix-media-controller';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $mediaController = new \App\Http\Controllers\Api\MediaController();
        
        // Create a MediaOwner
        $mediaOwner = new \App\Models\MediaOwner();
        $mediaOwner->name = 'Test Media Owner';
        $mediaOwner->description = 'Testing media owner';
        $mediaOwner->save();
        
        $this->info('MediaOwner created with ID: ' . $mediaOwner->id);
        
        // Create a file
        $file = \Illuminate\Http\UploadedFile::fake()->image('test.jpg', 100, 100);
        
        try {
            // Try using addMedia directly
            $media = $mediaOwner->addMedia($file)
                ->usingName('Test Direct')
                ->toMediaCollection('default');
            
            $this->info('Direct media upload success, ID: ' . $media->id);
            $this->info('Attached to model type: ' . $media->model_type);
            $this->info('Attached to model ID: ' . $media->model_id);
        } catch (\Exception $e) {
            $this->error('Direct media upload failed: ' . $e->getMessage());
        }
    }
}
