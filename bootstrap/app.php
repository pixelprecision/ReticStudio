<?php
	// bootstrap/app.php
	
	use Illuminate\Foundation\Application;
	use Illuminate\Foundation\Configuration\Exceptions;
	use Illuminate\Foundation\Configuration\Middleware;
	use App\Http\Middleware\JwtMiddleware;
	use Spatie\Permission\Middlewares\RoleMiddleware;
	use Spatie\Permission\Middlewares\PermissionMiddleware;
	use Spatie\Permission\Middlewares\RoleOrPermissionMiddleware;
	
	return Application::configure(basePath: dirname(__DIR__))
	                  ->withRouting(
		                  web: __DIR__ . '/../routes/web.php',
		                  api: __DIR__ . '/../routes/api.php',
		                  commands: __DIR__ . '/../routes/console.php',
		                  health: '/up',
	                  )
	                  ->withMiddleware(function (Middleware $middleware) {
		                  // Global Middleware
		                  //$middleware->append(JwtMiddleware::class);
		                  
		                  // Define middleware aliases
		                  $middleware->alias([
			                  'jwt.auth'           => JwtMiddleware::class,
			                  'jwt.refresh'        => \PHPOpenSourceSaver\JWTAuth\Http\Middleware\RefreshToken::class,
			                  'role'               => RoleMiddleware::class,
			                  'permission'         => PermissionMiddleware::class,
			                  'role_or_permission' => RoleOrPermissionMiddleware::class,
		                  ]);
		                  
		                  // API middleware group
		                  $middleware->group('api', [
			                  \Illuminate\Routing\Middleware\SubstituteBindings::class,
		                  ]);
		                  
		                  // Web middleware group
		                  $middleware->group('web', [
			                  \Illuminate\Cookie\Middleware\EncryptCookies::class,
			                  \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
			                  \Illuminate\Session\Middleware\StartSession::class,
			                  \Illuminate\View\Middleware\ShareErrorsFromSession::class,
			                  \Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
			                  \Illuminate\Routing\Middleware\SubstituteBindings::class,
		                  ]);
		                  
		                  // Set middleware priority
		                  $middleware->priority([
			                  \Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests::class,
			                  \Illuminate\Cookie\Middleware\EncryptCookies::class,
			                  \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
			                  \Illuminate\Session\Middleware\StartSession::class,
			                  \Illuminate\View\Middleware\ShareErrorsFromSession::class,
			                  \Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
			                  \Illuminate\Routing\Middleware\ThrottleRequests::class,
			                  \Illuminate\Routing\Middleware\ThrottleRequestsWithRedis::class,
			                  \Illuminate\Routing\Middleware\SubstituteBindings::class,
			                  \Illuminate\Contracts\Auth\Middleware\AuthenticatesRequests::class,
			                  \Illuminate\Auth\Middleware\Authorize::class,
			                  JwtMiddleware::class,
		                  ]);
	                  })
	                  ->withExceptions(function (Exceptions $exceptions) {
		                  //
	                  })->create();
