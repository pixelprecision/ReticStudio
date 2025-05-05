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
        Schema::create('shipping_methods', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->enum('type', ['flat_rate', 'free', 'price_based', 'weight_based', 'custom'])->default('flat_rate');
            $table->decimal('base_cost', 10, 2)->default(0);
            $table->decimal('minimum_order_amount', 10, 2)->nullable();
            $table->json('price_tiers')->nullable(); // For price-based shipping
            $table->json('weight_tiers')->nullable(); // For weight-based shipping
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->string('carrier')->nullable(); // UPS, FedEx, USPS, etc.
            $table->string('carrier_code')->nullable();
            $table->json('supported_countries')->nullable(); // Countries this method is available for
            $table->json('excluded_countries')->nullable(); // Countries this method is not available for
            $table->boolean('is_taxable')->default(false);
            $table->decimal('handling_fee', 10, 2)->default(0);
            $table->integer('estimated_delivery_days')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipping_methods');
    }
};
