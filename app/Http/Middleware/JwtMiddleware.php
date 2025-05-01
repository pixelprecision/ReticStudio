<?php
	// app/Http/Middleware/JwtMiddleware.php
	
	namespace App\Http\Middleware;
	
	use Closure;
	use Exception;
	use Illuminate\Http\Request;
	use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
	use PHPOpenSourceSaver\JWTAuth\Http\Middleware\BaseMiddleware;
	use Symfony\Component\HttpFoundation\Response;
	
	class JwtMiddleware extends BaseMiddleware
	{
		/**
		 * Handle an incoming request.
		 *
		 * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
		 */
		public function handle(Request $request, Closure $next): Response
		{
			try {
				$user = JWTAuth::parseToken()->authenticate();
				
				// Check if user is active
				if (!$user->is_active) {
					return response()->json(['error' => 'User account is inactive'], 401);
				}
			} catch (Exception $e) {
				if ($e instanceof \PHPOpenSourceSaver\JWTAuth\Exceptions\TokenInvalidException) {
					return response()->json(['error' => 'Token is invalid'], 401);
				} else if ($e instanceof \PHPOpenSourceSaver\JWTAuth\Exceptions\TokenExpiredException) {
					return response()->json(['error' => 'Token has expired'], 401);
				} else {
					return response()->json(['error' => 'Authorization token not found'], 401);
				}
			}
			
			return $next($request);
		}
	}
