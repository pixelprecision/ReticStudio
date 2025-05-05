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
        Schema::create('carts', function (Blueprint $table) {
            $table->id();
            $table->string('session_id')->unique()->nullable(); // For guest carts
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade'); // For registered users
            
            // Cart metadata
            $table->string('currency')->default('USD');
            $table->string('locale')->default('en');
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            
            // Status and tracking
            $table->boolean('is_active')->default(true);
            $table->boolean('is_guest')->default(true);
            $table->enum('status', ['active', 'merged', 'abandoned', 'converted'])->default('active');
            
            // Totals
            $table->decimal('items_total', 10, 2)->default(0);
            $table->decimal('shipping_total', 10, 2)->default(0);
            $table->decimal('tax_total', 10, 2)->default(0);
            $table->decimal('discount_total', 10, 2)->default(0);
            $table->decimal('grand_total', 10, 2)->default(0);
            
            // Coupons and discounts
            $table->string('coupon_code')->nullable();
            
            // Selected shipping
            $table->string('shipping_method')->nullable();
            
            // Customer information
            $table->string('email')->nullable();
            
            // Order conversion
            $table->foreignId('order_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamp('converted_at')->nullable();
            
            // Timestamps with soft deletes for abandoned cart recovery
            $table->timestamps();
            $table->softDeletes();
            
            // Create indexes
            $table->index(['user_id', 'is_active']);
            $table->index(['session_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('carts');
    }
};
