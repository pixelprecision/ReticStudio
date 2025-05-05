<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVideo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProductVideoController extends Controller
{
    /**
     * Get all videos for a product.
     *
     * @param int $productId
     * @return \Illuminate\Http\JsonResponse
     */
    public function index($productId)
    {
        $product = Product::findOrFail($productId);
        $videos = $product->videos()->orderBy('sort_order')->get();
        
        return response()->json([
            'success' => true,
            'data' => $videos
        ]);
    }

    /**
     * Store a new video for a product.
     *
     * @param Request $request
     * @param int $productId
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request, $productId)
    {
        $product = Product::findOrFail($productId);

        $validator = Validator::make($request->all(), [
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:youtube,vimeo',
            'video_id' => 'required|string|max:100',
            'thumbnail' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $video = new ProductVideo([
            'title' => $request->title ?? '',
            'description' => $request->description ?? '',
            'type' => $request->type,
            'video_id' => $request->video_id,
            'thumbnail' => $request->thumbnail ?? '',
            'sort_order' => $request->sort_order ?? $product->videos()->count(),
        ]);

        $product->videos()->save($video);

        return response()->json([
            'success' => true,
            'message' => 'Video added successfully',
            'data' => $video
        ], 201);
    }

    /**
     * Upload a video file for a product.
     *
     * @param Request $request
     * @param int $productId
     * @return \Illuminate\Http\JsonResponse
     */
    public function upload(Request $request, $productId)
    {
        $product = Product::findOrFail($productId);

        $validator = Validator::make($request->all(), [
            'video' => 'required|file|mimes:mp4,webm,mov|max:102400', // 100MB max
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $file = $request->file('video');
            $path = $file->store('products/' . $product->id . '/videos', 'public');

            $video = new ProductVideo([
                'title' => $request->title ?? '',
                'description' => $request->description ?? '',
                'type' => 'upload',
                'path' => $path,
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'sort_order' => $request->sort_order ?? $product->videos()->count(),
            ]);

            $product->videos()->save($video);

            return response()->json([
                'success' => true,
                'message' => 'Video uploaded successfully',
                'data' => $video
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error uploading video',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show a specific video.
     *
     * @param int $productId
     * @param int $videoId
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($productId, $videoId)
    {
        $video = ProductVideo::where('product_id', $productId)
            ->where('id', $videoId)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $video
        ]);
    }

    /**
     * Update a specific video.
     *
     * @param Request $request
     * @param int $productId
     * @param int $videoId
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $productId, $videoId)
    {
        $video = ProductVideo::where('product_id', $productId)
            ->where('id', $videoId)
            ->firstOrFail();

        $validator = Validator::make($request->all(), [
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'thumbnail' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        if (isset($request->title)) $video->title = $request->title;
        if (isset($request->description)) $video->description = $request->description;
        if (isset($request->thumbnail)) $video->thumbnail = $request->thumbnail;
        if (isset($request->sort_order)) $video->sort_order = $request->sort_order;

        $video->save();

        return response()->json([
            'success' => true,
            'message' => 'Video updated successfully',
            'data' => $video
        ]);
    }

    /**
     * Delete a specific video.
     *
     * @param int $productId
     * @param int $videoId
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($productId, $videoId)
    {
        $video = ProductVideo::where('product_id', $productId)
            ->where('id', $videoId)
            ->firstOrFail();

        try {
            // Delete file if uploaded type
            if ($video->type === 'upload' && Storage::disk('public')->exists($video->path)) {
                Storage::disk('public')->delete($video->path);
            }

            $video->delete();

            return response()->json([
                'success' => true,
                'message' => 'Video deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting video',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Restore a soft-deleted video.
     *
     * @param int $productId
     * @param int $videoId
     * @return \Illuminate\Http\JsonResponse
     */
    public function restore($productId, $videoId)
    {
        $video = ProductVideo::withTrashed()
            ->where('product_id', $productId)
            ->where('id', $videoId)
            ->firstOrFail();

        if (!$video->trashed()) {
            return response()->json([
                'success' => false,
                'message' => 'Video is not deleted'
            ], 422);
        }

        try {
            $video->restore();

            return response()->json([
                'success' => true,
                'message' => 'Video restored successfully',
                'data' => $video
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error restoring video',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reorder videos for a product.
     *
     * @param Request $request
     * @param int $productId
     * @return \Illuminate\Http\JsonResponse
     */
    public function reorder(Request $request, $productId)
    {
        $product = Product::findOrFail($productId);

        $validator = Validator::make($request->all(), [
            'video_ids' => 'required|array',
            'video_ids.*' => 'exists:product_videos,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            foreach ($request->video_ids as $index => $videoId) {
                ProductVideo::where('id', $videoId)
                    ->where('product_id', $productId)
                    ->update(['sort_order' => $index]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Videos reordered successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error reordering videos',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}