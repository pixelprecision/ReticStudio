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
        if (Schema::hasTable('product_brands')) {
            Schema::table('product_brands', function (Blueprint $table) {
                // Add soft deletes if it doesn't exist
                if (!Schema::hasColumn('product_brands', 'deleted_at')) {
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
        if (Schema::hasTable('product_brands')) {
            Schema::table('product_brands', function (Blueprint $table) {
                $table->dropColumn('deleted_at');
            });
        }
    }
};