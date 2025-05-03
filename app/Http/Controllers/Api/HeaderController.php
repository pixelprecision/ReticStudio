<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HeaderComponent;
use App\Models\HeaderLayout;
use App\Models\HeaderSetting;
use App\Models\Menu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class HeaderController extends Controller
{
    /**
     * Get all header settings
     *
     * @return JsonResponse
     */
    public function getSettings(): JsonResponse
    {
        $settings = HeaderSetting::getActive();
        
        return response()->json([
            'success' => true,
            'settings' => $settings
        ]);
    }
    
    /**
     * Update header settings
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function updateSettings(Request $request): JsonResponse
    {
        // Log incoming request data
        \Log::info('HeaderController updateSettings request data:', $request->all());
        
        $validator = Validator::make($request->all(), [
            'site_name' => 'sometimes|string|max:255',
            'show_topbar' => 'sometimes|boolean',
            'topbar_message' => 'sometimes|nullable|string|max:255',
            'topbar_secondary_message' => 'sometimes|nullable|string|max:255',
            'topbar_badge_color' => [
                'sometimes', 'string',
                Rule::in(['badge-info', 'badge-success', 'badge-warning', 'badge-error', 'badge-neutral'])
            ],
            'show_search' => 'sometimes|boolean',
            'show_auth_buttons' => 'sometimes|boolean',
            'show_cart' => 'sometimes|boolean',
            'sticky_header' => 'sometimes|boolean',
            'header_style' => [
                'sometimes', 'string',
                Rule::in(['standard', 'centered', 'split'])
            ],
            'transparent_header' => 'sometimes|boolean',
            'mobile_menu_type' => [
                'sometimes', 'string',
                Rule::in(['drawer', 'dropdown'])
            ],
            'custom_header_classes' => 'sometimes|nullable|string',
            'custom_topbar_classes' => 'sometimes|nullable|string',
            'custom_subheader_classes' => 'sometimes|nullable|string',
            'custom_logo_classes' => 'sometimes|nullable|string',
            'custom_css' => 'sometimes|nullable|json',
        ]);
        
        if ($validator->fails()) {
            \Log::error('HeaderController updateSettings validation errors:', $validator->errors()->toArray());
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $settings = HeaderSetting::getActive();
        
        // Log current settings before update
        \Log::info('HeaderController settings before update:', $settings->toArray());
        
        // Handle boolean fields explicitly
        $data = $request->all();
        $booleanFields = ['show_topbar', 'show_search', 'show_auth_buttons', 'show_cart', 'sticky_header', 'transparent_header'];
        
		$setBooleanFields = [];
        foreach ($booleanFields as $field) {
            if (isset($data[$field])) {
				$setBooleanFields[] = $field;
                $data[$field] = filter_var($data[$field], FILTER_VALIDATE_BOOLEAN);
            }
        }
        
        $settings->update($data);
        
        // Log updated settings
        \Log::info('HeaderController settings after update:', $settings->fresh()->toArray());
        
        return response()->json([
			'request' => $request->all(),
			'setBooleanFields' => $setBooleanFields,
            'success' => true,
            'settings' => $settings->fresh(),
            'message' => 'Header settings updated successfully'
        ]);
    }
    
    /**
     * Upload logo
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function uploadLogo(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $settings = HeaderSetting::getActive();
        
        // Delete old logo if exists
        if ($settings->logo && Storage::disk('public')->exists($settings->logo)) {
            Storage::disk('public')->delete($settings->logo);
        }
        
        // Store the new logo
        $logoPath = $request->file('logo')->store('logos', 'public');
        $settings->update(['logo' => $logoPath]);
        
        return response()->json([
            'success' => true,
            'data' => [
                'logo' => $logoPath,
                'logo_url' => asset('storage/' . $logoPath)
            ],
            'message' => 'Logo uploaded successfully'
        ]);
    }
    
    /**
     * Upload favicon
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function uploadFavicon(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'favicon' => 'required|image|mimes:jpeg,png,jpg,gif,svg,ico|max:1024',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $settings = HeaderSetting::getActive();
        
        // Delete old favicon if exists
        if ($settings->favicon && Storage::disk('public')->exists($settings->favicon)) {
            Storage::disk('public')->delete($settings->favicon);
        }
        
        // Store the new favicon
        $faviconPath = $request->file('favicon')->store('favicons', 'public');
        $settings->update(['favicon' => $faviconPath]);
        
        return response()->json([
            'success' => true,
            'data' => [
                'favicon' => $faviconPath,
                'favicon_url' => asset('storage/' . $faviconPath)
            ],
            'message' => 'Favicon uploaded successfully'
        ]);
    }
    
    /**
     * Get all header layouts
     *
     * @return JsonResponse
     */
    public function getLayouts(): JsonResponse
    {
        $layouts = HeaderLayout::where('is_active', true)->get();
        
        return response()->json([
            'success' => true,
            'data' => $layouts
        ]);
    }
    
    /**
     * Get a specific header layout with components
     *
     * @param int $id
     * @return JsonResponse
     */
    public function getLayout($id): JsonResponse
    {
        $layout = HeaderLayout::with(['components' => function($query) {
            $query->orderBy('position')->orderBy('order');
        }])->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $layout
        ]);
    }
    
    /**
     * Create a new header layout
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function createLayout(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'layout_type' => [
                'required', 'string',
                Rule::in(['standard', 'custom'])
            ],
            'show_topbar' => 'boolean',
            'show_header' => 'boolean',
            'show_subheader' => 'boolean',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $layout = HeaderLayout::create($request->all());
        
        // Create default components if it's a standard layout
        if ($request->input('layout_type') === 'standard') {
            HeaderComponent::createDefaultComponents($layout);
        }
        
        return response()->json([
            'success' => true,
            'data' => $layout,
            'message' => 'Header layout created successfully'
        ]);
    }
    
    /**
     * Update a header layout
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function updateLayout(Request $request, $id): JsonResponse
    {
        $layout = HeaderLayout::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'layout_type' => [
                'sometimes', 'string',
                Rule::in(['standard', 'custom'])
            ],
            'show_topbar' => 'sometimes|boolean',
            'show_header' => 'sometimes|boolean',
            'show_subheader' => 'sometimes|boolean',
            'is_default' => 'sometimes|boolean',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        // If setting this layout as default, unset any other layouts
        if ($request->has('is_default') && $request->input('is_default')) {
            HeaderLayout::where('id', '!=', $id)
                ->where('is_default', true)
                ->update(['is_default' => false]);
        }
        
        $layout->update($request->all());
        
        return response()->json([
            'success' => true,
            'data' => $layout,
            'message' => 'Header layout updated successfully'
        ]);
    }
    
    /**
     * Delete a header layout
     *
     * @param int $id
     * @return JsonResponse
     */
    public function deleteLayout($id): JsonResponse
    {
        $layout = HeaderLayout::findOrFail($id);
        
        // Cannot delete the default layout
        if ($layout->is_default) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete the default layout'
            ], 422);
        }
        
        $layout->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Header layout deleted successfully'
        ]);
    }
    
    /**
     * Get all components for a layout
     *
     * @param int $layoutId
     * @return JsonResponse
     */
    public function getComponents($layoutId): JsonResponse
    {
        $components = HeaderComponent::where('header_layout_id', $layoutId)
            ->orderBy('position')
            ->orderBy('order')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $components
        ]);
    }
    
    /**
     * Create a new header component
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function createComponent(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => [
                'required', 'string',
                Rule::in(['logo', 'menu', 'search', 'auth', 'cart', 'custom'])
            ],
            'position' => [
                'required', 'string',
                Rule::in(['topbar', 'header', 'subheader'])
            ],
            'settings' => 'nullable|json',
            'header_layout_id' => 'required|exists:header_layouts,id',
            'custom_classes' => 'nullable|string',
            'visibility' => [
                'required', 'string',
                Rule::in(['all', 'desktop', 'mobile'])
            ],
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Set order to be the next available order for this position
        $maxOrder = HeaderComponent::where('header_layout_id', $request->input('header_layout_id'))
            ->where('position', $request->input('position'))
            ->max('order');
        
        $data = $request->all();
        $data['order'] = $maxOrder ? $maxOrder + 1 : 1;
        
        $component = HeaderComponent::create($data);
        
        return response()->json([
            'success' => true,
            'data' => $component,
            'message' => 'Header component created successfully'
        ]);
    }
    
    /**
     * Update a header component
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function updateComponent(Request $request, $id): JsonResponse
    {
        $component = HeaderComponent::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'type' => [
                'sometimes', 'string',
                Rule::in(['logo', 'menu', 'search', 'auth', 'cart', 'custom'])
            ],
            'position' => [
                'sometimes', 'string',
                Rule::in(['topbar', 'header', 'subheader'])
            ],
            'settings' => 'nullable|json',
            'is_active' => 'sometimes|boolean',
            'custom_classes' => 'nullable|string',
            'visibility' => [
                'sometimes', 'string',
                Rule::in(['all', 'desktop', 'mobile'])
            ],
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $component->update($request->all());
        
        return response()->json([
            'success' => true,
            'data' => $component,
            'message' => 'Header component updated successfully'
        ]);
    }
    
    /**
     * Delete a header component
     *
     * @param int $id
     * @return JsonResponse
     */
    public function deleteComponent($id): JsonResponse
    {
        $component = HeaderComponent::findOrFail($id);
        $component->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Header component deleted successfully'
        ]);
    }
    
    /**
     * Update component position
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function updateComponentPosition(Request $request, $id): JsonResponse
    {
        $component = HeaderComponent::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'position' => [
                'required', 'string',
                Rule::in(['topbar', 'header', 'subheader'])
            ]
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        // If position is changing, update the order to be the last in the new position
        if ($component->position !== $request->input('position')) {
            $maxOrder = HeaderComponent::where('header_layout_id', $component->header_layout_id)
                ->where('position', $request->input('position'))
                ->max('order');
            
            $component->update([
                'position' => $request->input('position'),
                'order' => $maxOrder ? $maxOrder + 1 : 1
            ]);
        }
        
        return response()->json([
            'success' => true,
            'data' => $component->fresh(),
            'message' => 'Component position updated successfully'
        ]);
    }
    
    /**
     * Reorder components
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function reorderComponents(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'components' => 'required|array',
            'components.*.id' => 'required|exists:header_components,id',
            'components.*.position' => [
                'required', 'string',
                Rule::in(['topbar', 'header', 'subheader'])
            ],
            'components.*.order' => 'required|integer|min:1',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        foreach ($request->input('components') as $item) {
            HeaderComponent::where('id', $item['id'])->update([
                'position' => $item['position'],
                'order' => $item['order'],
            ]);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Components reordered successfully'
        ]);
    }
    
    /**
     * Get available menus for header components
     *
     * @return JsonResponse
     */
    public function getAvailableMenus(): JsonResponse
    {
        $menus = Menu::select('id', 'name')->get();
        
        return response()->json([
            'success' => true,
            'data' => $menus
        ]);
    }
}
