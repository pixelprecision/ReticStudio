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
        if (Schema::hasTable('product_categories')) {
            Schema::table('product_categories', function (Blueprint $table) {
                // Add missing columns from ProductCategory model
                if (!Schema::hasColumn('product_categories', 'is_featured')) {
                    $table->boolean('is_featured')->default(false);
                }
                
                // Add soft deletes if it doesn't exist
                if (!Schema::hasColumn('product_categories', 'deleted_at')) {
                    $table->softDeletes();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('product_categories')) {
            Schema::table('product_categories', function (Blueprint $table) {
                $table->dropColumn([
                    'is_featured', 
                    'deleted_at'
                ]);
            });
        }
    }
};