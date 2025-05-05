<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\ProductReviewImage;
use App\Models\StoreSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ProductReviewController extends Controller
{
    /**
     * Display a listing of the reviews for admin.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = ProductReview::with(['product', 'user', 'images']);
        
        // Filter by product
        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }
        
        // Filter by approval status
        if ($request->has('is_approved')) {
            $query->where('is_approved', $request->boolean('is_approved'));
        }
        
        // Filter by verified purchase
        if ($request->has('is_verified_purchase')) {
            $query->where('is_verified_purchase', $request->boolean('is_verified_purchase'));
        }
        
        // Filter by rating
        if ($request->has('rating')) {
            $query->where('rating', $request->rating);
        }
        
        // Search by content or author
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }
        
        // Sort reviews
        $sortField = $request->input('sort_field', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        
        // Validate sort field
        $allowedSortFields = ['created_at', 'rating', 'name'];
        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'created_at';
        }
        
        $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        
        // Paginate results
        $perPage = $request->input('per_page', 15);
        $reviews = $query->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $reviews
        ]);
    }

    /**
     * Get reviews for a specific product (public facing).
     *
     * @param  int  $productId
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getProductReviews($productId, Request $request)
    {
        // Check if reviews are enabled
        $isReviewsEnabled = StoreSetting::getValue('enable_reviews', true);
        
        if (!$isReviewsEnabled) {
            return response()->json([
                'success' => false,
                'message' => 'Reviews are disabled'
            ], 403);
        }
        
        $product = Product::find($productId);
        
        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }
        
        $query = $product->reviews()
            ->with(['images'])
            ->where('is_approved', true);
        
        // Filter by rating
        if ($request->has('rating')) {
            $query->where('rating', $request->rating);
        }
        
        // Filter by verified purchase
        if ($request->has('verified_only') && $request->boolean('verified_only')) {
            $query->where('is_verified_purchase', true);
        }
        
        // Sort reviews
        $sortField = $request->input('sort', 'created_at');
        $sortDirection = $request->input('direction', 'desc');
        
        // Validate sort field
        $allowedSortFields = ['created_at', 'rating'];
        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'created_at';
        }
        
        $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        
        // Paginate results
        $perPage = $request->input('per_page', 10);
        $reviews = $query->paginate($perPage);
        
        // Calculate review stats
        $stats = [
            'average_rating' => $product->reviews()->where('is_approved', true)->avg('rating') ?: 0,
            'total_reviews' => $product->reviews()->where('is_approved', true)->count(),
            'rating_counts' => [
                '5' => $product->reviews()->where('is_approved', true)->where('rating', 5)->count(),
                '4' => $product->reviews()->where('is_approved', true)->where('rating', 4)->count(),
                '3' => $product->reviews()->where('is_approved', true)->where('rating', 3)->count(),
                '2' => $product->reviews()->where('is_approved', true)->where('rating', 2)->count(),
                '1' => $product->reviews()->where('is_approved', true)->where('rating', 1)->count(),
            ]
        ];
        
        return response()->json([
            'success' => true,
            'data' => $reviews,
            'stats' => $stats
        ]);
    }

    /**
     * Store a newly created review in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $productId
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request, $productId)
    {
        // Check if reviews are enabled
        $isReviewsEnabled = StoreSetting::getValue('enable_reviews', true);
        
        if (!$isReviewsEnabled) {
            return response()->json([
                'success' => false,
                'message' => 'Reviews are disabled'
            ], 403);
        }
        
        $product = Product::find($productId);
        
        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }
        
        // Check if anonymous reviews are allowed
        $allowAnonymous = StoreSetting::getValue('allow_anonymous_reviews', false);
        $userId = Auth::id();
        
        if (!$userId && !$allowAnonymous) {
            return response()->json([
                'success' => false,
                'message' => 'Anonymous reviews are not allowed. Please sign in to leave a review.'
            ], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'name' => 'required_without:user_id|string|max:255',
            'email' => 'required_without:user_id|email|max:255',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'rating' => 'required|integer|min:1|max:5',
            'images' => 'nullable|array',
            'images.*' => 'image|max:5120' // 5MB per image
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Check if review moderation is required
        $requireApproval = StoreSetting::getValue('require_review_approval', true);
        
        // Check if the user has already reviewed this product
        if ($userId) {
            $existingReview = ProductReview::where('product_id', $productId)
                ->where('user_id', $userId)
                ->first();
            
            if ($existingReview) {
                return response()->json([
                    'success' => false,
                    'message' => 'You have already reviewed this product'
                ], 422);
            }
        }
        
        try {
            $review = new ProductReview();
            $review->product_id = $productId;
            $review->user_id = $userId;
            $review->name = $request->name ?? Auth::user()->name;
            $review->email = $request->email ?? Auth::user()->email;
            $review->title = $request->title;
            $review->content = $request->content;
            $review->rating = $request->rating;
            $review->is_approved = !$requireApproval;
            
            // Check if verified purchase
            // This is a placeholder - in a real app, you would check order history
            $review->is_verified_purchase = false;
            
            $review->save();
            
            // Handle image uploads
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $index => $imageFile) {
                    $path = $imageFile->store('reviews/' . $review->id, 'public');
                    
                    $reviewImage = new ProductReviewImage([
                        'path' => $path,
                        'alt_text' => 'Review image ' . ($index + 1),
                        'sort_order' => $index
                    ]);
                    
                    $review->images()->save($reviewImage);
                }
            }
            
            return response()->json([
                'success' => true,
                'message' => $requireApproval 
                    ? 'Thank you for your review. It will be visible once approved by a moderator.' 
                    : 'Thank you for your review!',
                'data' => $review
            ], 201);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while submitting the review',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified review.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $review = ProductReview::with(['product', 'user', 'images'])->find($id);
        
        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Review not found'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $review
        ]);
    }

    /**
     * Update the specified review in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $review = ProductReview::find($id);
        
        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Review not found'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'title' => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'rating' => 'nullable|integer|min:1|max:5',
            'is_approved' => 'nullable|boolean',
            'is_verified_purchase' => 'nullable|boolean'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            $review->fill($request->all());
            $review->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Review updated successfully',
                'data' => $review
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating the review',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approve a review.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function approve($id)
    {
        $review = ProductReview::find($id);
        
        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Review not found'
            ], 404);
        }
        
        if ($review->is_approved) {
            return response()->json([
                'success' => true,
                'message' => 'Review is already approved',
                'data' => $review
            ]);
        }
        
        try {
            $review->is_approved = true;
            $review->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Review approved successfully',
                'data' => $review
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while approving the review',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Disapprove a review.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function disapprove($id)
    {
        $review = ProductReview::find($id);
        
        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Review not found'
            ], 404);
        }
        
        if (!$review->is_approved) {
            return response()->json([
                'success' => true,
                'message' => 'Review is already disapproved',
                'data' => $review
            ]);
        }
        
        try {
            $review->is_approved = false;
            $review->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Review disapproved successfully',
                'data' => $review
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while disapproving the review',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified review from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $review = ProductReview::find($id);
        
        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Review not found'
            ], 404);
        }
        
        try {
            // Delete associated images
            foreach ($review->images as $image) {
                if (\Storage::disk('public')->exists($image->path)) {
                    \Storage::disk('public')->delete($image->path);
                }
                $image->delete();
            }
            
            $review->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Review deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while deleting the review',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Restore a soft-deleted review.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function restore($id)
    {
        $review = ProductReview::withTrashed()->find($id);
        
        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Review not found'
            ], 404);
        }
        
        if (!$review->trashed()) {
            return response()->json([
                'success' => false,
                'message' => 'Review is not deleted'
            ], 422);
        }
        
        try {
            $review->restore();
            
            return response()->json([
                'success' => true,
                'message' => 'Review restored successfully',
                'data' => $review
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while restoring the review',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Restore a soft-deleted review image.
     *
     * @param  int  $reviewId
     * @param  int  $imageId
     * @return \Illuminate\Http\JsonResponse
     */
    public function restoreReviewImage($reviewId, $imageId)
    {
        $review = ProductReview::find($reviewId);
        
        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Review not found'
            ], 404);
        }
        
        $image = ProductReviewImage::withTrashed()
            ->where('id', $imageId)
            ->where('product_review_id', $reviewId)
            ->first();
        
        if (!$image) {
            return response()->json([
                'success' => false,
                'message' => 'Review image not found'
            ], 404);
        }
        
        if (!$image->trashed()) {
            return response()->json([
                'success' => false,
                'message' => 'Review image is not deleted'
            ], 422);
        }
        
        try {
            $image->restore();
            
            return response()->json([
                'success' => true,
                'message' => 'Review image restored successfully',
                'data' => $image
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while restoring the review image',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}