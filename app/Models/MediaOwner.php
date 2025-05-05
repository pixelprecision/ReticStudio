<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class MediaOwner extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $fillable = ['name', 'description'];

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('default');
    }
    
    public function registerMediaConversions($media = null): void
    {
        // Skip if no media was passed
        if (!$media) {
            return;
        }

        // Create thumbnail for images
        if (Str::startsWith($media->mime_type, 'image/')) {
            $this->addMediaConversion('thumbnail')
                ->width(200)
                ->height(200)
                ->sharpen(10)
                ->nonQueued();
        }
        
        // Create thumbnail for videos
        elseif (Str::startsWith($media->mime_type, 'video/')) {
            // Make sure FFMPEG is installed and enabled on the server to generate video thumbnails
            $this->addMediaConversion('thumbnail')
                ->extractVideoFrameAtSecond(1) // Extract frame at 1 second
                ->width(200)
                ->height(200)
                ->sharpen(10)
                ->nonQueued();
        }
        
        // Default thumbnail for any other media type
        else {
            $this->addMediaConversion('thumbnail')
                ->width(200)
                ->height(200)
                ->sharpen(10)
                ->nonQueued();
        }
    }
}
