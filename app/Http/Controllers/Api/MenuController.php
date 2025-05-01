<?php
	// app/Http/Controllers/Api/MenuController.php
	
	namespace App\Http\Controllers\Api;
	
	use App\Http\Controllers\Controller;
	use App\Models\Menu;
	use Illuminate\Http\Request;
	use Illuminate\Support\Facades\Validator;
	use Illuminate\Support\Str;
	
	class MenuController extends Controller
	{
		public function __construct()
		{
		
		}
		
		public function index(Request $request)
		{
			$query = Menu::query()
			             ->with(['creator:id,name', 'editor:id,name']);
			
			if ($request->has('search')) {
				$search = $request->input('search');
				$query->where('name', 'like', "%{$search}%")
				      ->orWhere('slug', 'like', "%{$search}%");
			}
			
			if ($request->has('is_active')) {
				$query->where('is_active', $request->boolean('is_active'));
			}
			
			$menus = $query->orderBy('created_at', 'desc')
			               ->paginate($request->input('per_page', 15));
			
			return response()->json($menus);
		}
		
		public function store(Request $request)
		{
			$validator = Validator::make($request->all(), [
				'name' => 'required|string|max:255',
				'slug' => 'nullable|string|max:255|unique:menus,slug',
				'description' => 'nullable|string',
				'items' => 'required|array',
				'is_active' => 'boolean',
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
			
			$menu = Menu::create($data);
			
			return response()->json($menu->load(['creator:id,name']), 201);
		}
		
		public function show($id)
		{
			$menu = Menu::with(['creator:id,name', 'editor:id,name'])
			            ->findOrFail($id);
			
			return response()->json($menu);
		}
		
		public function update(Request $request, $id)
		{
			$menu = Menu::findOrFail($id);
			
			$validator = Validator::make($request->all(), [
				'name' => 'required|string|max:255',
				'slug' => 'nullable|string|max:255|unique:menus,slug,' . $id,
				'description' => 'nullable|string',
				'items' => 'required|array',
				'is_active' => 'boolean',
			]);
			
			if ($validator->fails()) {
				return response()->json(['errors' => $validator->errors()], 422);
			}
			
			$data = $validator->validated();
			
			if (empty($data['slug'])) {
				$data['slug'] = Str::slug($data['name']);
			}
			
			$data['updated_by'] = auth()->id();
			
			$menu->update($data);
			
			return response()->json($menu->fresh()->load(['creator:id,name', 'editor:id,name']));
		}
		
		public function destroy($id)
		{
			$menu = Menu::findOrFail($id);
			$menu->delete();
			
			return response()->json(['message' => 'Menu deleted successfully']);
		}
		
		public function getPublicMenu($slug)
		{
			$menu = Menu::where('slug', $slug)
			            ->where('is_active', true)
			            ->firstOrFail();
			
			// Return only the necessary data for public use
			return response()->json([
				'id' => $menu->id,
				'name' => $menu->name,
				'items' => $menu->items,
			]);
		}
	}
	
