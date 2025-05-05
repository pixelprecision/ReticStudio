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
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->nullable()->constrained()->onDelete('set null');
            
            // Item details
            $table->string('name');
            $table->string('sku')->nullable();
            $table->integer('quantity')->default(1);
            
            // Pricing
            $table->decimal('price', 10, 2);
            $table->decimal('base_price', 10, 2); // Original price before discounts
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('subtotal', 10, 2); // price * quantity
            $table->decimal('total', 10, 2); // (price * quantity) + tax - discount
            
            // Variant information
            $table->json('options')->nullable(); // For product variants
            
            // Product details at time of purchase (in case product is deleted or changed)
            $table->text('product_details')->nullable(); // Serialized product data
            $table->decimal('weight', 10, 2)->nullable();
            
            // Refund and return tracking
            $table->boolean('is_refunded')->default(false);
            $table->decimal('refunded_amount', 10, 2)->default(0);
            $table->integer('returned_quantity')->default(0);
            
            // Digital products
            $table->boolean('is_digital')->default(false);
            $table->boolean('is_downloaded')->default(false);
            $table->integer('download_count')->default(0);
            $table->timestamp('last_download')->nullable();
            
            // Gift options at item level
            $table->boolean('is_gift')->default(false);
            $table->text('gift_message')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
