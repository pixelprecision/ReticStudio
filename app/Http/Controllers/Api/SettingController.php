<?php
	
	// app/Http/Controllers/Api/SettingController.php
	
	namespace App\Http\Controllers\Api;
	
	use App\Http\Controllers\Controller;
	use App\Models\Setting;
	use Illuminate\Http\Request;
	use Illuminate\Support\Facades\Cache;
	use Illuminate\Support\Facades\Validator;
	
	class SettingController extends Controller {
		public function __construct() {
		
		}
		
		public function index(Request $request) {
			// Get settings by group
			if ($request->has('group')) {
				$settings = Setting::where('group', $request->input('group'))->get();
			}
			else {
				$settings = Setting::all();
			}
			
			// Format settings as key-value pairs
			$formattedSettings = $settings->groupBy('group')->map(function ($group) {
				return $group->pluck('value', 'key');
			});
			
			return response()->json($formattedSettings);
		}
		
		public function show($key) {
			$setting = Setting::where('key', $key)->firstOrFail();
			
			return response()->json($setting);
		}
		
		public function update(Request $request, $key) {
			$setting = Setting::where('key', $key)->firstOrFail();
			
			// System settings might have specific validation rules
			$validationRules = [
				'value' => $this->getValidationRule($setting),
			];
			
			$validator = Validator::make($request->all(), $validationRules);
			
			if ($validator->fails()) {
				return response()->json(['errors' => $validator->errors()], 422);
			}
			
			$setting->value = $request->input('value');
			$setting->updated_by = auth()->id();
			$setting->save();
			
			// Clear settings cache
			Cache::forget('settings');
			
			return response()->json($setting);
		}
		
		public function updateBatch(Request $request) {
			$data = $request->all();
			
			foreach ($data as $key => $value) {
				$setting = Setting::where('key', $key)->first();
				
				if ($setting) {
					$setting->value = $value;
					$setting->updated_by = auth()->id();
					$setting->save();
				}
			}
			
			// Clear settings cache
			Cache::forget('settings');
			
			return response()->json(['message' => 'Settings updated successfully']);
		}
		
		private function getValidationRule($setting) {
			// Define specific rules based on setting type or key
			switch ($setting->type) {
				case 'email':
					return 'required|email';
				case 'url':
					return 'required|url';
				case 'integer':
					return 'required|integer';
				case 'boolean':
					return 'required|boolean';
				case 'array':
				case 'json':
					return 'required|array';
				default:
					return 'required';
			}
		}
	}
	
	
	
