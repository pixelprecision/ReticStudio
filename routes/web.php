<?php
	
	use Illuminate\Support\Facades\Route;
	use App\Http\Controllers\Api\PageController;
	
	Route::get('/', function () {
		return view('admin');
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
	
	
