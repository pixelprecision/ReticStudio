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
        // Add deleted_at to product_brands table
        if (Schema::hasTable('product_brands') && !Schema::hasColumn('product_brands', 'deleted_at')) {
            Schema::table('product_brands', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        // Add deleted_at to product_categories table
        if (Schema::hasTable('product_categories') && !Schema::hasColumn('product_categories', 'deleted_at')) {
            Schema::table('product_categories', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        // Add deleted_at to product_images table
        if (Schema::hasTable('product_images') && !Schema::hasColumn('product_images', 'deleted_at')) {
            Schema::table('product_images', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        // Add deleted_at to customers table
        if (Schema::hasTable('customers') && !Schema::hasColumn('customers', 'deleted_at')) {
            Schema::table('customers', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        // Add deleted_at to shipping_methods table
        if (Schema::hasTable('shipping_methods') && !Schema::hasColumn('shipping_methods', 'deleted_at')) {
            Schema::table('shipping_methods', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        // Add deleted_at to product_reviews table
        if (Schema::hasTable('product_reviews') && !Schema::hasColumn('product_reviews', 'deleted_at')) {
            Schema::table('product_reviews', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        // Add deleted_at to taxes table
        if (Schema::hasTable('taxes') && !Schema::hasColumn('taxes', 'deleted_at')) {
            Schema::table('taxes', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        // Add deleted_at to coupons table
        if (Schema::hasTable('coupons') && !Schema::hasColumn('coupons', 'deleted_at')) {
            Schema::table('coupons', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        // Add deleted_at to customer_addresses table
        if (Schema::hasTable('customer_addresses') && !Schema::hasColumn('customer_addresses', 'deleted_at')) {
            Schema::table('customer_addresses', function (Blueprint $table) {
                $table->softDeletes();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove deleted_at from product_brands table
        if (Schema::hasTable('product_brands') && Schema::hasColumn('product_brands', 'deleted_at')) {
            Schema::table('product_brands', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }

        // Remove deleted_at from product_categories table
        if (Schema::hasTable('product_categories') && Schema::hasColumn('product_categories', 'deleted_at')) {
            Schema::table('product_categories', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }

        // Remove deleted_at from product_images table
        if (Schema::hasTable('product_images') && Schema::hasColumn('product_images', 'deleted_at')) {
            Schema::table('product_images', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }

        // Remove deleted_at from customers table
        if (Schema::hasTable('customers') && Schema::hasColumn('customers', 'deleted_at')) {
            Schema::table('customers', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }

        // Remove deleted_at from shipping_methods table
        if (Schema::hasTable('shipping_methods') && Schema::hasColumn('shipping_methods', 'deleted_at')) {
            Schema::table('shipping_methods', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }

        // Remove deleted_at from product_reviews table
        if (Schema::hasTable('product_reviews') && Schema::hasColumn('product_reviews', 'deleted_at')) {
            Schema::table('product_reviews', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }

        // Remove deleted_at from taxes table
        if (Schema::hasTable('taxes') && Schema::hasColumn('taxes', 'deleted_at')) {
            Schema::table('taxes', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }

        // Remove deleted_at from coupons table
        if (Schema::hasTable('coupons') && Schema::hasColumn('coupons', 'deleted_at')) {
            Schema::table('coupons', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }

        // Remove deleted_at from customer_addresses table
        if (Schema::hasTable('customer_addresses') && Schema::hasColumn('customer_addresses', 'deleted_at')) {
            Schema::table('customer_addresses', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }
    }
};
