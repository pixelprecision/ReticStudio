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
				'layout'           => 'nullable|string',
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
				'layout'           => 'nullable|string',
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
				'layout'           => $revision->layout,
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
	 * Get the category index page (all categories)
	 */
	public function getCategoryIndexPage() {
		$page = Page::where('page_type', 'category')
					->where('is_published', true)
					->first();
					
		if (!$page) {
			// Create a virtual page for the category index
			$page = new Page();
			$page->title = 'Product Categories';
			$page->slug = 'category';
			$page->description = 'Browse all product categories';
			$page->page_type = 'category_index';
			$page->is_published = true;
			
			// Add a default category grid component
			$page->content = [
				[
					'id' => 'category-grid-' . uniqid(),
					'type' => 'category-grid',
					'props' => [
						'title' => 'Product Categories',
						'subtitle' => 'Browse our wide range of categories',
						'columns' => 3,
						'showDescription' => true,
						'showCount' => true
					]
				]
			];
		}
		
		return response()->json($page);
	}
	
	/**
	 * Get a single category page
	 */
	public function getCategoryPage($slug) {
		// First check if we have a specific page for this category
		$page = Page::where('slug', 'category/' . $slug)
					->where('is_published', true)
					->first();
					
		if (!$page) {
			// Look for a category template page
			$templatePage = Page::where('page_type', 'category_template')
								->where('is_published', true)
								->first();
			
			if (!$templatePage) {
				// Create a virtual category page
				$page = new Page();
				$page->title = ucwords(str_replace('-', ' ', $slug));
				$page->slug = 'category/' . $slug;
				$page->description = 'Products in the ' . ucwords(str_replace('-', ' ', $slug)) . ' category';
				$page->page_type = 'category_single';
				$page->is_published = true;
				
				// Add default product grid component for this category
				$page->content = [
					[
						'id' => 'product-grid-' . uniqid(),
						'type' => 'product-grid',
						'props' => [
							'title' => 'Products in ' . ucwords(str_replace('-', ' ', $slug)),
							'subtitle' => 'Browse products in this category',
							'columns' => 3,
							'categorySlug' => $slug,
							'showPagination' => true,
							'perPage' => 12
						]
					]
				];
			} else {
				// Use the template but customize for this category
				$page = $templatePage->replicate();
				$page->title = ucwords(str_replace('-', ' ', $slug));
				$page->slug = 'category/' . $slug;
				$page->description = 'Products in the ' . ucwords(str_replace('-', ' ', $slug)) . ' category';
				$page->page_type = 'category_single';
				
				// Replace category placeholders in the content
				$content = $page->content;
				foreach ($content as &$component) {
					if ($component['type'] === 'product-grid') {
						$component['props']['categorySlug'] = $slug;
						$component['props']['title'] = 'Products in ' . ucwords(str_replace('-', ' ', $slug));
					}
				}
				$page->content = $content;
			}
		}
		
		$page->category_slug = $slug;
		
		return response()->json($page);
	}
	
	/**
	 * Get the product page
	 */
	public function getProductPage($slug) {
		// First check if we have a specific page for this product
		$page = Page::where('slug', 'product/' . $slug)
					->where('is_published', true)
					->first();
					
		if (!$page) {
			// Look for a product template page
			$templatePage = Page::where('page_type', 'product_template')
								->where('is_published', true)
								->first();
			
			if (!$templatePage) {
				// Create a virtual product page
				$page = new Page();
				$page->title = ucwords(str_replace('-', ' ', $slug));
				$page->slug = 'product/' . $slug;
				$page->description = ucwords(str_replace('-', ' ', $slug)) . ' product details';
				$page->page_type = 'product_single';
				$page->is_published = true;
				
				// Add default product page component
				$page->content = [
					[
						'id' => 'product-page-' . uniqid(),
						'type' => 'product-page',
						'props' => [
							'slug' => $slug,
							'showRelatedProducts' => true,
							'showQuantitySelector' => true,
							'showBrand' => true,
							'showCategory' => true,
							'showSKU' => true,
							'showShortDescription' => true,
							'tabSections' => true
						]
					]
				];
			} else {
				// Use the template but customize for this product
				$page = $templatePage->replicate();
				$page->title = ucwords(str_replace('-', ' ', $slug));
				$page->slug = 'product/' . $slug;
				$page->description = ucwords(str_replace('-', ' ', $slug)) . ' product details';
				$page->page_type = 'product_single';
				
				// Replace product placeholders in the content
				$content = $page->content;
				foreach ($content as &$component) {
					if ($component['type'] === 'product-page') {
						$component['props']['slug'] = $slug;
					}
				}
				$page->content = $content;
			}
		}
		
		$page->product_slug = $slug;
		
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

	/**
	 * Get the homepage (either a page with slug 'home' or the first published page)
	 */
	public function getHomePage() {
		$page = Page::where('slug', 'home')
		            ->where('is_published', true)
		            ->first();

		// If no specific home page exists, get the first published page
		if (!$page) {
			$page = Page::where('is_published', true)
			            ->orderBy('created_at', 'asc')
			            ->first();
		}

		if (!$page) {
			return response()->json(['error' => 'No published pages found'], 404);
		}

		// Include media URLs
		$page->featured_image_url = $page->getFirstMediaUrl('featured_image');

		return response()->json($page);
	}
}
