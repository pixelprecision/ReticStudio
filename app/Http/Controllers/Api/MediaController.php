<?php
	// app/Http/Controllers/Api/MediaController.php
	
	namespace App\Http\Controllers\Api;
	
	use App\Http\Controllers\Controller;
	use App\Models\MediaCollection;
	use Illuminate\Http\Request;
	use Illuminate\Support\Facades\Storage;
	use Illuminate\Support\Facades\Validator;
	use Illuminate\Support\Str;
	use Spatie\MediaLibrary\MediaCollections\Models\Media;
	use Intervention\Image\Facades\Image;
	
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
				$item->url = $item->getUrl();
				
				// Add thumbnail URL for images
				if (Str::startsWith($item->mime_type, 'image/')) {
					$item->thumbnail = $item->getUrl('thumbnail');
				}
				
				return $item;
			});
			
			return response()->json($media);
		}
		
		public function store(Request $request) {
			$validator = Validator::make($request->all(), [
				'file'       => 'required|file|max:10240', // 10MB max
				'collection' => 'nullable|string|exists:media_collections,slug',
				'name'       => 'nullable|string|max:255',
			]);
			
			if ($validator->fails()) {
				return response()->json(['errors' => $validator->errors()], 422);
			}
			
			$file = $request->file('file');
			$collectionName = $request->input('collection', 'default');
			$customName = $request->input('name');
			
			// Store the uploaded file using Spatie MediaLibrary
			if ($customName) {
				$media = Media::create([
					'name'              => $customName,
					'file_name'         => $file->getClientOriginalName(),
					'collection_name'   => $collectionName,
					'disk'              => 'public',
					'manipulations'     => [],
					'custom_properties' => [],
					'responsive_images' => [],
					'size'              => $file->getSize(),
					'mime_type'         => $file->getMimeType(),
				]);
				
				// Move file to the correct location
				$path = Storage::disk('public')->putFileAs(
					'media/' . $collectionName,
					$file,
					$media->id . '.' . $file->extension()
				);
				
				$media->file_name = basename($path);
				$media->save();
				
				// Generate thumbnails for images
				if (Str::startsWith($media->mime_type, 'image/')) {
					$this->generateThumbnail($media);
				}
			}
			else {
				// Use Spatie MediaLibrary to store the file
				$mediaClass = config('media-library.media_model');
				$media = new $mediaClass();
				$media->file_name = $file->getClientOriginalName();
				$media->collection_name = $collectionName;
				$media->disk = 'public';
				$media->size = $file->getSize();
				$media->mime_type = $file->getMimeType();
				$media->save();
				
				// Move file to the media library
				$path = $file->storeAs(
					$media->id,
					$media->file_name,
					['disk' => $media->disk]
				);
				
				// Generate thumbnails for images
				if (Str::startsWith($media->mime_type, 'image/')) {
					$this->generateThumbnail($media);
				}
			}
			
			$media->url = $media->getUrl();
			
			if (Str::startsWith($media->mime_type, 'image/')) {
				$media->thumbnail = $media->getUrl('thumbnail');
			}
			
			return response()->json($media, 201);
		}
		
		public function show($id) {
			$media = Media::findOrFail($id);
			$media->url = $media->getUrl();
			
			if (Str::startsWith($media->mime_type, 'image/')) {
				$media->thumbnail = $media->getUrl('thumbnail');
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
		
		protected function generateThumbnail($media) {
			$path = Storage::disk($media->disk)->path($media->id . '/' . $media->file_name);
			
			// Generate thumbnail
			$image = Image::make($path);
			$image->fit(200, 200);
			
			// Create thumbnails directory if it doesn't exist
			$thumbnailPath = Storage::disk($media->disk)->path($media->id . '/conversions');
			if (!file_exists($thumbnailPath)) {
				mkdir($thumbnailPath, 0755, true);
			}
			
			// Save thumbnail
			$image->save($thumbnailPath . '/' . $media->name . '-thumbnail.jpg');
			
			// Add conversion to media record
			$conversions = $media->manipulations ?? [];
			$conversions['thumbnail'] = [
				'width'  => 200,
				'height' => 200,
				'fit'    => 'crop'
			];
			
			$media->manipulations = $conversions;
			$media->save();
		}
	}
