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
        Schema::create('discounts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique()->nullable(); // For coupon codes
            $table->text('description')->nullable();
            
            // Discount type and value
            $table->enum('type', [
                'percentage', 
                'fixed_amount', 
                'free_shipping', 
                'buy_x_get_y', 
                'free_item'
            ])->default('percentage');
            $table->decimal('value', 10, 2)->default(0); // Percentage or amount
            
            // Discount conditions
            $table->decimal('minimum_order_amount', 10, 2)->nullable();
            $table->integer('minimum_quantity')->nullable();
            $table->json('applicable_products')->nullable(); // Product IDs this discount applies to
            $table->json('applicable_categories')->nullable(); // Category IDs this discount applies to
            $table->json('excluded_products')->nullable();
            $table->json('excluded_categories')->nullable();
            
            // Usage limits
            $table->integer('usage_limit')->nullable(); // Total number of times this can be used
            $table->integer('usage_limit_per_user')->nullable(); // Number of times per user
            $table->integer('usage_count')->default(0); // How many times it has been used
            
            // Validity
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->boolean('is_active')->default(true);
            
            // BOGO (Buy One Get One) specific fields
            $table->integer('buy_quantity')->nullable(); // Buy X quantity
            $table->integer('get_quantity')->nullable(); // Get Y quantity
            $table->decimal('get_discount_percentage', 5, 2)->nullable(); // Discount percentage on the "get" items
            
            // Targeting
            $table->json('customer_groups')->nullable(); // Customer groups this applies to
            $table->json('included_customers')->nullable(); // Specific customer IDs
            $table->json('excluded_customers')->nullable(); // Specific customer IDs to exclude
            
            // Additional options
            $table->boolean('apply_once')->default(false); // Apply discount only once per cart
            $table->boolean('combinable')->default(true); // Can be combined with other discounts
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('discounts');
    }
};
