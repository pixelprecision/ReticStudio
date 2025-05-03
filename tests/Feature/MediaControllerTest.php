<?php

namespace Tests\Feature;

use App\Models\MediaCollection;
use App\Models\MediaOwner;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MediaControllerTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_uploads_a_file_using_media_owner()
    {
        // Create the MediaOwner model
        $mediaOwner = new MediaOwner();
        $mediaOwner->name = 'Test Media Owner';
        $mediaOwner->description = 'Testing media owner for file uploads';
        $mediaOwner->save();

        // Set up the test file
        Storage::fake('public');
        $file = UploadedFile::fake()->image('test.jpg', 100, 100);
        
        // Upload the file directly to the MediaOwner
        $media = $mediaOwner->addMedia($file)
            ->usingName('Test Image')
            ->toMediaCollection('default');
        
        // Verify the file was uploaded and attached to MediaOwner
        $this->assertEquals('Test Image', $media->name);
        $this->assertEquals($mediaOwner->id, $media->model_id);
        $this->assertEquals(MediaOwner::class, $media->model_type);
        
        // Verify the URL is accessible
        $this->assertNotNull($media->getUrl());
    }
    
    /** @test */
    public function it_handles_multiple_uploads_using_media_owner()
    {
        // Create the MediaOwner model
        $mediaOwner = new MediaOwner();
        $mediaOwner->name = 'Test Media Owner';
        $mediaOwner->description = 'Testing media owner for multiple file uploads';
        $mediaOwner->save();

        // Set up test files
        Storage::fake('public');
        $file1 = UploadedFile::fake()->image('test1.jpg', 100, 100);
        $file2 = UploadedFile::fake()->image('test2.jpg', 200, 200);
        
        // Upload files to the MediaOwner
        $media1 = $mediaOwner->addMedia($file1)
            ->usingName('Test Image 1')
            ->toMediaCollection('default');
            
        $media2 = $mediaOwner->addMedia($file2)
            ->usingName('Test Image 2')
            ->toMediaCollection('default');
        
        // Verify both files were uploaded correctly
        $this->assertEquals(2, $mediaOwner->getMedia('default')->count());
        $this->assertEquals('Test Image 1', $media1->name);
        $this->assertEquals('Test Image 2', $media2->name);
    }
}