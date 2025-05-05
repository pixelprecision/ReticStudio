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
        // Add deleted_at column to OrderItem
        if (Schema::hasTable('order_items') && !Schema::hasColumn('order_items', 'deleted_at')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        // Add deleted_at column to Cart
        if (Schema::hasTable('carts') && !Schema::hasColumn('carts', 'deleted_at')) {
            Schema::table('carts', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        // Add deleted_at column to CartItem
        if (Schema::hasTable('cart_items') && !Schema::hasColumn('cart_items', 'deleted_at')) {
            Schema::table('cart_items', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        // Add deleted_at column to ProductSpecification
        if (Schema::hasTable('product_specifications') && !Schema::hasColumn('product_specifications', 'deleted_at')) {
            Schema::table('product_specifications', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        // Add deleted_at column to ProductReviewImage
        if (Schema::hasTable('product_review_images') && !Schema::hasColumn('product_review_images', 'deleted_at')) {
            Schema::table('product_review_images', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        // Add deleted_at column to Transaction
        if (Schema::hasTable('transactions') && !Schema::hasColumn('transactions', 'deleted_at')) {
            Schema::table('transactions', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        // Add deleted_at column to StoreSetting
        if (Schema::hasTable('store_settings') && !Schema::hasColumn('store_settings', 'deleted_at')) {
            Schema::table('store_settings', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        // Add deleted_at column to ProductVideo
        if (Schema::hasTable('product_videos') && !Schema::hasColumn('product_videos', 'deleted_at')) {
            Schema::table('product_videos', function (Blueprint $table) {
                $table->softDeletes();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove deleted_at column from OrderItem
        if (Schema::hasTable('order_items') && Schema::hasColumn('order_items', 'deleted_at')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }

        // Remove deleted_at column from Cart
        if (Schema::hasTable('carts') && Schema::hasColumn('carts', 'deleted_at')) {
            Schema::table('carts', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }

        // Remove deleted_at column from CartItem
        if (Schema::hasTable('cart_items') && Schema::hasColumn('cart_items', 'deleted_at')) {
            Schema::table('cart_items', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }

        // Remove deleted_at column from ProductSpecification
        if (Schema::hasTable('product_specifications') && Schema::hasColumn('product_specifications', 'deleted_at')) {
            Schema::table('product_specifications', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }

        // Remove deleted_at column from ProductReviewImage
        if (Schema::hasTable('product_review_images') && Schema::hasColumn('product_review_images', 'deleted_at')) {
            Schema::table('product_review_images', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }

        // Remove deleted_at column from Transaction
        if (Schema::hasTable('transactions') && Schema::hasColumn('transactions', 'deleted_at')) {
            Schema::table('transactions', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }

        // Remove deleted_at column from StoreSetting
        if (Schema::hasTable('store_settings') && Schema::hasColumn('store_settings', 'deleted_at')) {
            Schema::table('store_settings', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }

        // Remove deleted_at column from ProductVideo
        if (Schema::hasTable('product_videos') && Schema::hasColumn('product_videos', 'deleted_at')) {
            Schema::table('product_videos', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }
    }
};