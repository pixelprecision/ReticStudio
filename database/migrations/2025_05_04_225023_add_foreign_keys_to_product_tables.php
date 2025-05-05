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
        // Add foreign key to products table for brand_id
        Schema::table('products', function (Blueprint $table) {
            $table->foreign('brand_id')
                  ->references('id')
                  ->on('product_brands')
                  ->onDelete('set null');
        });
		
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove foreign keys in reverse order
        Schema::table('product_reviews', function (Blueprint $table) {
            if (Schema::hasColumn('product_reviews', 'order_id')) {
                $table->dropForeign(['order_id']);
            }
        });
        
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['brand_id']);
        });
    }
};
