<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('return_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_number')->unique();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('customer_id')->nullable()->constrained('users')->onDelete('set null');
            
            // Request details
            $table->enum('status', ['pending', 'approved', 'processing', 'completed', 'declined', 'cancelled'])->default('pending');
            $table->enum('return_type', ['refund', 'exchange', 'store_credit'])->default('refund');
            
            // Reason and description
            $table->string('reason'); // Defective, wrong item, etc.
            $table->text('description')->nullable();
            
            // Financial details
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->decimal('refunded_amount', 10, 2)->default(0);
            $table->decimal('store_credit_amount', 10, 2)->default(0);
            
            // Dates
            $table->timestamp('requested_date');
            $table->timestamp('processed_date')->nullable();
            $table->timestamp('completed_date')->nullable();
            
            // Return shipping information
            $table->boolean('requires_shipping')->default(true);
            $table->string('shipping_method')->nullable();
            $table->string('tracking_number')->nullable();
            $table->string('tracking_url')->nullable();
            $table->string('return_address')->nullable();
            $table->text('shipping_instructions')->nullable();
            
            // Admin notes
            $table->text('admin_notes')->nullable();
            
            $table->timestamps();
        });
        
        // Create return items table for individual items in a return
        Schema::create('return_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('return_request_id')->constrained()->onDelete('cascade');
            $table->foreignId('order_item_id')->constrained('order_items')->onDelete('cascade');
            $table->integer('quantity');
            $table->enum('reason', [
                'defective', 
                'wrong_item', 
                'not_as_described', 
                'damaged', 
                'changed_mind', 
                'other'
            ])->default('other');
            $table->text('comments')->nullable();
            $table->enum('status', ['pending', 'received', 'inspected', 'accepted', 'rejected'])->default('pending');
            $table->decimal('refund_amount', 10, 2)->default(0);
            $table->decimal('restocking_fee', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('return_items');
        Schema::dropIfExists('return_requests');
    }
};
