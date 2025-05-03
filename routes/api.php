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
});