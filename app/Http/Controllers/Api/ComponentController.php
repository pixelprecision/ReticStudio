<?php
	// app/Http/Controllers/Api/ComponentController.php
	
	namespace App\Http\Controllers\Api;
	
	use App\Http\Controllers\Controller;
	use App\Models\Component;
	use Illuminate\Http\Request;
	use Illuminate\Support\Facades\Validator;
	use Illuminate\Support\Str;
	
	class ComponentController extends Controller {
		public function __construct() {
		
		}
		
		public function index(Request $request) {
			$query = Component::query();
			
			if ($request->has('search')) {
				$search = $request->input('search');
				$query->where('name', 'like', "%{$search}%")
				      ->orWhere('slug', 'like', "%{$search}%");
			}
			
			if ($request->has('category')) {
				$query->where('category', $request->input('category'));
			}
			
			if ($request->has('is_active')) {
				$query->where('is_active', $request->boolean('is_active'));
			}
			
			$components = $query->orderBy('category')
			                    ->orderBy('name')
			                    ->paginate($request->input('per_page', 30));
			
			return response()->json($components);
		}
		
		public function store(Request $request) {
			$validator = Validator::make($request->all(), [
				'name'        => 'required|string|max:255',
				'slug'        => 'nullable|string|max:255|unique:components,slug',
				'description' => 'nullable|string',
				'category'    => 'required|string|max:255',
				'icon'        => 'nullable|string|max:255',
				'schema'      => 'required|array',
				'template'    => 'required|string',
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
			
			$component = Component::create($data);
			
			return response()->json($component, 201);
		}
		
		public function show($id) {
			$component = Component::with(['creator:id,name', 'editor:id,name'])
			                      ->findOrFail($id);
			
			return response()->json($component);
		}
		
		public function update(Request $request, $id) {
			$component = Component::findOrFail($id);
			
			// System components cannot be modified
			if ($component->is_system) {
				return response()->json(['error' => 'System components cannot be modified'], 403);
			}
			
			$validator = Validator::make($request->all(), [
				'name'        => 'required|string|max:255',
				'slug'        => 'nullable|string|max:255|unique:components,slug,' . $id,
				'description' => 'nullable|string',
				'category'    => 'required|string|max:255',
				'icon'        => 'nullable|string|max:255',
				'schema'      => 'required|array',
				'template'    => 'required|string',
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
			
			$component->update($data);
			
			return response()->json($component->fresh()->load(['creator:id,name', 'editor:id,name']));
		}
		
		public function destroy($id) {
			$component = Component::findOrFail($id);
			
			// System components cannot be deleted
			if ($component->is_system) {
				return response()->json(['error' => 'System components cannot be deleted'], 403);
			}
			
			$component->delete();
			
			return response()->json(['message' => 'Component deleted successfully']);
		}
	}
