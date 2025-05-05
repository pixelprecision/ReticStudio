<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\CustomerAddress;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class CustomerController extends Controller
{
    /**
     * Display a listing of the customers.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = Customer::with(['user']);
        
        // Filter by marketing acceptance
        if ($request->has('accepts_marketing')) {
            $query->where('accepts_marketing', $request->boolean('accepts_marketing'));
        }
        
        // Filter by tax exempt status
        if ($request->has('tax_exempt')) {
            $query->where('tax_exempt', $request->boolean('tax_exempt'));
        }
        
        // Filter by tags
        if ($request->has('tags')) {
            $tags = $request->tags;
            if (is_string($tags)) {
                $tags = explode(',', $tags);
            }
            
            $query->withTags($tags);
        }
        
        // Search by name or email
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }
        
        // Sort customers
        $sortField = $request->input('sort_field', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        
        // Validate sort field
        $allowedSortFields = ['first_name', 'last_name', 'email', 'created_at', 'total_spent', 'total_orders'];
        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'created_at';
        }
        
        $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        
        // Paginate results
        $perPage = $request->input('per_page', 15);
        $customers = $query->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $customers
        ]);
    }

    /**
     * Store a newly created customer in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:customers',
            'phone' => 'nullable|string|max:20',
            'accepts_marketing' => 'nullable|boolean',
            'notes' => 'nullable|string',
            'tags' => 'nullable|array',
            'tax_exempt' => 'nullable|boolean',
            'user_email' => 'nullable|email|max:255|unique:users,email',
            'password' => 'nullable|string|min:8|confirmed',
            'address' => 'nullable|array',
            'address.first_name' => 'required_with:address|string|max:255',
            'address.last_name' => 'required_with:address|string|max:255',
            'address.company' => 'nullable|string|max:255',
            'address.address1' => 'required_with:address|string|max:255',
            'address.address2' => 'nullable|string|max:255',
            'address.city' => 'required_with:address|string|max:100',
            'address.state' => 'required_with:address|string|max:100',
            'address.zip' => 'required_with:address|string|max:20',
            'address.country' => 'required_with:address|string|max:100',
            'address.phone' => 'nullable|string|max:20',
            'address.is_default' => 'nullable|boolean',
            'address.is_billing' => 'nullable|boolean',
            'address.is_shipping' => 'nullable|boolean'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        DB::beginTransaction();
        
        try {
            $user = null;
            
            // Create user account if password is provided
            if ($request->filled('password')) {
                $user = new User();
                $user->name = $request->first_name . ' ' . $request->last_name;
                $user->email = $request->user_email ?? $request->email;
                $user->password = Hash::make($request->password);
                $user->save();
            }
            
            // Create customer record
            $customer = new Customer();
            $customer->first_name = $request->first_name;
            $customer->last_name = $request->last_name;
            $customer->email = $request->email;
            $customer->phone = $request->phone;
            $customer->accepts_marketing = $request->boolean('accepts_marketing', false);
            $customer->notes = $request->notes;
            $customer->tags = $request->tags;
            $customer->tax_exempt = $request->boolean('tax_exempt', false);
            $customer->total_spent = 0;
            $customer->total_orders = 0;
            
            if ($user) {
                $customer->user_id = $user->id;
            }
            
            $customer->save();
            
            // Create address if provided
            if ($request->has('address')) {
                $address = new CustomerAddress();
                $address->customer_id = $customer->id;
                $address->first_name = $request->address['first_name'];
                $address->last_name = $request->address['last_name'];
                $address->company = $request->address['company'] ?? null;
                $address->address1 = $request->address['address1'];
                $address->address2 = $request->address['address2'] ?? null;
                $address->city = $request->address['city'];
                $address->state = $request->address['state'];
                $address->zip = $request->address['zip'];
                $address->country = $request->address['country'];
                $address->phone = $request->address['phone'] ?? null;
                $address->is_default = $request->address['is_default'] ?? true;
                $address->is_billing = $request->address['is_billing'] ?? true;
                $address->is_shipping = $request->address['is_shipping'] ?? true;
                $address->save();
                
                if ($address->is_default) {
                    $customer->default_address_id = $address->id;
                    $customer->save();
                }
            }
            
            DB::commit();
            
            // Reload the customer with relationships
            $customer = Customer::with(['user', 'addresses', 'defaultAddress'])->find($customer->id);
            
            return response()->json([
                'success' => true,
                'message' => 'Customer created successfully',
                'data' => $customer
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while creating the customer',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified customer.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $customer = Customer::with(['user', 'addresses', 'defaultAddress', 'orders' => function($query) {
            $query->latest()->limit(5);
        }])->find($id);
        
        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer not found'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $customer
        ]);
    }

    /**
     * Update the specified customer in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $customer = Customer::find($id);
        
        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer not found'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255|unique:customers,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'accepts_marketing' => 'nullable|boolean',
            'notes' => 'nullable|string',
            'tags' => 'nullable|array',
            'tax_exempt' => 'nullable|boolean'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            $customer->fill($request->all());
            $customer->save();
            
            // If user exists, update name and email
            if ($customer->user_id && $request->filled('email')) {
                $user = User::find($customer->user_id);
                if ($user) {
                    $user->name = $customer->first_name . ' ' . $customer->last_name;
                    $user->save();
                }
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Customer updated successfully',
                'data' => $customer
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating the customer',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified customer from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $customer = Customer::find($id);
        
        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer not found'
            ], 404);
        }
        
        DB::beginTransaction();
        
        try {
            // Delete addresses
            $customer->addresses()->delete();
            
            // Delete customer
            $customer->delete();
            
            // Note: We're not deleting the user account to maintain order history integrity
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Customer deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while deleting the customer',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Display customer orders.
     *
     * @param  int  $id
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getOrders($id, Request $request)
    {
        $customer = Customer::find($id);
        
        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer not found'
            ], 404);
        }
        
        $query = $customer->orders();
        
        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        // Sort orders
        $sortField = $request->input('sort_field', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        
        // Validate sort field
        $allowedSortFields = ['created_at', 'total_price', 'status'];
        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'created_at';
        }
        
        $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        
        // Paginate results
        $perPage = $request->input('per_page', 10);
        $orders = $query->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }
    
    /**
     * Create a new address for a customer.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function addAddress(Request $request, $id)
    {
        $customer = Customer::find($id);
        
        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer not found'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'address1' => 'required|string|max:255',
            'address2' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'zip' => 'required|string|max:20',
            'country' => 'required|string|max:100',
            'phone' => 'nullable|string|max:20',
            'is_default' => 'nullable|boolean',
            'is_billing' => 'nullable|boolean',
            'is_shipping' => 'nullable|boolean'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            $address = new CustomerAddress();
            $address->customer_id = $customer->id;
            $address->fill($request->all());
            $address->save();
            
            // Set as default if requested or if it's the first address
            if ($request->boolean('is_default', false) || $customer->addresses()->count() === 1) {
                $address->setAsDefault();
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Address added successfully',
                'data' => $address
            ], 201);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while adding the address',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Update a customer address.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @param  int  $addressId
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateAddress(Request $request, $id, $addressId)
    {
        $customer = Customer::find($id);
        
        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer not found'
            ], 404);
        }
        
        $address = $customer->addresses()->find($addressId);
        
        if (!$address) {
            return response()->json([
                'success' => false,
                'message' => 'Address not found'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'company' => 'nullable|string|max:255',
            'address1' => 'nullable|string|max:255',
            'address2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'zip' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'is_default' => 'nullable|boolean',
            'is_billing' => 'nullable|boolean',
            'is_shipping' => 'nullable|boolean'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            $address->fill($request->all());
            $address->save();
            
            // Set as default if requested
            if ($request->has('is_default') && $request->boolean('is_default')) {
                $address->setAsDefault();
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Address updated successfully',
                'data' => $address
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating the address',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Delete a customer address.
     *
     * @param  int  $id
     * @param  int  $addressId
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteAddress($id, $addressId)
    {
        $customer = Customer::find($id);
        
        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer not found'
            ], 404);
        }
        
        $address = $customer->addresses()->find($addressId);
        
        if (!$address) {
            return response()->json([
                'success' => false,
                'message' => 'Address not found'
            ], 404);
        }
        
        try {
            // Check if this is the default address
            $isDefault = $address->is_default;
            
            $address->delete();
            
            // If this was the default address, set a new default
            if ($isDefault) {
                $newDefault = $customer->addresses()->first();
                if ($newDefault) {
                    $newDefault->setAsDefault();
                }
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Address deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while deleting the address',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Import customers from CSV.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function import(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:csv,txt|max:10240', // 10MB max
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $file = $request->file('file');
        $path = $file->getRealPath();
        
        $data = [];
        $errors = [];
        $imported = 0;
        $skipped = 0;
        
        if (($handle = fopen($path, 'r')) !== false) {
            // Get header row
            $header = fgetcsv($handle, 1000, ',');
            $requiredColumns = ['first_name', 'last_name', 'email'];
            
            // Validate header
            foreach ($requiredColumns as $column) {
                if (!in_array($column, $header)) {
                    return response()->json([
                        'success' => false,
                        'message' => "Required column '{$column}' is missing from the CSV file"
                    ], 422);
                }
            }
            
            $lineNumber = 1; // Start from 1 to account for header row
            
            // Process rows
            while (($row = fgetcsv($handle, 1000, ',')) !== false) {
                $lineNumber++;
                
                if (count($row) !== count($header)) {
                    $errors[] = "Line {$lineNumber}: Column count mismatch";
                    $skipped++;
                    continue;
                }
                
                $rowData = array_combine($header, $row);
                
                // Validate required fields
                if (empty($rowData['first_name']) || empty($rowData['last_name']) || empty($rowData['email'])) {
                    $errors[] = "Line {$lineNumber}: Missing required fields";
                    $skipped++;
                    continue;
                }
                
                // Check if customer with this email already exists
                if (Customer::where('email', $rowData['email'])->exists()) {
                    $errors[] = "Line {$lineNumber}: Customer with email '{$rowData['email']}' already exists";
                    $skipped++;
                    continue;
                }
                
                try {
                    $customer = new Customer();
                    $customer->first_name = $rowData['first_name'];
                    $customer->last_name = $rowData['last_name'];
                    $customer->email = $rowData['email'];
                    $customer->phone = $rowData['phone'] ?? null;
                    $customer->notes = $rowData['notes'] ?? null;
                    $customer->accepts_marketing = isset($rowData['accepts_marketing']) && 
                        in_array(strtolower($rowData['accepts_marketing']), ['yes', 'true', '1']);
                    $customer->tax_exempt = isset($rowData['tax_exempt']) && 
                        in_array(strtolower($rowData['tax_exempt']), ['yes', 'true', '1']);
                    $customer->total_spent = 0;
                    $customer->total_orders = 0;
                    
                    // Handle tags if present
                    if (isset($rowData['tags']) && !empty($rowData['tags'])) {
                        $customer->tags = explode(',', $rowData['tags']);
                    }
                    
                    $customer->save();
                    
                    // Create address if all required fields are present
                    if (isset($rowData['address1']) && isset($rowData['city']) && 
                        isset($rowData['state']) && isset($rowData['zip']) && 
                        isset($rowData['country'])) {
                        
                        $address = new CustomerAddress();
                        $address->customer_id = $customer->id;
                        $address->first_name = $rowData['first_name'];
                        $address->last_name = $rowData['last_name'];
                        $address->company = $rowData['company'] ?? null;
                        $address->address1 = $rowData['address1'];
                        $address->address2 = $rowData['address2'] ?? null;
                        $address->city = $rowData['city'];
                        $address->state = $rowData['state'];
                        $address->zip = $rowData['zip'];
                        $address->country = $rowData['country'];
                        $address->phone = $rowData['phone'] ?? null;
                        $address->is_default = true;
                        $address->is_billing = true;
                        $address->is_shipping = true;
                        $address->save();
                        
                        $customer->default_address_id = $address->id;
                        $customer->save();
                    }
                    
                    $imported++;
                    
                } catch (\Exception $e) {
                    $errors[] = "Line {$lineNumber}: {$e->getMessage()}";
                    $skipped++;
                }
            }
            
            fclose($handle);
        }
        
        return response()->json([
            'success' => true,
            'message' => "Import completed: {$imported} customers imported, {$skipped} skipped",
            'imported' => $imported,
            'skipped' => $skipped,
            'errors' => $errors
        ]);
    }
    
    /**
     * Export customers to CSV.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\StreamedResponse
     */
    public function export(Request $request)
    {
        $query = Customer::with(['defaultAddress']);
        
        // Apply filters if needed
        if ($request->has('accepts_marketing')) {
            $query->where('accepts_marketing', $request->boolean('accepts_marketing'));
        }
        
        if ($request->has('tags')) {
            $tags = $request->tags;
            if (is_string($tags)) {
                $tags = explode(',', $tags);
            }
            
            $query->withTags($tags);
        }
        
        $customers = $query->get();
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="customers_' . date('Y-m-d') . '.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0'
        ];
        
        $columns = [
            'id', 'first_name', 'last_name', 'email', 'phone', 'accepts_marketing', 
            'tax_exempt', 'total_spent', 'total_orders', 'created_at',
            'address1', 'address2', 'city', 'state', 'zip', 'country', 'company', 'tags'
        ];
        
        $callback = function() use ($customers, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            
            foreach ($customers as $customer) {
                $address = $customer->defaultAddress;
                
                $row = [
                    $customer->id,
                    $customer->first_name,
                    $customer->last_name,
                    $customer->email,
                    $customer->phone,
                    $customer->accepts_marketing ? 'Yes' : 'No',
                    $customer->tax_exempt ? 'Yes' : 'No',
                    $customer->total_spent,
                    $customer->total_orders,
                    $customer->created_at,
                    $address ? $address->address1 : '',
                    $address ? $address->address2 : '',
                    $address ? $address->city : '',
                    $address ? $address->state : '',
                    $address ? $address->zip : '',
                    $address ? $address->country : '',
                    $address ? $address->company : '',
                    $customer->tags ? implode(',', $customer->tags) : ''
                ];
                
                fputcsv($file, $row);
            }
            
            fclose($file);
        };
        
        return response()->stream($callback, 200, $headers);
    }
    
    /**
     * Restore a soft-deleted customer.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function restore($id)
    {
        $customer = Customer::withTrashed()->find($id);
        
        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer not found'
            ], 404);
        }
        
        if (!$customer->trashed()) {
            return response()->json([
                'success' => false,
                'message' => 'Customer is not deleted'
            ], 422);
        }
        
        try {
            $customer->restore();
            
            return response()->json([
                'success' => true,
                'message' => 'Customer restored successfully',
                'data' => $customer
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while restoring the customer',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Restore a soft-deleted customer address.
     *
     * @param  int  $customerId
     * @param  int  $addressId
     * @return \Illuminate\Http\JsonResponse
     */
    public function restoreAddress($customerId, $addressId)
    {
        $customer = Customer::find($customerId);
        
        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer not found'
            ], 404);
        }
        
        $address = CustomerAddress::withTrashed()
            ->where('id', $addressId)
            ->where('customer_id', $customerId)
            ->first();
        
        if (!$address) {
            return response()->json([
                'success' => false,
                'message' => 'Address not found'
            ], 404);
        }
        
        if (!$address->trashed()) {
            return response()->json([
                'success' => false,
                'message' => 'Address is not deleted'
            ], 422);
        }
        
        try {
            $address->restore();
            
            return response()->json([
                'success' => true,
                'message' => 'Address restored successfully',
                'data' => $address
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while restoring the address',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}