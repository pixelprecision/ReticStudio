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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('customer_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            
            // Order details
            $table->enum('status', [
                'pending', 
                'processing', 
                'completed', 
                'shipped', 
                'cancelled', 
                'refunded', 
                'on_hold',
                'failed'
            ])->default('pending');
            
            // Financial details
            $table->string('currency')->default('USD');
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('tax_total', 10, 2)->default(0);
            $table->decimal('shipping_total', 10, 2)->default(0);
            $table->decimal('discount_total', 10, 2)->default(0);
            $table->decimal('grand_total', 10, 2)->default(0);
            
            // Payment details
            $table->string('payment_method')->nullable();
            $table->string('payment_status')->default('pending');
            $table->string('transaction_id')->nullable();
            
            // Customer details (in case customer is deleted)
            $table->string('customer_email')->nullable();
            $table->string('customer_name')->nullable();
            $table->string('customer_phone')->nullable();
            
            // Shipping details
            $table->string('shipping_method')->nullable();
            $table->decimal('shipping_cost', 10, 2)->default(0);
            $table->string('tracking_number')->nullable();
            $table->string('tracking_url')->nullable();
            
            // Dates
            $table->timestamp('payment_date')->nullable();
            $table->timestamp('shipped_date')->nullable();
            $table->timestamp('completed_date')->nullable();
            
            // Notes
            $table->text('customer_notes')->nullable();
            $table->text('admin_notes')->nullable();
            
            // Gift options
            $table->boolean('is_gift')->default(false);
            $table->text('gift_message')->nullable();
            $table->string('gift_wrapping')->nullable();
            $table->decimal('gift_wrapping_cost', 10, 2)->default(0);
            
            // IP and device info for fraud prevention
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
