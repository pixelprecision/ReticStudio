<?php
	
	// app/Http/Controllers/Api/AuthController.php
	
	namespace App\Http\Controllers\Api;
	
	use App\Http\Controllers\Controller;
	use App\Models\User;
	use Illuminate\Http\Request;
	use Illuminate\Support\Facades\Auth;
	use Illuminate\Support\Facades\Hash;
	use Illuminate\Support\Facades\Log;
	use Illuminate\Support\Facades\Validator;
	
	class AuthController extends Controller {
		/**
		 * Create a new AuthController instance.
		 *
		 * @return void
		 */
		public function __construct() {
		
		}
		
		/**
		 * Get a JWT via given credentials.
		 *
		 * @return \Illuminate\Http\JsonResponse
		 */
		public function login(Request $request) {
			$validator = Validator::make($request->all(), [
				'email'    => 'required|email',
				'password' => 'required|string|min:6',
			]);
			
			if ($validator->fails()) {
				return response()->json($validator->errors(), 422);
			}
			
			if (!$token = auth()->attempt($validator->validated())) {
				return response()->json(['error' => 'Invalid credentials'], 401);
			}
			
			// Update last login timestamp
			$user = auth()->user();
			$user->last_login_at = now();
			$user->save();
			
			return $this->respondWithToken($token);
		}
		
		/**
		 * Register a User.
		 *
		 * @return \Illuminate\Http\JsonResponse
		 */
		public function register(Request $request) {
			$validator = Validator::make($request->all(), [
				'name'     => 'required|string|between:2,100',
				'email'    => 'required|string|email|max:100|unique:users',
				'password' => 'required|string|confirmed|min:6',
			]);
			
			if ($validator->fails()) {
				return response()->json($validator->errors(), 400);
			}
			
			$user = User::create([
				'name'      => $request->name,
				'email'     => $request->email,
				'password'  => Hash::make($request->password),
				'is_active' => true,
			]);
			
			// Assign default role
			$user->assignRole('user');
			
			return response()->json([
				'message' => 'User successfully registered',
				'user'    => $user
			], 201);
		}
		
		/**
		 * Log the user out (Invalidate the token).
		 *
		 * @return \Illuminate\Http\JsonResponse
		 */
		public function logout() {
			auth()->logout();
			
			return response()->json(['message' => 'Successfully logged out']);
		}
		
		/**
		 * Refresh a token.
		 *
		 * @return \Illuminate\Http\JsonResponse
		 */
		public function refresh() {
			return $this->respondWithToken(auth()->refresh());
		}
		
		/**
		 * Get the authenticated User.
		 *
		 * @return \Illuminate\Http\JsonResponse
		 */
		public function userProfile() {
			$user = auth()->user();
			$user->load('roles:id,name');
			$user->avatar_url = $user->getFirstMediaUrl('avatar');
			
			return response()->json($user);
		}
		
		/**
		 * Get the token array structure.
		 *
		 * @param string $token
		 *
		 * @return \Illuminate\Http\JsonResponse
		 */
		protected function respondWithToken($token) {
			return response()->json([
				'access_token' => $token,
				'token_type'   => 'bearer',
				'expires_in'   => auth()->factory()->getTTL() * 60,
				'user'         => auth()->user()
			]);
		}
	}
	
	
	
	
