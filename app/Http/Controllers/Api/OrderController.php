<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Customer;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StoreSetting;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    /**
     * Display a listing of the orders.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = Order::with(['user', 'orderItems']);
        
        // Filter by status
        if ($request->has('status') && !empty($request->status)) {
            $query->withStatus($request->status);
        }
        
        // Filter by payment status
        if ($request->has('payment_status') && !empty($request->payment_status)) {
            $query->where('payment_status', $request->payment_status);
        }
        
        // Filter by customer
        if ($request->has('user_id') && !empty($request->user_id)) {
            $query->where('user_id', $request->user_id);
        }
        
        // Filter by date range
        if ($request->has('date_from') && !empty($request->date_from)) {
            $query->where('created_at', '>=', $request->date_from);
        }
        
        if ($request->has('date_to') && !empty($request->date_to)) {
            $query->where('created_at', '<=', $request->date_to);
        }
        
        // Search by order number, customer name, or email
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('billing_name', 'like', "%{$search}%")
                  ->orWhere('billing_email', 'like', "%{$search}%")
                  ->orWhere('shipping_name', 'like', "%{$search}%")
                  ->orWhere('shipping_email', 'like', "%{$search}%");
            });
        }
        
        // Sort orders
        $sortField = $request->input('sort_field', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        
        // Validate sort field
        $allowedSortFields = ['created_at', 'order_number', 'total_price', 'status'];
        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'created_at';
        }
        
        $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        
        // Paginate results
        $perPage = $request->input('per_page', 15);
        $orders = $query->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * Store a newly created order in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'nullable|exists:users,id',
            'status' => 'required|string|max:50',
            'total_price' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'shipping_cost' => 'nullable|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'billing_name' => 'required|string|max:255',
            'billing_email' => 'required|email|max:255',
            'billing_phone' => 'nullable|string|max:20',
            'billing_address' => 'required|string|max:255',
            'billing_city' => 'required|string|max:100',
            'billing_state' => 'required|string|max:100',
            'billing_zip' => 'required|string|max:20',
            'billing_country' => 'required|string|max:100',
            'shipping_name' => 'required|string|max:255',
            'shipping_email' => 'required|email|max:255',
            'shipping_phone' => 'nullable|string|max:20',
            'shipping_address' => 'required|string|max:255',
            'shipping_city' => 'required|string|max:100',
            'shipping_state' => 'required|string|max:100',
            'shipping_zip' => 'required|string|max:20',
            'shipping_country' => 'required|string|max:100',
            'shipping_method' => 'nullable|string|max:100',
            'payment_method' => 'required|string|max:100',
            'payment_status' => 'required|string|max:50',
            'notes' => 'nullable|string',
            'gift_message' => 'nullable|string',
            'coupon_code' => 'nullable|string|max:50',
            'order_items' => 'required|array',
            'order_items.*.product_id' => 'required|exists:products,id',
            'order_items.*.product_variant_id' => 'nullable|exists:product_variants,id',
            'order_items.*.name' => 'required|string|max:255',
            'order_items.*.sku' => 'nullable|string|max:100',
            'order_items.*.price' => 'required|numeric|min:0',
            'order_items.*.quantity' => 'required|integer|min:1',
            'order_items.*.subtotal' => 'required|numeric|min:0',
            'order_items.*.discount' => 'nullable|numeric|min:0',
            'order_items.*.tax' => 'nullable|numeric|min:0',
            'order_items.*.total' => 'required|numeric|min:0',
            'order_items.*.options' => 'nullable|array'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        DB::beginTransaction();
        
        try {
            // Generate unique order number
            $orderPrefix = StoreSetting::getValue('order_prefix', 'ORD-');
            $orderNumber = $orderPrefix . strtoupper(Str::random(8));
            
            // Check if order number exists
            while (Order::where('order_number', $orderNumber)->exists()) {
                $orderNumber = $orderPrefix . strtoupper(Str::random(8));
            }
            
            // Create order
            $order = new Order();
            $order->order_number = $orderNumber;
            $order->fill($request->except('order_items'));
            $order->ip_address = $request->ip();
            $order->user_agent = $request->header('User-Agent');
            
            if ($request->status === Order::STATUS_COMPLETED) {
                $order->completed_at = now();
            }
            
            $order->save();
            
            // Create order items
            foreach ($request->order_items as $itemData) {
                $item = new OrderItem();
                $item->order_id = $order->id;
                $item->fill($itemData);
                $item->save();
                
                // Update product inventory if needed
                if ($itemData['product_variant_id']) {
                    $variant = ProductVariant::find($itemData['product_variant_id']);
                    if ($variant && $variant->inventory_management !== 'none') {
                        $variant->inventory_quantity -= $itemData['quantity'];
                        $variant->save();
                    }
                } else {
                    $product = Product::find($itemData['product_id']);
                    if ($product && $product->track_inventory) {
                        $product->inventory_level -= $itemData['quantity'];
                        $product->save();
                    }
                }
            }
            
            // Update customer stats if applicable
            if ($order->user_id) {
                $customer = Customer::where('user_id', $order->user_id)->first();
                if ($customer) {
                    $customer->updateOrderStats($order);
                }
            }
            
            DB::commit();
            
            // Reload the order with relationships
            $order = Order::with(['orderItems'])->find($order->id);
            
            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => $order
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while creating the order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified order.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $order = Order::with(['orderItems', 'transactions', 'user'])->find($id);
        
        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    /**
     * Display the specified order by order number.
     *
     * @param  string  $orderNumber
     * @return \Illuminate\Http\JsonResponse
     */
    public function showByOrderNumber($orderNumber)
    {
        $order = Order::with(['orderItems', 'transactions', 'user'])
            ->where('order_number', $orderNumber)
            ->first();
        
        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    /**
     * Update the specified order in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $order = Order::find($id);
        
        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'status' => 'nullable|string|max:50',
            'tax' => 'nullable|numeric|min:0',
            'shipping_cost' => 'nullable|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'billing_name' => 'nullable|string|max:255',
            'billing_email' => 'nullable|email|max:255',
            'billing_phone' => 'nullable|string|max:20',
            'billing_address' => 'nullable|string|max:255',
            'billing_city' => 'nullable|string|max:100',
            'billing_state' => 'nullable|string|max:100',
            'billing_zip' => 'nullable|string|max:20',
            'billing_country' => 'nullable|string|max:100',
            'shipping_name' => 'nullable|string|max:255',
            'shipping_email' => 'nullable|email|max:255',
            'shipping_phone' => 'nullable|string|max:20',
            'shipping_address' => 'nullable|string|max:255',
            'shipping_city' => 'nullable|string|max:100',
            'shipping_state' => 'nullable|string|max:100',
            'shipping_zip' => 'nullable|string|max:20',
            'shipping_country' => 'nullable|string|max:100',
            'shipping_method' => 'nullable|string|max:100',
            'payment_method' => 'nullable|string|max:100',
            'payment_status' => 'nullable|string|max:50',
            'tracking_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'gift_message' => 'nullable|string'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            $wasCompleted = ($order->status === Order::STATUS_COMPLETED);
            
            $order->fill($request->all());
            
            // Set completed_at if status changed to completed
            if (!$wasCompleted && $request->filled('status') && $request->status === Order::STATUS_COMPLETED) {
                $order->completed_at = now();
            }
            
            $order->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Order updated successfully',
                'data' => $order
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating the order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update order status.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateStatus(Request $request, $id)
    {
        $order = Order::find($id);
        
        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'status' => 'required|string|max:50'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            $wasCompleted = ($order->status === Order::STATUS_COMPLETED);
            
            $order->status = $request->status;
            
            // Set completed_at if status changed to completed
            if (!$wasCompleted && $request->status === Order::STATUS_COMPLETED) {
                $order->completed_at = now();
            }
            
            $order->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Order status updated successfully',
                'data' => $order
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating the order status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update order payment status.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updatePaymentStatus(Request $request, $id)
    {
        $order = Order::find($id);
        
        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'payment_status' => 'required|string|max:50',
            'transaction_id' => 'nullable|string|max:255',
            'amount' => 'nullable|numeric|min:0',
            'gateway' => 'nullable|string|max:100',
            'gateway_transaction_id' => 'nullable|string|max:255'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        DB::beginTransaction();
        
        try {
            $order->payment_status = $request->payment_status;
            $order->save();
            
            // Create transaction record if provided
            if ($request->filled('transaction_id')) {
                $transaction = new Transaction();
                $transaction->order_id = $order->id;
                $transaction->transaction_id = $request->transaction_id;
                $transaction->type = Transaction::TYPE_SALE;
                $transaction->payment_method = $order->payment_method;
                $transaction->amount = $request->amount ?? $order->total_price;
                $transaction->currency = 'USD'; // Assuming USD as default
                $transaction->status = $request->payment_status === Order::PAYMENT_PAID
                    ? Transaction::STATUS_SUCCESS
                    : Transaction::STATUS_FAILED;
                $transaction->gateway = $request->gateway ?? 'manual';
                $transaction->gateway_transaction_id = $request->gateway_transaction_id;
                $transaction->save();
            }
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Order payment status updated successfully',
                'data' => $order
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating the payment status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update shipping information.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateShipping(Request $request, $id)
    {
        $order = Order::find($id);
        
        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'shipping_method' => 'nullable|string|max:100',
            'tracking_number' => 'nullable|string|max:100',
            'shipping_name' => 'nullable|string|max:255',
            'shipping_email' => 'nullable|email|max:255',
            'shipping_phone' => 'nullable|string|max:20',
            'shipping_address' => 'nullable|string|max:255',
            'shipping_city' => 'nullable|string|max:100',
            'shipping_state' => 'nullable|string|max:100',
            'shipping_zip' => 'nullable|string|max:20',
            'shipping_country' => 'nullable|string|max:100'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            $order->fill($request->all());
            $order->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Shipping information updated successfully',
                'data' => $order
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating shipping information',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add a note to an order.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function addNote(Request $request, $id)
    {
        $order = Order::find($id);
        
        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'note' => 'required|string'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            $notes = $order->notes ? $order->notes . "\n\n" : '';
            $notes .= date('Y-m-d H:i:s') . ': ' . $request->note;
            
            $order->notes = $notes;
            $order->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Note added successfully',
                'data' => $order
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while adding the note',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified order from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $order = Order::find($id);
        
        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }
        
        DB::beginTransaction();
        
        try {
            // Delete order items
            $order->orderItems()->delete();
            
            // Delete transactions
            $order->transactions()->delete();
            
            // Delete order
            $order->delete();
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Order deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while deleting the order',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Export orders to CSV.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\StreamedResponse
     */
    public function export(Request $request)
    {
        $query = Order::with(['orderItems']);
        
        // Apply filters
        if ($request->has('status')) {
            $query->withStatus($request->status);
        }
        
        if ($request->has('date_from')) {
            $query->where('created_at', '>=', $request->date_from);
        }
        
        if ($request->has('date_to')) {
            $query->where('created_at', '<=', $request->date_to);
        }
        
        $orders = $query->get();
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="orders_' . date('Y-m-d') . '.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0'
        ];
        
        $columns = [
            'Order Number', 'Date', 'Status', 'Payment Status', 'Customer Name', 'Email',
            'Total', 'Subtotal', 'Tax', 'Shipping', 'Discount', 'Items', 'Shipping Method',
            'Tracking Number', 'Shipping Address', 'Billing Address'
        ];
        
        $callback = function() use ($orders, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            
            foreach ($orders as $order) {
                $items = $order->orderItems->map(function($item) {
                    return $item->quantity . 'x ' . $item->name;
                })->implode(', ');
                
                $shippingAddress = implode(', ', [
                    $order->shipping_name,
                    $order->shipping_address,
                    $order->shipping_city,
                    $order->shipping_state,
                    $order->shipping_zip,
                    $order->shipping_country
                ]);
                
                $billingAddress = implode(', ', [
                    $order->billing_name,
                    $order->billing_address,
                    $order->billing_city,
                    $order->billing_state,
                    $order->billing_zip,
                    $order->billing_country
                ]);
                
                $row = [
                    $order->order_number,
                    $order->created_at->format('Y-m-d H:i:s'),
                    $order->status,
                    $order->payment_status,
                    $order->billing_name,
                    $order->billing_email,
                    $order->total_price,
                    $order->subtotal,
                    $order->tax,
                    $order->shipping_cost,
                    $order->discount_amount,
                    $items,
                    $order->shipping_method,
                    $order->tracking_number,
                    $shippingAddress,
                    $billingAddress
                ];
                
                fputcsv($file, $row);
            }
            
            fclose($file);
        };
        
        return response()->stream($callback, 200, $headers);
    }
    
    /**
     * Restore a soft-deleted transaction.
     *
     * @param  int  $id
     * @param  int  $transactionId
     * @return \Illuminate\Http\JsonResponse
     */
    public function restoreTransaction($id, $transactionId)
    {
        $order = Order::find($id);
        
        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }
        
        $transaction = Transaction::withTrashed()->where('id', $transactionId)->where('order_id', $id)->first();
        
        if (!$transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction not found'
            ], 404);
        }
        
        if (!$transaction->trashed()) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction is not deleted'
            ], 422);
        }
        
        try {
            $transaction->restore();
            
            return response()->json([
                'success' => true,
                'message' => 'Transaction restored successfully',
                'data' => $transaction
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while restoring the transaction',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Restore a soft-deleted order item.
     *
     * @param  int  $id
     * @param  int  $itemId
     * @return \Illuminate\Http\JsonResponse
     */
    public function restoreOrderItem($id, $itemId)
    {
        $order = Order::find($id);
        
        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }
        
        $orderItem = OrderItem::withTrashed()->where('id', $itemId)->where('order_id', $id)->first();
        
        if (!$orderItem) {
            return response()->json([
                'success' => false,
                'message' => 'Order item not found'
            ], 404);
        }
        
        if (!$orderItem->trashed()) {
            return response()->json([
                'success' => false,
                'message' => 'Order item is not deleted'
            ], 422);
        }
        
        try {
            $orderItem->restore();
            
            return response()->json([
                'success' => true,
                'message' => 'Order item restored successfully',
                'data' => $orderItem
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while restoring the order item',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
