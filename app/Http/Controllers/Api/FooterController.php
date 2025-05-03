<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Component;
use App\Models\FooterComponent;
use App\Models\FooterLayout;
use App\Models\FooterSetting;
use App\Models\MediaOwner;
use App\Models\Menu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class FooterController extends Controller
{
    /**
     * Get all footer settings
     *
     * @return JsonResponse
     */
    public function getSettings(): JsonResponse
    {
        $settings = FooterSetting::getActive();
        
        return response()->json([
            'success' => true,
            'settings' => $settings
        ]);
    }
    
    /**
     * Update footer settings
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function updateSettings(Request $request): JsonResponse
    {
        \Log::info('FooterController updateSettings request data:', $request->all());
        
        $validator = Validator::make($request->all(), [
            'site_name' => 'sometimes|string|max:255',
            'copyright_text' => 'sometimes|nullable|string',
            'footer_style' => [
                'sometimes', 'string',
                Rule::in(['standard', 'centered', 'columns'])
            ],
            'position' => [
                'sometimes', 'string',
                Rule::in(['top', 'bottom'])
            ],
            'columns' => 'sometimes|integer|min:1|max:6',
            'show_footer' => 'sometimes|boolean',
            'show_footer_bar' => 'sometimes|boolean',
            'footer_bar_message' => 'sometimes|nullable|string|max:255',
            'footer_bar_badge_color' => 'sometimes|nullable|string',
            'footer_background_color' => 'sometimes|nullable|string',
            'footer_text_color' => 'sometimes|nullable|string',
            'show_social_icons' => 'sometimes|boolean',
            'social_links' => 'sometimes|nullable|json',
            'custom_css' => 'sometimes|nullable|string',
            'custom_footer_classes' => 'sometimes|nullable|string',
            'custom_footer_bar_classes' => 'sometimes|nullable|string',
            'custom_logo_classes' => 'sometimes|nullable|string',
        ]);
        
        if ($validator->fails()) {
            \Log::error('FooterController updateSettings validation errors:', $validator->errors()->toArray());
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $settings = FooterSetting::getActive();
        
        // Log current settings before update
        \Log::info('FooterController settings before update:', $settings->toArray());
        
        // Handle boolean fields explicitly
        $data = $request->all();
        $booleanFields = ['show_footer', 'show_footer_bar', 'show_social_icons'];
        
        $setBooleanFields = [];
        foreach ($booleanFields as $field) {
            if (isset($data[$field])) {
                $setBooleanFields[] = $field;
                $data[$field] = filter_var($data[$field], FILTER_VALIDATE_BOOLEAN);
            }
        }
        
        $settings->update($data);
        
        // Log updated settings
        \Log::info('FooterController settings after update:', $settings->fresh()->toArray());
        
        return response()->json([
            'request' => $request->all(),
            'setBooleanFields' => $setBooleanFields,
            'success' => true,
            'settings' => $settings->fresh(),
            'message' => 'Footer settings updated successfully'
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
        
        $settings = FooterSetting::getActive();
        $file = $request->file('logo');
        
        try {
            // Determine the collection name based on file type
            $collectionName = $this->determineCollectionName($file);
            
            // Get or create a MediaOwner to attach the media to
            $mediaOwner = MediaOwner::firstOrCreate(
                ['name' => 'Footer Logo'],
                [
                    'description' => 'Media owner for footer logos',
                    'created_by' => auth()->id() ?? 1,
                    'updated_by' => auth()->id() ?? 1,
                ]
            );
            
            // Delete old media associated with this logo if it exists
            if (!empty($settings->logo_media_id)) {
                $oldMedia = \Spatie\MediaLibrary\MediaCollections\Models\Media::find($settings->logo_media_id);
                if ($oldMedia) {
                    $oldMedia->delete();
                }
            }
            
            // Use the file's original name
            $name = 'Footer Logo - ' . date('Y-m-d H:i:s');
            
            // Add the media to the MediaOwner
            $media = $mediaOwner->addMedia($file)
                ->usingName($name)
                ->usingFileName($file->getClientOriginalName())
                ->toMediaCollection($collectionName);
            
            // Generate URL compatible with other parts of the app
            $mediaUrl = url('storage/' . $media->id . '/' . $media->file_name);
            
            // Update settings with new logo path
            $settings->update([
                'logo' => $mediaUrl, 
                'logo_media_id' => $media->id
            ]);
            
            // Add thumbnail URL for images
            $thumbnailUrl = null;
            if (Str::startsWith($media->mime_type, 'image/')) {
                $thumbnailUrl = url('storage/' . $media->id . '/conversions/' . pathinfo($media->file_name, PATHINFO_FILENAME) . '-thumbnail.jpg');
            }
            
            return response()->json([
                'success' => true,
                'data' => [
                    'media' => $media,
                    'logo' => $mediaUrl,
                    'logo_url' => $mediaUrl,
                    'thumbnail' => $thumbnailUrl,
                    'logo_media_id' => $media->id
                ],
                'message' => 'Logo uploaded successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('Error uploading footer logo: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload logo: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Determine the collection name based on file type
     *
     * @param \Illuminate\Http\UploadedFile $file
     * @return string
     */
    protected function determineCollectionName($file): string
    {
        $mimeType = $file->getMimeType();
        $extension = strtolower($file->getClientOriginalExtension());
        
        // Image types
        if (Str::startsWith($mimeType, 'image/')) {
            return 'images';
        }
        
        // Document types
        $documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt', 'ods', 'odp'];
        if (in_array($extension, $documentExtensions)) {
            return 'documents';
        }
        
        // Default to uploads for all other types
        return 'uploads';
    }
    
    /**
     * Get all footer layouts
     *
     * @return JsonResponse
     */
    public function getLayouts(): JsonResponse
    {
        $layouts = FooterLayout::where('is_active', true)->get();
        
        return response()->json([
            'success' => true,
            'data' => $layouts
        ]);
    }
    
    /**
     * Get a specific footer layout with components
     *
     * @param int $id
     * @return JsonResponse
     */
    public function getLayout($id): JsonResponse
    {
        $layout = FooterLayout::with(['components' => function($query) {
            $query->orderBy('position')->orderBy('order');
        }])->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $layout
        ]);
    }
    
    /**
     * Create a new footer layout
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
            'show_footer' => 'boolean',
            'show_footer_bar' => 'boolean',
            'columns' => 'integer|min:1|max:6',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $layout = FooterLayout::create($request->all());
        
        // Create default components if it's a standard layout
        if ($request->input('layout_type') === 'standard') {
            FooterComponent::createDefaultComponents($layout);
        }
        
        return response()->json([
            'success' => true,
            'data' => $layout,
            'message' => 'Footer layout created successfully'
        ]);
    }
    
    /**
     * Update a footer layout
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function updateLayout(Request $request, $id): JsonResponse
    {
        $layout = FooterLayout::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'layout_type' => [
                'sometimes', 'string',
                Rule::in(['standard', 'custom'])
            ],
            'show_footer' => 'sometimes|boolean',
            'show_footer_bar' => 'sometimes|boolean',
            'is_default' => 'sometimes|boolean',
            'columns' => 'sometimes|integer|min:1|max:6',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        // If setting this layout as default, unset any other layouts
        if ($request->has('is_default') && $request->input('is_default')) {
            FooterLayout::where('id', '!=', $id)
                ->where('is_default', true)
                ->update(['is_default' => false]);
        }
        
        $layout->update($request->all());
        
        return response()->json([
            'success' => true,
            'data' => $layout,
            'message' => 'Footer layout updated successfully'
        ]);
    }
    
    /**
     * Delete a footer layout
     *
     * @param int $id
     * @return JsonResponse
     */
    public function deleteLayout($id): JsonResponse
    {
        $layout = FooterLayout::findOrFail($id);
        
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
            'message' => 'Footer layout deleted successfully'
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
        $components = FooterComponent::where('footer_layout_id', $layoutId)
            ->orderBy('position')
            ->orderBy('order')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $components
        ]);
    }
    
    /**
     * Create a new footer component
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
                Rule::in(['logo', 'menu', 'text', 'social', 'contact', 'copyright', 'component', 'page_component'])
            ],
            'position' => 'required|string',
            'column' => 'nullable|integer|min:1',
            'settings' => 'nullable|json',
            'footer_layout_id' => 'required|exists:footer_layouts,id',
            'custom_classes' => 'nullable|string',
            'visibility' => [
                'required', 'string',
                Rule::in(['all', 'desktop', 'mobile'])
            ],
            'page_component_id' => 'nullable|exists:components,id',
            'page_component_data' => 'nullable|json',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Set order to be the next available order for this position
        $maxOrder = FooterComponent::where('footer_layout_id', $request->input('footer_layout_id'))
            ->where('position', $request->input('position'))
            ->max('order');
        
        $data = $request->all();
        $data['order'] = $maxOrder ? $maxOrder + 1 : 1;
        
        // Ensure settings is properly formatted as JSON
        if (isset($data['settings']) && is_array($data['settings'])) {
            $data['settings'] = json_encode($data['settings']);
        }
        
        // Ensure page_component_data is properly formatted as JSON
        if (isset($data['page_component_data']) && is_array($data['page_component_data'])) {
            $data['page_component_data'] = json_encode($data['page_component_data']);
        }
        
        $component = FooterComponent::create($data);
        
        return response()->json([
            'success' => true,
            'data' => $component,
            'message' => 'Footer component created successfully'
        ]);
    }
    
    /**
     * Update a footer component
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function updateComponent(Request $request, $id): JsonResponse
    {
        $component = FooterComponent::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'type' => [
                'sometimes', 'string',
                Rule::in(['logo', 'menu', 'text', 'social', 'contact', 'copyright', 'component', 'page_component'])
            ],
            'position' => 'sometimes|string',
            'column' => 'sometimes|nullable|integer|min:1',
            'settings' => 'sometimes|nullable|json',
            'is_active' => 'sometimes|boolean',
            'custom_classes' => 'nullable|string',
            'visibility' => [
                'sometimes', 'string',
                Rule::in(['all', 'desktop', 'mobile'])
            ],
            'page_component_id' => 'nullable|exists:components,id',
            'page_component_data' => 'nullable|json',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $data = $request->all();
        
        // Ensure settings is properly formatted as JSON
        if (isset($data['settings']) && is_array($data['settings'])) {
            $data['settings'] = json_encode($data['settings']);
        }
        
        // Ensure page_component_data is properly formatted as JSON
        if (isset($data['page_component_data']) && is_array($data['page_component_data'])) {
            $data['page_component_data'] = json_encode($data['page_component_data']);
        }
        
        $component->update($data);
        
        return response()->json([
            'success' => true,
            'data' => $component,
            'message' => 'Footer component updated successfully'
        ]);
    }
    
    /**
     * Delete a footer component
     *
     * @param int $id
     * @return JsonResponse
     */
    public function deleteComponent($id): JsonResponse
    {
        $component = FooterComponent::findOrFail($id);
        $component->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Footer component deleted successfully'
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
            'components.*.id' => 'required|exists:footer_components,id',
            'components.*.position' => 'required|string',
            'components.*.column' => 'nullable|integer|min:1',
            'components.*.order' => 'required|integer|min:1',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        foreach ($request->input('components') as $item) {
            FooterComponent::where('id', $item['id'])->update([
                'position' => $item['position'],
                'column' => $item['column'] ?? null,
                'order' => $item['order'],
            ]);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Components reordered successfully'
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
        $component = FooterComponent::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'position' => 'required|string',
            'column' => 'nullable|integer|min:1',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Find the highest order in the new position
        $maxOrder = FooterComponent::where('position', $request->input('position'))
            ->max('order');
        
        $component->update([
            'position' => $request->input('position'),
            'column' => $request->input('column'),
            'order' => $maxOrder ? $maxOrder + 1 : 1,
        ]);
        
        return response()->json([
            'success' => true,
            'data' => $component->fresh(),
            'message' => 'Component position updated successfully'
        ]);
    }
    
    /**
     * Get footer data
     *
     * @return JsonResponse
     */
    public function getFooterData(): JsonResponse
    {
        try {
            // Get the necessary data
            $settings = FooterSetting::getActive();
            $defaultLayout = FooterLayout::getDefault();
            
            // Get components with their related page components
            $components = $defaultLayout->activeComponents()->with('pageComponent')->get();
            
            Log::info('Components loaded:', ['count' => $components->count()]);
            
            // Add rendered page components data to each component
            foreach ($components as $component) {
                if ($component->type === 'page_component' && $component->page_component_id) {
                    if ($component->pageComponent) {
                        // Add component definition data to the component
                        $component->component_definition = $component->pageComponent;
                        Log::info('Found page component:', [
                            'id' => $component->id,
                            'page_component_id' => $component->page_component_id
                        ]);
                    } else {
                        Log::warning('Page component not found:', [
                            'component_id' => $component->id,
                            'page_component_id' => $component->page_component_id
                        ]);
                        // Set a placeholder to avoid null reference errors
                        $component->component_definition = null;
                    }
                } elseif ($component->type === 'component' && !empty($component->settings['component_id'])) {
                    // Support for legacy component reference via settings
                    $componentId = $component->settings['component_id'];
                    $pageComponent = Component::find($componentId);
                    
                    if ($pageComponent) {
                        $component->component_definition = $pageComponent;
                        Log::info('Found legacy component:', [
                            'id' => $component->id,
                            'component_id' => $componentId
                        ]);
                    } else {
                        Log::warning('Legacy component not found:', [
                            'component_id' => $component->id,
                            'referenced_id' => $componentId
                        ]);
                        // Set a placeholder to avoid null reference errors
                        $component->component_definition = null;
                    }
                }
            }
            
            $menus = Menu::all(['id', 'name', 'items']);
            
            // Get all available page components for the editor
            $pageComponents = Component::where('is_active', true)
                ->select('id', 'name', 'category', 'description', 'schema', 'slug')
                ->get();
            
            return response()->json([
                'success' => true,
                'settings' => $settings,
                'layout' => $defaultLayout,
                'components' => $components,
                'menus' => $menus,
                'pageComponents' => $pageComponents
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting footer data: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving footer data: ' . $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }
    
    /**
     * Get available menus for footer components
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
    
    /**
     * Get available page components
     *
     * @return JsonResponse
     */
    public function getAvailableComponents(): JsonResponse
    {
        $components = Component::where('is_active', true)
            ->select('id', 'name', 'category')
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $components
        ]);
    }
}
