<?php
// routes/api.php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PageController;
use App\Http\Controllers\Api\ComponentController;
use App\Http\Controllers\Api\FormController;
use App\Http\Controllers\Api\FormSubmissionController;
use App\Http\Controllers\Api\HeaderController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\ThemeController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\PluginController;
use App\Http\Controllers\Api\FooterController;
use App\Http\Controllers\Api\StoreSettingController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProductBrandController;
use App\Http\Controllers\Api\ProductCategoryController;
use App\Http\Controllers\Api\ProductVariantController;
use App\Http\Controllers\Api\ProductReviewController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CouponController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Authentication routes
Route::group(['prefix' => 'auth'], function () {
	Route::post('login', [AuthController::class, 'login']);
	Route::post('register', [AuthController::class, 'register']);
	Route::post('logout', [AuthController::class, 'logout']);
	Route::post('refresh', [AuthController::class, 'refresh']);
	Route::get('user-profile', [AuthController::class, 'userProfile']);
});

// Public routes
Route::get('forms/{slug}/public', [FormController::class, 'getPublicForm']);
Route::post('forms/{slug}/submit', [FormSubmissionController::class, 'submit']);
Route::get('menus/{slug}/public', [MenuController::class, 'getPublicMenu']);
Route::get('themes/active', [ThemeController::class, 'getActiveTheme']);
Route::get('themes/layout', [ThemeController::class, 'getLayoutForPageType']);
Route::get('pages/home', [PageController::class, 'getHomePage']);
Route::get('pages/by-slug/{slug}', [PageController::class, 'getPublicPage']);
Route::get('pages/preview/{slug}', [PageController::class, 'getPreviewPage']);
Route::get('pages/category', [PageController::class, 'getCategoryIndexPage']);
Route::get('pages/category/{slug}', [PageController::class, 'getCategoryPage']);
Route::get('pages/product/{slug}', [PageController::class, 'getProductPage']);


// Public GET endpoints for resources
Route::get('components', [ComponentController::class, 'index']);
Route::get('components/{id}', [ComponentController::class, 'show']);
Route::get('themes', [ThemeController::class, 'index']);
Route::get('themes/{id}', [ThemeController::class, 'show']);
Route::get('menus', [MenuController::class, 'index']);
Route::get('menus/{id}', [MenuController::class, 'show']);
Route::get('settings', [SettingController::class, 'index']);
Route::get('settings/{key}', [SettingController::class, 'show']);
Route::get('media', [MediaController::class, 'index']);
Route::get('media/{id}', [MediaController::class, 'show']);
Route::get('media-collections', [MediaController::class, 'collections']);
Route::get('plugins', [PluginController::class, 'index']);
Route::get('plugins/{id}', [PluginController::class, 'show']);

// Test Media Upload
Route::post('test-media-upload', [\App\Http\Controllers\Api\TestMediaController::class, 'test']);

// Header public routes
Route::get('header/settings', [HeaderController::class, 'getSettings']);
Route::get('header/layouts', [HeaderController::class, 'getLayouts']);
Route::get('header/layouts/{id}', [HeaderController::class, 'getLayout']);
Route::get('header/layouts/{layoutId}/components', [HeaderController::class, 'getComponents']);

// Footer public routes
Route::get('footer/settings', [FooterController::class, 'getSettings']);
Route::get('footer/layouts', [FooterController::class, 'getLayouts']);
Route::get('footer/layouts/{id}', [FooterController::class, 'getLayout']);
Route::get('footer/layouts/{layoutId}/components', [FooterController::class, 'getComponents']);
Route::get('footer/data', [FooterController::class, 'getFooterData']);

// Store public routes
Route::get('store/status', [StoreSettingController::class, 'isStoreEnabled']);
Route::get('store/settings', [StoreSettingController::class, 'index']);

// Product public routes
Route::get('products', [ProductController::class, 'index']);
Route::get('products/{id}', [ProductController::class, 'show']);
Route::get('products/slug/{slug}', [ProductController::class, 'showBySlug']);
Route::get('products/{id}/related', [ProductController::class, 'getRelatedProducts']);
Route::get('products/{id}/images', [ProductController::class, 'getImages']);
Route::get('products/search', [ProductController::class, 'search']);

// Product brand public routes
Route::get('product-brands', [ProductBrandController::class, 'index']);
Route::get('product-brands/{id}', [ProductBrandController::class, 'show']);
Route::get('product-brands/slug/{slug}', [ProductBrandController::class, 'showBySlug']);
Route::get('product-brands/list', [ProductBrandController::class, 'getBrandsList']);

// Product category public routes
Route::get('product-categories', [ProductCategoryController::class, 'index']);
Route::get('product-categories/{id}', [ProductCategoryController::class, 'show']);
Route::get('product-categories/slug/{slug}', [ProductCategoryController::class, 'showBySlug']);
Route::get('product-categories/tree', [ProductCategoryController::class, 'getTree']);
Route::get('product-categories/list', [ProductCategoryController::class, 'getCategoriesList']);
Route::get('product-categories/{id}/subcategories', [ProductCategoryController::class, 'getSubcategories']);
Route::get('product-categories/slug/{slug}/subcategories', [ProductCategoryController::class, 'getSubcategoriesBySlug']);

// Product review public routes
Route::get('products/{productId}/reviews', [ProductReviewController::class, 'getProductReviews']);
Route::post('products/{productId}/reviews', [ProductReviewController::class, 'store']);

// Cart routes
Route::get('cart', [CartController::class, 'getCart']);
Route::post('cart/items', [CartController::class, 'addItem']);
Route::put('cart/items/{itemId}', [CartController::class, 'updateItemQuantity']);
Route::delete('cart/items/{itemId}', [CartController::class, 'removeItem']);
Route::post('cart/clear', [CartController::class, 'clearCart']);
Route::post('cart/coupon', [CartController::class, 'applyCoupon']);
Route::delete('cart/coupon', [CartController::class, 'removeCoupon']);
Route::put('cart/notes', [CartController::class, 'updateNotes']);

// Coupon validation
Route::post('coupons/validate', [CouponController::class, 'validate']);

// Protected routes
Route::group(['middleware' => 'auth:api'], function () {
	// Header Settings
	Route::put('header/settings', [HeaderController::class, 'updateSettings']);
	Route::post('header/upload-logo', [HeaderController::class, 'uploadLogo']);
	Route::post('header/upload-favicon', [HeaderController::class, 'uploadFavicon']);
	
	// Header Layouts
	Route::post('header/layouts', [HeaderController::class, 'createLayout']);
	Route::put('header/layouts/{id}', [HeaderController::class, 'updateLayout']);
	Route::delete('header/layouts/{id}', [HeaderController::class, 'deleteLayout']);
	
	// Header Components
	Route::post('header/components', [HeaderController::class, 'createComponent']);
	Route::put('header/components/{id}', [HeaderController::class, 'updateComponent']);
	Route::delete('header/components/{id}', [HeaderController::class, 'deleteComponent']);
	Route::put('header/components/{id}/position', [HeaderController::class, 'updateComponentPosition']);
	Route::post('header/components/reorder', [HeaderController::class, 'reorderComponents']);
	Route::get('header/available-menus', [HeaderController::class, 'getAvailableMenus']);
	
	// Footer Settings
	Route::put('footer/settings', [FooterController::class, 'updateSettings']);
	Route::post('footer/upload-logo', [FooterController::class, 'uploadLogo']);
	
	// Footer Layouts
	Route::post('footer/layouts', [FooterController::class, 'createLayout']);
	Route::put('footer/layouts/{id}', [FooterController::class, 'updateLayout']);
	Route::delete('footer/layouts/{id}', [FooterController::class, 'deleteLayout']);
	
	// Footer Components
	Route::post('footer/components', [FooterController::class, 'createComponent']);
	Route::put('footer/components/{id}', [FooterController::class, 'updateComponent']);
	Route::delete('footer/components/{id}', [FooterController::class, 'deleteComponent']);
	Route::put('footer/components/{id}/position', [FooterController::class, 'updateComponentPosition']);
	Route::post('footer/components/reorder', [FooterController::class, 'reorderComponents']);
	Route::get('footer/available-menus', [FooterController::class, 'getAvailableMenus']);
	Route::get('footer/available-components', [FooterController::class, 'getAvailableComponents']);
	
	// Pages - Modified to exclude GET methods which are now public
	Route::get('pages', [PageController::class, 'index']);
	Route::post('pages', [PageController::class, 'store']);
	Route::put('pages/{id}', [PageController::class, 'update']);
	Route::get('pages/{id}', [PageController::class, 'show']);
	Route::delete('pages/{id}', [PageController::class, 'destroy']);
	Route::get('pages/{id}/revisions', [PageController::class, 'revisions']);
	Route::post('pages/{id}/revisions/{revisionId}/restore', [PageController::class, 'restoreRevision']);
	
	// Components - Modified to exclude GET methods which are now public
	Route::post('components', [ComponentController::class, 'store']);
	Route::put('components/{id}', [ComponentController::class, 'update']);
	Route::delete('components/{id}', [ComponentController::class, 'destroy']);
	
	// Forms - Modified to exclude GET methods which are now public
	Route::get('forms', [FormController::class, 'index']);
	Route::post('forms', [FormController::class, 'store']);
	Route::put('forms/{id}', [FormController::class, 'update']);
	Route::delete('forms/{id}', [FormController::class, 'destroy']);
	Route::get('forms/{formId}/submissions', [FormSubmissionController::class, 'index']);
	Route::get('forms/{formId}/submissions/{id}', [FormSubmissionController::class, 'show']);
	Route::post('forms/{formId}/submissions/{id}/mark-as-spam', [FormSubmissionController::class, 'markAsSpam']);
	Route::post('forms/{formId}/submissions/{id}/mark-as-not-spam', [FormSubmissionController::class, 'markAsNotSpam']);
	Route::delete('forms/{formId}/submissions/{id}', [FormSubmissionController::class, 'destroy']);
	Route::get('forms/{formId}/export', [FormSubmissionController::class, 'export']);
	
	// Settings - Modified to exclude GET methods which are now public
	Route::put('settings/{key}', [SettingController::class, 'update']);
	Route::post('settings/batch', [SettingController::class, 'updateBatch']);
	
	// Themes - Modified to exclude GET methods which are now public
	Route::post('themes', [ThemeController::class, 'store']);
	Route::put('themes/{id}', [ThemeController::class, 'update']);
	Route::delete('themes/{id}', [ThemeController::class, 'destroy']);
	Route::post('themes/{id}/activate', [ThemeController::class, 'activate']);
	
	// Media - Modified to exclude GET methods which are now public
	Route::post('media', [MediaController::class, 'store']);
	Route::put('media/{id}', [MediaController::class, 'update']);
	Route::delete('media/{id}', [MediaController::class, 'destroy']);
	Route::post('media-collections', [MediaController::class, 'createCollection']);
	Route::put('media-collections/{id}', [MediaController::class, 'updateCollection']);
	Route::delete('media-collections/{id}', [MediaController::class, 'deleteCollection']);
	
	// Menus - Modified to exclude GET methods which are now public
	Route::post('menus', [MenuController::class, 'store']);
	Route::put('menus/{id}', [MenuController::class, 'update']);
	Route::delete('menus/{id}', [MenuController::class, 'destroy']);
	
	// Plugins - Modified to exclude GET methods which are now public
	Route::post('plugins/{id}/activate', [PluginController::class, 'activate']);
	Route::post('plugins/{id}/deactivate', [PluginController::class, 'deactivate']);
	Route::put('plugins/{id}/configure', [PluginController::class, 'configure']);
	Route::post('plugins/install', [PluginController::class, 'install']);
	Route::delete('plugins/{id}', [PluginController::class, 'uninstall']);
	
	// Store Settings
	Route::put('store/settings', [StoreSettingController::class, 'update']);

	// Products Management
	Route::post('products', [ProductController::class, 'store']);
	Route::put('products/{id}', [ProductController::class, 'update']);
	Route::delete('products/{id}', [ProductController::class, 'destroy']);
	Route::post('products/{id}/images', [ProductController::class, 'uploadImage']);
	Route::post('products/{id}/attach-media', [ProductController::class, 'attachMedia']);
	Route::delete('products/{id}/images/{imageId}', [ProductController::class, 'deleteImage']);

	// Product Variants
	Route::get('products/{productId}/variants', [ProductVariantController::class, 'index']);
	Route::post('products/{productId}/variants', [ProductVariantController::class, 'store']);
	Route::get('products/{productId}/variants/{id}', [ProductVariantController::class, 'show']);
	Route::put('products/{productId}/variants/{id}', [ProductVariantController::class, 'update']);
	Route::delete('products/{productId}/variants/{id}', [ProductVariantController::class, 'destroy']);
	Route::put('products/{productId}/variants/{id}/inventory', [ProductVariantController::class, 'updateInventory']);

	// Product Brands Management
	Route::post('product-brands', [ProductBrandController::class, 'store']);
	Route::put('product-brands/{id}', [ProductBrandController::class, 'update']);
	Route::delete('product-brands/{id}', [ProductBrandController::class, 'destroy']);
	Route::post('product-brands/{id}/logo', [ProductBrandController::class, 'uploadLogo']);

	// Product Categories Management
	Route::post('product-categories', [ProductCategoryController::class, 'store']);
	Route::put('product-categories/{id}', [ProductCategoryController::class, 'update']);
	Route::delete('product-categories/{id}', [ProductCategoryController::class, 'destroy']);
	Route::post('product-categories/{id}/image', [ProductCategoryController::class, 'uploadImage']);

	// Product Reviews Management
	Route::get('reviews', [ProductReviewController::class, 'index']);
	Route::get('reviews/{id}', [ProductReviewController::class, 'show']);
	Route::put('reviews/{id}', [ProductReviewController::class, 'update']);
	Route::delete('reviews/{id}', [ProductReviewController::class, 'destroy']);
	Route::post('reviews/{id}/approve', [ProductReviewController::class, 'approve']);
	Route::post('reviews/{id}/disapprove', [ProductReviewController::class, 'disapprove']);

	// Customers Management
	Route::get('customers', [CustomerController::class, 'index']);
	Route::post('customers', [CustomerController::class, 'store']);
	Route::get('customers/{id}', [CustomerController::class, 'show']);
	Route::put('customers/{id}', [CustomerController::class, 'update']);
	Route::delete('customers/{id}', [CustomerController::class, 'destroy']);
	Route::get('customers/{id}/orders', [CustomerController::class, 'getOrders']);
	Route::post('customers/{id}/addresses', [CustomerController::class, 'addAddress']);
	Route::put('customers/{id}/addresses/{addressId}', [CustomerController::class, 'updateAddress']);
	Route::delete('customers/{id}/addresses/{addressId}', [CustomerController::class, 'deleteAddress']);
	Route::post('customers/import', [CustomerController::class, 'import']);
	Route::get('customers/export', [CustomerController::class, 'export']);

	// Orders Management
	Route::get('orders', [OrderController::class, 'index']);
	Route::post('orders', [OrderController::class, 'store']);
	Route::get('orders/{id}', [OrderController::class, 'show']);
	Route::get('orders/number/{orderNumber}', [OrderController::class, 'showByOrderNumber']);
	Route::put('orders/{id}', [OrderController::class, 'update']);
	Route::delete('orders/{id}', [OrderController::class, 'destroy']);
	Route::put('orders/{id}/status', [OrderController::class, 'updateStatus']);
	Route::put('orders/{id}/payment-status', [OrderController::class, 'updatePaymentStatus']);
	Route::put('orders/{id}/shipping', [OrderController::class, 'updateShipping']);
	Route::post('orders/{id}/notes', [OrderController::class, 'addNote']);
	Route::get('orders/export', [OrderController::class, 'export']);

	// Coupons Management
	Route::get('coupons', [CouponController::class, 'index']);
	Route::post('coupons', [CouponController::class, 'store']);
	Route::get('coupons/{id}', [CouponController::class, 'show']);
	Route::get('coupons/code/{code}', [CouponController::class, 'showByCode']);
	Route::put('coupons/{id}', [CouponController::class, 'update']);
	Route::delete('coupons/{id}', [CouponController::class, 'destroy']);
	Route::get('coupons/generate-code', [CouponController::class, 'generateCode']);
	
	// Restoration routes for soft-deleted items
	Route::post('orders/{id}/items/{itemId}/restore', [OrderController::class, 'restoreOrderItem']);
	Route::post('orders/{id}/transactions/{transactionId}/restore', [OrderController::class, 'restoreTransaction']);
	Route::post('carts/{id}/restore', [CartController::class, 'restoreCart']);
	Route::post('cart-items/{id}/restore', [CartController::class, 'restoreCartItem']);
	Route::post('products/{productId}/specifications/{specId}/restore', [ProductController::class, 'restoreSpecification']);
	Route::post('products/{productId}/videos/{videoId}/restore', [ProductController::class, 'restoreVideo']);
	Route::post('products/{productId}/images/{imageId}/restore', [ProductController::class, 'restoreImage']);
	Route::post('reviews/{reviewId}/images/{imageId}/restore', [ProductReviewController::class, 'restoreReviewImage']);
	Route::post('reviews/{id}/restore', [ProductReviewController::class, 'restore']);
	Route::post('store-settings/{id}/restore', [StoreSettingController::class, 'restore']);
	Route::post('product-brands/{id}/restore', [ProductBrandController::class, 'restore']);
	Route::post('product-categories/{id}/restore', [ProductCategoryController::class, 'restore']);
	Route::post('customers/{id}/restore', [CustomerController::class, 'restore']);
	Route::post('customers/{customerId}/addresses/{addressId}/restore', [CustomerController::class, 'restoreAddress']);
	Route::post('coupons/{id}/restore', [CouponController::class, 'restore']);
});