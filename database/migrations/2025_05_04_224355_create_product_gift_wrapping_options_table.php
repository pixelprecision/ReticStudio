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
        // First create the gift wrapping options table
        Schema::create('gift_wrapping_options', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->string('image')->nullable();
            $table->string('preview_image')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->boolean('allow_gift_message')->default(true);
            $table->timestamps();
        });
        
        // Then create the product-specific gift wrapping settings
        Schema::create('product_gift_wrapping_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->enum('gift_wrapping_type', ['all', 'none', 'specific'])->default('all');
            $table->timestamps();
        });
        
        // Finally create the relationship table for products with specific wrapping options
        Schema::create('product_gift_wrapping_relationships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('gift_wrapping_option_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            
            // Each wrapping option can only be linked once to each product
            $table->unique(['product_id', 'gift_wrapping_option_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_gift_wrapping_relationships');
        Schema::dropIfExists('product_gift_wrapping_options');
        Schema::dropIfExists('gift_wrapping_options');
    }
};
