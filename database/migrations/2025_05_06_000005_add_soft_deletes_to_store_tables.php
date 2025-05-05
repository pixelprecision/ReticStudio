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
        // Add soft delete to remaining store tables that need it
        $tables = [
            'carts',
            'cart_items',
            'order_items',
            'product_reviews',
            'product_variants',
            'product_attributes',
            'product_specifications',
            'product_images',
            'product_videos',
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table) && !Schema::hasColumn($table, 'deleted_at')) {
                Schema::table($table, function (Blueprint $table) {
                    $table->softDeletes();
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = [
            'carts',
            'cart_items',
            'order_items',
            'product_reviews',
            'product_variants',
            'product_attributes',
            'product_specifications',
            'product_images',
            'product_videos',
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'deleted_at')) {
                Schema::table($table, function (Blueprint $table) {
                    $table->dropColumn('deleted_at');
                });
            }
        }
    }
};