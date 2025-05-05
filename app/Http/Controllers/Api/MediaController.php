<?php
// app/Http/Controllers/Api/MediaController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MediaCollection;
use App\Models\MediaOwner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\MediaCollections\Models\Media;


class MediaController extends Controller {
	public function __construct() {

	}

	public function index(Request $request) {
		$query = Media::query();
		
		if ($request->has('collection')) {
			$query->where('collection_name', $request->input('collection'));
		}
		
		if ($request->has('search')) {
			$search = $request->input('search');
			$query->where('name', 'like', "%{$search}%")
			      ->orWhere('file_name', 'like', "%{$search}%");
		}
		
		if ($request->has('type')) {
			$query->where('mime_type', 'like', $request->input('type') . '%');
		}
		
		$media = $query->orderBy('created_at', 'desc')
		               ->paginate($request->input('per_page', 24));
		
		// Transform to include URLs
		$media->getCollection()->transform(function ($item) {
			// Generate URL compatible with other parts of the app
			$item->url = url('storage/' . $item->id . '/' . $item->file_name);
			$item->path = $item->id . '/' . $item->file_name;
			// Add thumbnail URL for images and videos
			if (Str::startsWith($item->mime_type, 'image/')) {
				$item->thumbnail = url('storage/' . $item->id . '/conversions/' . pathinfo($item->file_name, PATHINFO_FILENAME) . '-thumbnail.jpg');
			} elseif (Str::startsWith($item->mime_type, 'video/')) {
				// For videos, check if thumbnail was generated
				$thumbnailPath = $item->id . '/conversions/' . pathinfo($item->file_name, PATHINFO_FILENAME) . '-thumbnail.jpg';
				if (file_exists(public_path($thumbnailPath))) {
					$item->thumbnail = url($thumbnailPath);
					$item->thumbnail_path = $thumbnailPath;
				} else {
					// Provide a default video thumbnail
					$item->thumbnail = url('/storage/default-video-thumbnail.jpg');
					$item->thumbnail_path = '/default-video-thumbnail.jpg';
				}
				
				// Add media type information
				$item->media_type = 'video';
			} elseif (Str::startsWith($item->mime_type, 'audio/')) {
				// Add media type information for audio
				$item->media_type = 'audio';
				$item->thumbnail = url('/storage/default-audio-thumbnail.jpg');
			} else {
				// Default media type
				$item->media_type = 'file';
			}
			
			return $item;
		});
		
		return response()->json($media);
	}
	
	public function store(Request $request) {
		// Check if we're dealing with a 'file' or 'files' input
		$hasFile = $request->hasFile('file');
		$hasFiles = $request->hasFile('files');
		
		// Validate based on what's present
		if ($hasFile) {
			$validator = Validator::make($request->all(), [
				'file'       => 'required|file|max:1048576', // 1GB max (1048576 KB)
				'collection' => 'nullable|string|exists:media_collections,slug',
				'name'       => 'nullable|string|max:255',
			]);
		} elseif ($hasFiles) {
			$validator = Validator::make($request->all(), [
				'files'      => 'required|array',
				'files.*'    => 'file|max:1048576', // 1GB max per file (1048576 KB)
				'collection' => 'nullable|string|exists:media_collections,slug',
				'name'       => 'nullable|string|max:255',
			]);
		} else {
			return response()->json(['errors' => ['file' => ['No file uploaded']]], 422);
		}
		
		if ($validator->fails()) {
			return response()->json(['errors' => $validator->errors()], 422);
		}
		
		$customName = $request->input('name');
		
		// Process multiple files if they exist
		if ($hasFiles) {
			$uploadedFiles = $request->file('files');
			$uploadedMedia = [];
			
			foreach ($uploadedFiles as $file) {
				// If collection is specified in request, use it; otherwise, determine by file type
				$collectionName = $request->input('collection')
					? $request->input('collection')
					: $this->determineCollectionName($file);
					
				$media = $this->processMediaFile($file, $collectionName, $customName);
				$uploadedMedia[] = $media;
			}
			
			// If only one file was uploaded, return it directly for backward compatibility
			if (count($uploadedMedia) === 1) {
				return response()->json($uploadedMedia[0], 201);
			}
			
			return response()->json(['files' => $uploadedMedia], 201);
		} else {
			// Process single file
			$file = $request->file('file');
			
			// If collection is specified in request, use it; otherwise, determine by file type
			$collectionName = $request->input('collection')
				? $request->input('collection')
				: $this->determineCollectionName($file);
				
			$media = $this->processMediaFile($file, $collectionName, $customName);
			
			return response()->json($media, 201);
		}
	}
	
	/**
	 * Determine the best collection for a file based on its type
	 *
	 * @param \Illuminate\Http\UploadedFile $file
	 * @return string
	 */
	protected function determineCollectionName($file): string
	{
		$mimeType = $file->getMimeType();
		$extension = strtolower($file->getClientOriginalExtension());
		
		// Image types
		if (Str::startsWith($mimeType, 'image/')) {
			return 'images';
		}
		
		// Video types
		if (Str::startsWith($mimeType, 'video/')) {
			return 'videos';
		}
		
		// Audio types
		if (Str::startsWith($mimeType, 'audio/')) {
			return 'audio';
		}
		
		// Document types
		$documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt', 'ods', 'odp'];
		if (in_array($extension, $documentExtensions)) {
			return 'documents';
		}
		
		// Default to uploads for all other types
		return 'uploads';
	}
	
	/**
	 * Process and store a single media file
	 *
	 * @param \Illuminate\Http\UploadedFile $file
	 * @param string $collectionName
	 * @param string|null $customName
	 * @return \Spatie\MediaLibrary\MediaCollections\Models\Media
	 */
	protected function processMediaFile($file, $collectionName, $customName = null) {
		// Get or create a MediaOwner to attach the media to
		$mediaOwner = MediaOwner::firstOrCreate(
			['name' => 'Media Owner for ' . $collectionName],
			[
				'description' => 'Automatically created media owner for the ' . $collectionName . ' collection',
				'created_by' => auth()->id(),
				'updated_by' => auth()->id(),
			]
		);
		
		// Use the file's original name if no custom name is provided
		$name = $customName ?: $file->getClientOriginalName();
		
		// Add the media to the MediaOwner
		$media = $mediaOwner->addMedia($file)
			->usingName($name)
			->usingFileName($file->getClientOriginalName())
			->toMediaCollection($collectionName);
		
		// Thumbnails are automatically generated via media conversions in the MediaOwner model
		
		// Generate URL compatible with other parts of the app
		$media->url = url('storage/' . $media->id . '/' . $media->file_name);
		
		// Add thumbnail URL for images and videos (if applicable)
		if (Str::startsWith($media->mime_type, 'image/')) {
			$media->thumbnail = url('storage/' . $media->id . '/conversions/' . pathinfo($media->file_name, PATHINFO_FILENAME) . '-thumbnail.jpg');
		} elseif (Str::startsWith($media->mime_type, 'video/')) {
			// For videos, check if thumbnail was generated
			$thumbnailPath = 'storage/' . $media->id . '/conversions/' . pathinfo($media->file_name, PATHINFO_FILENAME) . '-thumbnail.jpg';
			if (file_exists(public_path($thumbnailPath))) {
				$media->thumbnail = url($thumbnailPath);
			} else {
				// Provide a default video thumbnail
				$media->thumbnail = url('/storage/default-video-thumbnail.jpg');
			}
		}
		
		return $media;
	}
	
	public function show($id) {
		$media = Media::findOrFail($id);
		
		// Generate URL compatible with other parts of the app
		$media->url = url('storage/' . $media->id . '/' . $media->file_name);
		
		// Add thumbnail URL for images and videos
		if (Str::startsWith($media->mime_type, 'image/')) {
			$media->thumbnail = url('storage/' . $media->id . '/conversions/' . pathinfo($media->file_name, PATHINFO_FILENAME) . '-thumbnail.jpg');
		} elseif (Str::startsWith($media->mime_type, 'video/')) {
			// For videos, check if thumbnail was generated
			$thumbnailPath = 'storage/' . $media->id . '/conversions/' . pathinfo($media->file_name, PATHINFO_FILENAME) . '-thumbnail.jpg';
			if (file_exists(public_path($thumbnailPath))) {
				$media->thumbnail = url($thumbnailPath);
			} else {
				// Provide a default video thumbnail
				$media->thumbnail = url('/storage/default-video-thumbnail.jpg');
			}
			
			// Add video type and duration information if available
			$media->video_type = $media->mime_type;
		}
		
		return response()->json($media);
	}
	
	public function update(Request $request, $id) {
		$media = Media::findOrFail($id);
		
		$validator = Validator::make($request->all(), [
			'name' => 'required|string|max:255',
		]);
		
		if ($validator->fails()) {
			return response()->json(['errors' => $validator->errors()], 422);
		}
		
		$media->name = $request->input('name');
		$media->save();
		
		return response()->json($media);
	}
	
	public function destroy($id) {
		$media = Media::findOrFail($id);
		$media->delete();
		
		return response()->json(['message' => 'Media deleted successfully']);
	}
	
	public function collections(Request $request) {
		$collections = MediaCollection::with(['creator:id,name'])
		                              ->orderBy('name')
		                              ->get();
		
		return response()->json($collections);
	}
	
	public function createCollection(Request $request) {
		$validator = Validator::make($request->all(), [
			'name'        => 'required|string|max:255',
			'slug'        => 'nullable|string|max:255|unique:media_collections,slug',
			'description' => 'nullable|string',
		]);
		
		if ($validator->fails()) {
			return response()->json(['errors' => $validator->errors()], 422);
		}
		
		$data = $validator->validated();
		
		if (empty($data['slug'])) {
			$data['slug'] = Str::slug($data['name']);
		}
		
		$data['created_by'] = auth()->id();
		$data['updated_by'] = auth()->id();
		
		$collection = MediaCollection::create($data);
		
		return response()->json($collection->load(['creator:id,name']), 201);
	}
	
	public function updateCollection(Request $request, $id) {
		$collection = MediaCollection::findOrFail($id);
		
		$validator = Validator::make($request->all(), [
			'name'        => 'required|string|max:255',
			'slug'        => 'nullable|string|max:255|unique:media_collections,slug,' . $id,
			'description' => 'nullable|string',
		]);
		
		if ($validator->fails()) {
			return response()->json(['errors' => $validator->errors()], 422);
		}
		
		$data = $validator->validated();
		
		if (empty($data['slug'])) {
			$data['slug'] = Str::slug($data['name']);
		}
		
		$data['updated_by'] = auth()->id();
		
		$collection->update($data);
		
		return response()->json($collection->fresh()->load(['creator:id,name']));
	}
	
	public function deleteCollection($id) {
		$collection = MediaCollection::findOrFail($id);
		
		// Check if collection has media
		$mediaCount = Media::where('collection_name', $collection->slug)->count();
		
		if ($mediaCount > 0) {
			return response()->json([
				'error'       => 'Cannot delete collection with media. Move or delete media first.',
				'media_count' => $mediaCount
			], 422);
		}
		
		$collection->delete();
		
		return response()->json(['message' => 'Collection deleted successfully']);
	}
}
