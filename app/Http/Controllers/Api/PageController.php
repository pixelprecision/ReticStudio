<?php
// app/Http/Controllers/Api/PageController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\PageRevision;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PageController extends Controller {
	public function __construct() {
	
	}
	
	public function index(Request $request) {
		$query = Page::query()
		             ->with(['creator:id,name', 'editor:id,name']);
		
		if ($request->has('search')) {
			$search = $request->input('search');
			$query->where('title', 'like', "%{$search}%")
			      ->orWhere('slug', 'like', "%{$search}%");
		}
		
		if ($request->has('is_published')) {
			$query->where('is_published', $request->boolean('is_published'));
		}
		
		$pages = $query->orderBy('created_at', 'desc')
		               ->paginate($request->input('per_page', 15));
		
		return response()->json($pages);
	}
	
	public function store(Request $request) {
		$validator = Validator::make($request->all(), [
			'title'            => 'required|string|max:255',
			'slug'             => 'nullable|string|max:255|unique:pages,slug',
			'description'      => 'nullable|string',
			'content'          => 'nullable|array',
			'meta_title'       => 'nullable|string|max:255',
			'meta_description' => 'nullable|string',
			'meta_keywords'    => 'nullable|string',
			'is_published'     => 'boolean',
		]);
		
		if ($validator->fails()) {
			return response()->json(['errors' => $validator->errors()], 422);
		}
		
		$data = $validator->validated();
		
		if (empty($data['slug'])) {
			$data['slug'] = Str::slug($data['title']);
		}
		
		$data['created_by'] = auth()->id();
		$data['updated_by'] = auth()->id();
		
		if ($data['is_published'] && empty($data['published_at'])) {
			$data['published_at'] = now();
		}
		
		$page = Page::create($data);
		
		// Create initial revision
		$page->createRevision();
		
		// Process featured image if present
		if ($request->hasFile('featured_image')) {
			$page->addMediaFromRequest('featured_image')
			     ->toMediaCollection('featured_image');
		}
		
		return response()->json($page->load(['creator:id,name']), 201);
	}
	
	public function show($id) {
		$page = Page::with(['creator:id,name', 'editor:id,name'])
		            ->findOrFail($id);
		
		// Include media URLs
		$page->featured_image_url = $page->getFirstMediaUrl('featured_image');
		
		return response()->json($page);
	}
	
	public function update(Request $request, $id) {
		$page = Page::findOrFail($id);
		
		$validator = Validator::make($request->all(), [
			'title'            => 'required|string|max:255',
			'slug'             => 'nullable|string|max:255|unique:pages,slug,' . $id,
			'description'      => 'nullable|string',
			'content'          => 'nullable|array',
			'meta_title'       => 'nullable|string|max:255',
			'meta_description' => 'nullable|string',
			'meta_keywords'    => 'nullable|string',
			'is_published'     => 'boolean',
		]);
		
		if ($validator->fails()) {
			return response()->json(['errors' => $validator->errors()], 422);
		}
		
		$data = $validator->validated();
		
		if (empty($data['slug'])) {
			$data['slug'] = Str::slug($data['title']);
		}
		
		// Create a revision before updating
		$page->createRevision();
		
		$data['updated_by'] = auth()->id();
		
		if (!$page->is_published && $data['is_published']) {
			$data['published_at'] = now();
		}
		
		$page->update($data);
		
		// Process featured image if present
		if ($request->hasFile('featured_image')) {
			$page->clearMediaCollection('featured_image');
			$page->addMediaFromRequest('featured_image')
			     ->toMediaCollection('featured_image');
		}
		
		return response()->json($page->load(['creator:id,name', 'editor:id,name']));
	}
	
	public function destroy($id) {
		$page = Page::findOrFail($id);
		$page->delete();
		
		return response()->json(['message' => 'Page deleted successfully']);
	}
	
	public function revisions($id) {
		$page = Page::findOrFail($id);
		$revisions = $page->revisions()
		                  ->with('creator:id,name')
		                  ->orderBy('created_at', 'desc')
		                  ->get();
		
		return response()->json($revisions);
	}
	
	public function restoreRevision(Request $request, $id, $revisionId) {
		$page = Page::findOrFail($id);
		$revision = PageRevision::where('page_id', $id)
		                        ->where('id', $revisionId)
		                        ->firstOrFail();
		
		// Create a new revision of the current state before restoring
		$page->createRevision();
		
		// Restore revision data
		$page->update([
			'title'            => $revision->title,
			'description'      => $revision->description,
			'content'          => $revision->content,
			'meta_title'       => $revision->meta_title,
			'meta_description' => $revision->meta_description,
			'meta_keywords'    => $revision->meta_keywords,
			'updated_by'       => auth()->id(),
		]);
		
		return response()->json($page->fresh()->load(['creator:id,name', 'editor:id,name']));
	}
	
	/**
	 * Get a published page by slug for public viewing
	 */
	public function getPublicPage($slug) {
		$page = Page::where('slug', $slug)
		            ->where('is_published', true)
		            ->first();
		            
		if (!$page) {
			return response()->json(['error' => 'Page not found'], 404);
		}
		
		// Include media URLs
		$page->featured_image_url = $page->getFirstMediaUrl('featured_image');
		
		return response()->json($page);
	}
	
	/**
	 * Preview a page by slug (can access unpublished pages)
	 */
	public function getPreviewPage($slug) {
		$page = Page::where('slug', $slug)->first();
		
		if (!$page) {
			return response()->json(['error' => 'Page not found'], 404);
		}
		
		// Include media URLs
		$page->featured_image_url = $page->getFirstMediaUrl('featured_image');
		
		return response()->json($page);
	}
}