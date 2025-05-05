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
        Schema::create('product_variant_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_variant_id')->constrained()->onDelete('cascade');
            $table->string('label');
            $table->string('value');
            $table->decimal('price_adjustment', 10, 2)->default(0);
            $table->decimal('sale_price', 10, 2)->nullable();
            $table->string('image_url')->nullable(); // For swatch or option image
            $table->boolean('is_default')->default(false);
            $table->integer('sort_order')->default(0);
            $table->integer('inventory_level')->nullable();
            $table->string('sku_suffix')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_variant_options');
    }
};
