<?php
	namespace App\Http\Controllers\Api;
	
	use App\Http\Controllers\Controller;
	use App\Models\Plugin;
	use Illuminate\Http\Request;
	use Illuminate\Support\Facades\Validator;
	use Illuminate\Support\Str;
	
	class PluginController extends Controller
	{
		public function __construct()
		{
		
		}
		
		public function index(Request $request)
		{
			$query = Plugin::query()
			               ->with(['activator:id,name']);
			
			if ($request->has('search')) {
				$search = $request->input('search');
				$query->where('name', 'like', "%{$search}%")
				      ->orWhere('slug', 'like', "%{$search}%");
			}
			
			if ($request->has('is_active')) {
				$query->where('is_active', $request->boolean('is_active'));
			}
			
			$plugins = $query->orderBy('created_at', 'desc')
			                 ->paginate($request->input('per_page', 15));
			
			return response()->json($plugins);
		}
		
		public function show($id)
		{
			$plugin = Plugin::with(['activator:id,name'])
			                ->findOrFail($id);
			
			return response()->json($plugin);
		}
		
		public function activate($id)
		{
			$plugin = Plugin::findOrFail($id);
			
			// Check if plugin is already active
			if ($plugin->is_active) {
				return response()->json(['message' => 'Plugin is already active']);
			}
			
			// Implement plugin activation logic here
			$plugin->is_active = true;
			$plugin->activated_by = auth()->id();
			$plugin->activated_at = now();
			$plugin->save();
			
			return response()->json(['message' => 'Plugin activated successfully']);
		}
		
		public function deactivate($id)
		{
			$plugin = Plugin::findOrFail($id);
			
			// Check if plugin is system plugin that cannot be deactivated
			if ($plugin->is_system) {
				return response()->json(['error' => 'System plugins cannot be deactivated'], 403);
			}
			
			// Check if plugin is already inactive
			if (!$plugin->is_active) {
				return response()->json(['message' => 'Plugin is already inactive']);
			}
			
			// Implement plugin deactivation logic here
			$plugin->is_active = false;
			$plugin->save();
			
			return response()->json(['message' => 'Plugin deactivated successfully']);
		}
		
		public function configure(Request $request, $id)
		{
			$plugin = Plugin::findOrFail($id);
			
			$validator = Validator::make($request->all(), [
				'config' => 'required|array',
			]);
			
			if ($validator->fails()) {
				return response()->json(['errors' => $validator->errors()], 422);
			}
			
			$plugin->config = $request->input('config');
			$plugin->save();
			
			return response()->json($plugin);
		}
		
		public function install(Request $request)
		{
			// This would typically handle plugin installation from a file or marketplace
			// Implementation depends on how plugins are distributed
			
			// For now, we'll just create a new plugin entry
			$validator = Validator::make($request->all(), [
				'name' => 'required|string|max:255',
				'slug' => 'nullable|string|max:255|unique:plugins,slug',
				'description' => 'nullable|string',
				'version' => 'required|string|max:50',
				'config' => 'nullable|array',
			]);
			
			if ($validator->fails()) {
				return response()->json(['errors' => $validator->errors()], 422);
			}
			
			$data = $validator->validated();
			
			if (empty($data['slug'])) {
				$data['slug'] = Str::slug($data['name']);
			}
			
			$data['is_active'] = false;
			$data['is_system'] = false;
			
			$plugin = Plugin::create($data);
			
			return response()->json($plugin, 201);
		}
		
		public function uninstall($id)
		{
			$plugin = Plugin::findOrFail($id);
			
			// System plugins cannot be uninstalled
			if ($plugin->is_system) {
				return response()->json(['error' => 'System plugins cannot be uninstalled'], 403);
			}
			
			// Active plugins cannot be uninstalled
			if ($plugin->is_active) {
				return response()->json(['error' => 'Active plugins cannot be uninstalled. Please deactivate first.'], 403);
			}
			
			// Implement plugin uninstallation logic here
			$plugin->delete();
			
			return response()->json(['message' => 'Plugin uninstalled successfully']);
		}
	}
