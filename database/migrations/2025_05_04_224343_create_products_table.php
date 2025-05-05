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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->unsignedBigInteger('brand_id')->nullable();
            
            // Product type and identification
            $table->enum('product_type', ['physical', 'digital'])->default('physical');
            $table->string('sku')->nullable()->unique();
            $table->string('barcode')->nullable();
            
            // Pricing
            $table->decimal('default_price', 10, 2)->default(0);
            $table->decimal('cost', 10, 2)->nullable();
            $table->decimal('msrp', 10, 2)->nullable(); // Retail price
            $table->decimal('sale_price', 10, 2)->nullable();
            
            // Physical attributes
            $table->decimal('weight', 10, 2)->nullable();
            $table->decimal('width', 10, 2)->nullable();
            $table->decimal('height', 10, 2)->nullable();
            $table->decimal('depth', 10, 2)->nullable();
            
            // Shipping fields
            $table->boolean('free_shipping')->default(false);
            $table->decimal('fixed_shipping_price', 10, 2)->nullable();
            $table->string('origin_location')->nullable();
            $table->json('dimension_rules')->nullable();
            
            // Availability
            $table->enum('availability', ['available', 'preorder', 'unavailable'])->default('available');
            $table->enum('stock_status', ['in_stock', 'out_of_stock', 'coming_soon'])->default('in_stock');
            
            // Other details
            $table->string('bin_picking_number')->nullable();
            $table->text('warranty_information')->nullable();
            $table->string('template_page')->default('default');
            $table->text('search_keywords')->nullable();
            $table->boolean('is_visible')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->enum('gift_wrapping', ['all', 'none', 'specific'])->default('all');
            $table->integer('sort_order')->default(0);
            $table->enum('condition', ['new', 'used', 'refurbished'])->default('new');
            $table->integer('min_purchase_qty')->default(1);
            $table->integer('max_purchase_qty')->nullable();
            
            // SEO fields
            $table->enum('seo_object_type', ['product', 'album', 'book', 'drink', 'food', 'game', 'movie', 'song', 'tv_show', 'video'])->default('product');
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->string('seo_image')->nullable();
            
            // Inventory
            $table->boolean('track_inventory')->default(true);
            $table->integer('inventory_level')->default(0);
            $table->integer('inventory_warning_level')->default(5);
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
