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
        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            
            // Shipment details
            $table->string('shipment_number')->unique();
            $table->enum('status', ['pending', 'processing', 'shipped', 'delivered', 'failed', 'cancelled'])->default('pending');
            
            // Shipping information
            $table->string('carrier')->nullable(); // UPS, FedEx, USPS, etc.
            $table->string('shipping_method')->nullable();
            $table->string('tracking_number')->nullable();
            $table->string('tracking_url')->nullable();
            
            // Dates
            $table->timestamp('shipped_date')->nullable();
            $table->timestamp('estimated_delivery_date')->nullable();
            $table->timestamp('delivered_date')->nullable();
            
            // Package details
            $table->decimal('total_weight', 10, 2)->nullable();
            $table->string('dimensions')->nullable(); // formatted as "LxWxH"
            $table->integer('package_count')->default(1);
            
            // Address
            $table->string('recipient_name')->nullable();
            $table->text('shipping_address')->nullable(); // Serialized or formatted address
            
            // Notes
            $table->text('admin_notes')->nullable();
            $table->text('customer_notes')->nullable();
            
            $table->timestamps();
        });
        
        // Create shipment items table for individual items in a shipment
        Schema::create('shipment_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipment_id')->constrained()->onDelete('cascade');
            $table->foreignId('order_item_id')->constrained()->onDelete('cascade');
            $table->integer('quantity');
            $table->decimal('weight', 10, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipment_items');
        Schema::dropIfExists('shipments');
    }
};
