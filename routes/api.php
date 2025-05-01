<?php
// routes/api.php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PageController;
use App\Http\Controllers\Api\ComponentController;
use App\Http\Controllers\Api\FormController;
use App\Http\Controllers\Api\FormSubmissionController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\ThemeController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\PluginController;

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
Route::get('pages/home', [PageController::class, 'getHomePage']);
Route::get('pages/by-slug/{slug}', [PageController::class, 'getPublicPage']);
Route::get('pages/preview/{slug}', [PageController::class, 'getPreviewPage']);

// Protected routes
Route::group(['middleware' => 'auth:api'], function () {
	// Pages
	Route::apiResource('pages', PageController::class);
	Route::get('pages/{id}/revisions', [PageController::class, 'revisions']);
	Route::post('pages/{id}/revisions/{revisionId}/restore', [PageController::class, 'restoreRevision']);

	// Components
	Route::apiResource('components', ComponentController::class);

	// Forms
	Route::apiResource('forms', FormController::class);
	Route::get('forms/{formId}/submissions', [FormSubmissionController::class, 'index']);
	Route::get('forms/{formId}/submissions/{id}', [FormSubmissionController::class, 'show']);
	Route::post('forms/{formId}/submissions/{id}/mark-as-spam', [FormSubmissionController::class, 'markAsSpam']);
	Route::post('forms/{formId}/submissions/{id}/mark-as-not-spam', [FormSubmissionController::class, 'markAsNotSpam']);
	Route::delete('forms/{formId}/submissions/{id}', [FormSubmissionController::class, 'destroy']);
	Route::get('forms/{formId}/export', [FormSubmissionController::class, 'export']);

	// Settings
	Route::get('settings', [SettingController::class, 'index']);
	Route::get('settings/{key}', [SettingController::class, 'show']);
	Route::put('settings/{key}', [SettingController::class, 'update']);
	Route::post('settings/batch', [SettingController::class, 'updateBatch']);

	// Themes
	Route::apiResource('themes', ThemeController::class);
	Route::post('themes/{id}/activate', [ThemeController::class, 'activate']);

	// Media
	Route::get('media', [MediaController::class, 'index']);
	Route::post('media', [MediaController::class, 'store']);
	Route::get('media/{id}', [MediaController::class, 'show']);
	Route::put('media/{id}', [MediaController::class, 'update']);
	Route::delete('media/{id}', [MediaController::class, 'destroy']);
	Route::get('media-collections', [MediaController::class, 'collections']);
	Route::post('media-collections', [MediaController::class, 'createCollection']);
	Route::put('media-collections/{id}', [MediaController::class, 'updateCollection']);
	Route::delete('media-collections/{id}', [MediaController::class, 'deleteCollection']);

	// Menus
	Route::apiResource('menus', MenuController::class);

	// Plugins
	Route::get('plugins', [PluginController::class, 'index']);
	Route::get('plugins/{id}', [PluginController::class, 'show']);
	Route::post('plugins/{id}/activate', [PluginController::class, 'activate']);
	Route::post('plugins/{id}/deactivate', [PluginController::class, 'deactivate']);
	Route::put('plugins/{id}/configure', [PluginController::class, 'configure']);
	Route::post('plugins/install', [PluginController::class, 'install']);
	Route::delete('plugins/{id}', [PluginController::class, 'uninstall']);
});
