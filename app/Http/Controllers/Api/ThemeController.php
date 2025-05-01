<?php
	// app/Http/Controllers/Api/ThemeController.php
	
	namespace App\Http\Controllers\Api;
	
	use App\Http\Controllers\Controller;
	use App\Models\Theme;
	use Illuminate\Http\Request;
	use Illuminate\Support\Facades\Validator;
	use Illuminate\Support\Str;
	
	class ThemeController extends Controller {
		public function __construct() {
		
		}
		
		public function index(Request $request) {
			$query = Theme::query()
			              ->with(['creator:id,name', 'editor:id,name']);
			
			if ($request->has('search')) {
				$search = $request->input('search');
				$query->where('name', 'like', "%{$search}%")
				      ->orWhere('slug', 'like', "%{$search}%");
			}
			
			if ($request->has('is_active')) {
				$query->where('is_active', $request->boolean('is_active'));
			}
			
			$themes = $query->orderBy('created_at', 'desc')
			                ->paginate($request->input('per_page', 15));
			
			return response()->json($themes);
		}
		
		public function store(Request $request) {
			$validator = Validator::make($request->all(), [
				'name'        => 'required|string|max:255',
				'slug'        => 'nullable|string|max:255|unique:themes,slug',
				'description' => 'nullable|string',
				'styles'      => 'required|array',
				'is_active'   => 'boolean',
			]);
			
			if ($validator->fails()) {
				return response()->json(['errors' => $validator->errors()], 422);
			}
			
			$data = $validator->validated();
			
			if (empty($data['slug'])) {
				$data['slug'] = Str::slug($data['name']);
			}
			
			$data['created_by'] = auth()->id();
			$data['updated_by'] = auth()->id();
			$data['is_system'] = false;
			
			// If this theme is set as active, deactivate other themes
			if ($data['is_active']) {
				Theme::where('is_active', true)->update(['is_active' => false]);
			}
			
			$theme = Theme::create($data);
			
			return response()->json($theme->load(['creator:id,name']), 201);
		}
		
		public function show($id) {
			$theme = Theme::with(['creator:id,name', 'editor:id,name'])
			              ->findOrFail($id);
			
			return response()->json($theme);
		}
		
		public function update(Request $request, $id) {
			$theme = Theme::findOrFail($id);
			
			// System themes cannot be fully modified
			if ($theme->is_system && !$request->only('is_active')) {
				return response()->json(['error' => 'System themes can only have their active status changed'], 403);
			}
			
			$validator = Validator::make($request->all(), [
				'name'        => 'required|string|max:255',
				'slug'        => 'nullable|string|max:255|unique:themes,slug,' . $id,
				'description' => 'nullable|string',
				'styles'      => 'required|array',
				'is_active'   => 'boolean',
			]);
			
			if ($validator->fails()) {
				return response()->json(['errors' => $validator->errors()], 422);
			}
			
			$data = $validator->validated();
			
			if (empty($data['slug'])) {
				$data['slug'] = Str::slug($data['name']);
			}
			
			$data['updated_by'] = auth()->id();
			
			// If this theme is set as active, deactivate other themes
			if ($data['is_active'] && !$theme->is_active) {
				Theme::where('is_active', true)->update(['is_active' => false]);
			}
			
			$theme->update($data);
			
			return response()->json($theme->fresh()->load(['creator:id,name', 'editor:id,name']));
		}
		
		public function activate($id) {
			$theme = Theme::findOrFail($id);
			
			// Deactivate all themes
			Theme::where('is_active', true)->update(['is_active' => false]);
			
			// Activate the selected theme
			$theme->update([
				'is_active'  => true,
				'updated_by' => auth()->id(),
			]);
			
			return response()->json(['message' => 'Theme activated successfully']);
		}
		
		public function destroy($id) {
			$theme = Theme::findOrFail($id);
			
			// System themes cannot be deleted
			if ($theme->is_system) {
				return response()->json(['error' => 'System themes cannot be deleted'], 403);
			}
			
			// Active themes cannot be deleted
			if ($theme->is_active) {
				return response()->json(['error' => 'Active themes cannot be deleted. Please activate another theme first.'], 403);
			}
			
			$theme->delete();
			
			return response()->json(['message' => 'Theme deleted successfully']);
		}
		
		public function getActiveTheme() {
			$theme = Theme::where('is_active', true)->first();
			
			if (!$theme) {
				return response()->json(['error' => 'No active theme found'], 404);
			}
			
			return response()->json($theme);
		}
	}
