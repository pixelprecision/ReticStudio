<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MediaOwner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TestMediaController extends Controller
{
    public function test(Request $request)
    {
        try {
            // Create or get a MediaOwner to attach the media to
            $mediaOwner = MediaOwner::firstOrCreate(
                ['name' => 'Test Media Owner'],
                [
                    'description' => 'Automatically created media owner for testing',
                    'created_by' => auth()->id(),
                    'updated_by' => auth()->id(),
                ]
            );

            // Get uploaded file
            $file = $request->file('file');
            if (!$file) {
                return response()->json(['error' => 'No file uploaded'], 400);
            }

            // Add the media to the MediaOwner
            $media = $mediaOwner->addMedia($file)
                ->usingName('Test Upload ' . now()->timestamp)
                ->toMediaCollection('default');

            // Return the result
            return response()->json([
                'success' => true,
                'media' => [
                    'id' => $media->id,
                    'name' => $media->name,
                    'file_name' => $media->file_name,
                    'url' => $media->getUrl(),
                    'model_type' => $media->model_type,
                    'model_id' => $media->model_id,
                ]
            ], 201);
        } catch (\Exception $e) {
            Log::error('Media test upload failed: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}