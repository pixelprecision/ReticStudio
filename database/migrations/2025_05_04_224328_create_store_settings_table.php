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
        Schema::create('store_settings', function (Blueprint $table) {
            $table->id();
            $table->boolean('enable_store')->default(false);
            $table->string('store_name')->nullable();
            $table->string('store_email')->nullable();
            $table->string('store_phone')->nullable();
            $table->text('store_address')->nullable();
            $table->string('store_city')->nullable();
            $table->string('store_state')->nullable();
            $table->string('store_postal_code')->nullable();
            $table->string('store_country')->nullable();
            $table->string('store_currency')->default('USD');
            $table->string('currency_symbol')->default('$');
            $table->string('currency_position')->default('left');
            $table->string('price_thousand_separator')->default(',');
            $table->string('price_decimal_separator')->default('.');
            $table->unsignedInteger('price_number_of_decimals')->default(2);
            $table->string('weight_unit')->default('lb');
            $table->string('dimension_unit')->default('in');
            $table->boolean('enable_taxes')->default(false);
            $table->string('tax_calculation')->default('auto');
            $table->decimal('tax_rate', 5, 2)->default(0);
            $table->boolean('prices_include_tax')->default(false);
            $table->string('tax_calculations_based_on')->default('billing');
            $table->boolean('enable_shipping')->default(true);
            $table->string('shipping_calculation_method')->nullable();
            $table->boolean('enable_customer_accounts')->default(true);
            $table->boolean('enable_guest_checkout')->default(true);
            $table->json('order_status_options')->nullable();
            $table->string('default_order_status')->default('pending');
            $table->string('order_prefix')->default('ORD-');
            $table->string('invoice_prefix')->default('INV-');
            $table->boolean('enable_reviews')->default(true);
            $table->boolean('allow_anonymous_reviews')->default(false);
            $table->boolean('require_review_approval')->default(true);
            $table->boolean('enable_coupons')->default(true);
            $table->text('terms_and_conditions')->nullable();
            $table->text('privacy_policy')->nullable();
            $table->text('shipping_policy')->nullable();
            $table->text('return_policy')->nullable();
            $table->string('store_logo')->nullable();
            $table->string('store_favicon')->nullable();
            $table->json('social_media_links')->nullable();
            $table->string('seo_title_format')->nullable();
            $table->text('seo_meta_description')->nullable();
            $table->string('google_analytics_id')->nullable();
            $table->string('facebook_pixel_id')->nullable();
            $table->string('inventory_management')->default('track');
            $table->unsignedInteger('low_stock_threshold')->default(5);
            $table->string('out_of_stock_visibility')->default('show');
            $table->string('out_of_stock_behaviour')->default('prevent_sales');
            $table->string('date_format')->default('MM/DD/YYYY');
            $table->string('time_format')->default('h:mm a');
            $table->string('timezone')->default('UTC');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('store_settings');
    }
};