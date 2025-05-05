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
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cart_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->nullable()->constrained()->onDelete('cascade');
            
            // Item details
            $table->string('name');
            $table->string('sku')->nullable();
            $table->integer('quantity')->default(1);
            $table->json('options')->nullable(); // For product variants
            
            // Pricing
            $table->decimal('price', 10, 2)->default(0);
            $table->decimal('original_price', 10, 2)->default(0); // Before discounts
            $table->decimal('subtotal', 10, 2)->default(0); // price * quantity
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('total', 10, 2)->default(0); // (price * quantity) + tax - discount
            
            // Purchase options
            $table->boolean('is_gift')->default(false);
            $table->text('gift_message')->nullable();
            $table->string('gift_wrapping')->nullable();
            
            // Other metadata
            $table->json('custom_fields')->nullable(); // For any additional data
            $table->boolean('is_custom_item')->default(false); // For custom items not linked to products
            
            $table->timestamps();
            
            // Create index for faster lookups
            $table->index(['cart_id', 'product_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cart_items');
    }
};
