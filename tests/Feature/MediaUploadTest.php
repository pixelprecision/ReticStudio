<?php

namespace Tests\Feature;

use App\Models\MediaCollection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MediaUploadTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function api_can_upload_single_file()
    {
        // We need to bypass the JWT auth for testing
        $this->withoutMiddleware(\App\Http\Middleware\JwtMiddleware::class);
        
        Storage::fake('public');
        
        $user = User::factory()->create();
        $file = UploadedFile::fake()->image('test.jpg', 100, 100);
        
        // Create a media collection
        $collection = MediaCollection::create([
            'name' => 'Default Collection',
            'slug' => 'default',
            'description' => 'Default collection for media',
            'created_by' => $user->id,
            'updated_by' => $user->id,
        ]);
        
        $response = $this->actingAs($user)
            ->post('/api/media', [
                'file' => $file,
                'name' => 'Test Image',
                'collection' => 'default',
            ]);
        
        $response->assertStatus(201);
        
        // Verify response structure
        $response->assertJsonStructure([
            'id',
            'name',
            'file_name',
            'mime_type',
            'size',
            'url',
        ]);
        
        // Verify model relationships
        $this->assertDatabaseHas('media', ['name' => 'Test Image']);
        $this->assertDatabaseHas('media_owners', []);
    }

    /** @test */
    public function api_can_upload_multiple_files()
    {
        // We need to bypass the JWT auth for testing
        $this->withoutMiddleware(\App\Http\Middleware\JwtMiddleware::class);
        
        Storage::fake('public');
        
        $user = User::factory()->create();
        $file1 = UploadedFile::fake()->image('test1.jpg', 100, 100);
        $file2 = UploadedFile::fake()->image('test2.jpg', 100, 100);
        
        // Create a media collection
        $collection = MediaCollection::create([
            'name' => 'Default Collection',
            'slug' => 'default',
            'description' => 'Default collection for media',
            'created_by' => $user->id,
            'updated_by' => $user->id,
        ]);
        
        $response = $this->actingAs($user)
            ->post('/api/media', [
                'files' => [$file1, $file2],
                'collection' => 'default',
            ]);
        
        $response->assertStatus(201);
        $response->assertJsonStructure([
            'files' => [
                '*' => [
                    'id',
                    'name',
                    'file_name',
                    'mime_type',
                    'size',
                    'url',
                ]
            ]
        ]);
        
        $this->assertDatabaseCount('media', 2);
    }
}