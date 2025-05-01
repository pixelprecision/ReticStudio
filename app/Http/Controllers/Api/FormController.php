<?php
	// app/Http/Controllers/Api/FormController.php
	
	namespace App\Http\Controllers\Api;
	
	use App\Http\Controllers\Controller;
	use App\Models\Form;
	use Illuminate\Http\Request;
	use Illuminate\Support\Facades\Validator;
	use Illuminate\Support\Str;
	
	class FormController extends Controller
	{
		public function __construct()
		{
		
		}
		
		public function index(Request $request)
		{
			$query = Form::query()
			             ->with(['creator:id,name', 'editor:id,name']);
			
			if ($request->has('search')) {
				$search = $request->input('search');
				$query->where('name', 'like', "%{$search}%")
				      ->orWhere('slug', 'like', "%{$search}%");
			}
			
			if ($request->has('is_active')) {
				$query->where('is_active', $request->boolean('is_active'));
			}
			
			$forms = $query->orderBy('created_at', 'desc')
			               ->paginate($request->input('per_page', 15));
			
			return response()->json($forms);
		}
		
		public function store(Request $request)
		{
			$validator = Validator::make($request->all(), [
				'name' => 'required|string|max:255',
				'slug' => 'nullable|string|max:255|unique:forms,slug',
				'description' => 'nullable|string',
				'schema' => 'required|array',
				'validation_rules' => 'nullable|array',
				'store_submissions' => 'boolean',
				'send_notifications' => 'boolean',
				'notification_emails' => 'nullable|string',
				'notification_template' => 'nullable|string',
				'enable_captcha' => 'boolean',
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
			
			$form = Form::create($data);
			
			return response()->json($form->load(['creator:id,name']), 201);
		}
		
		public function show($id)
		{
			$form = Form::with(['creator:id,name', 'editor:id,name'])
			            ->findOrFail($id);
			
			return response()->json($form);
		}
		
		public function update(Request $request, $id)
		{
			$form = Form::findOrFail($id);
			
			$validator = Validator::make($request->all(), [
				'name' => 'required|string|max:255',
				'slug' => 'nullable|string|max:255|unique:forms,slug,' . $id,
				'description' => 'nullable|string',
				'schema' => 'required|array',
				'validation_rules' => 'nullable|array',
				'store_submissions' => 'boolean',
				'send_notifications' => 'boolean',
				'notification_emails' => 'nullable|string',
				'notification_template' => 'nullable|string',
				'enable_captcha' => 'boolean',
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
			
			$form->update($data);
			
			return response()->json($form->fresh()->load(['creator:id,name', 'editor:id,name']));
		}
		
		public function destroy($id)
		{
			$form = Form::findOrFail($id);
			$form->delete();
			
			return response()->json(['message' => 'Form deleted successfully']);
		}
		
		public function getPublicForm($slug)
		{
			$form = Form::where('slug', $slug)
			            ->where('is_active', true)
			            ->firstOrFail();
			
			// Return only the necessary data for public use
			return response()->json([
				'id' => $form->id,
				'name' => $form->name,
				'description' => $form->description,
				'schema' => $form->schema,
				'enable_captcha' => $form->enable_captcha,
			]);
		}
	}
	
