<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PageController;

// Home page route
Route::get('/', function () {
	// Return the preview view which will load the homepage component
	return view('preview', ['isHomePage' => true]);
});

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/{slug}', function () {
	return view('preview');
})->where('any', '.*');

// Admin Routes - Serve the React SPA for any admin routes
Route::get('/admin/{any?}', function () {
	return view('admin');
})->where('any', '.*');

// Public Pages - Frontend viewing routes
Route::get('/preview/{slug}', function () {
	return view('preview');
})->where('any', '.*');
